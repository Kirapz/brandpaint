// routes/generate.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { getEmbedding } = require('../services/embedding');
const { extractBusinessType, extractBusinessTypes } = require('../utils/classify');
const { extractExplicitColors, contrast, getBetterContrast } = require('../utils/colors');
const PRESETS = require('../utils/presets');
const { applyTheme } = require('../utils/theme');
const { searchTemplates } = require('../services/templates');

function hasColorIntent(text) {
  return /(фон|background|текст|text|color|колір|червоний|синій|зелений|жовтий|red|blue|green|yellow)/i.test(text);
}

// Гібридний пошук: embedding + scoring система
async function hybridTemplateSearch(pool, categories, userText) {
  try {
    console.log('Starting hybrid search for categories:', categories);
    
    // Спочатку пробуємо embedding пошук з timeout
    let embeddingResults = [];
    try {
      console.log('Attempting embedding search...');
      const embeddingPromise = searchTemplates(pool, userText, 10);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Embedding timeout')), 10000) // 10s timeout
      );
      
      embeddingResults = await Promise.race([embeddingPromise, timeoutPromise]);
      console.log(`✅ Embedding search returned ${embeddingResults.length} results`);
    } catch (embeddingError) {
      console.warn('⚠️ Embedding search failed, using keyword-only search:', embeddingError.message);
      // Fallback: отримуємо всі шаблони для keyword search
      const allTemplatesResult = await pool.query('SELECT * FROM templates ORDER BY created_at DESC');
      embeddingResults = allTemplatesResult.rows;
      console.log(`Using ${embeddingResults.length} templates for keyword search`);
    }
    
    if (embeddingResults.length === 0) {
      console.log('No templates found in database');
      return null;
    }
    
    // Підготавливаємо слова для scoring
    const userWords = userText.toLowerCase()
      .split(/[\s,]+/)
      .map(w => w.trim())
      .filter(w => w.length > 2);
    
    console.log('User words for scoring:', userWords);
    
    // Застосовуємо scoring до результатів
    const scoredTemplates = embeddingResults.map(template => {
      let score = template.similarity || 0; // Базовий score від embedding (якщо є)
      const templateName = (template.name || '').toLowerCase();
      const templateKeywords = (template.keywords || '').toLowerCase();
      const templateCategory = template.category || '';
      
      // +3 балла якщо категорія співпала (збільшили з 2)
      if (categories.includes(templateCategory)) {
        score += 3;
      }
      
      // Перевіряємо кожне слово користувача
      for (const word of userWords) {
        // +2 балла якщо слово є в назві шаблону
        if (templateName.includes(word)) {
          score += 2;
        }
        
        // +1 бал якщо слово є в ключових словах
        if (templateKeywords.includes(word)) {
          score += 1;
        }
      }
      
      // Додатковий бонус для coffee/кава → coffee shop
      if ((userText.includes('кава') || userText.includes('coffee')) && 
          (templateName.includes('coffee') || templateKeywords.includes('coffee'))) {
        score += 3;
      }
      
      return { ...template, finalScore: score };
    });
    
    // Сортуємо по фінальному score (по убуванню)
    scoredTemplates.sort((a, b) => b.finalScore - a.finalScore);
    
    console.log('Top 5 templates by hybrid score:');
    scoredTemplates.slice(0, 5).forEach(t => {
      console.log(`- ${t.name} (${t.category}): ${t.finalScore} points`);
    });
    
    // Повертаємо найкращий шаблон
    const bestTemplate = scoredTemplates[0];
    console.log(`✅ Selected template: ${bestTemplate.name} with final score ${bestTemplate.finalScore}`);
    
    return bestTemplate;
    
  } catch (error) {
    console.error('❌ Error in hybrid search:', error);
    throw error;
  }
}

router.post('/', async (req, res) => {
  try {
    const { description = '', keywords = [], brandName = '', preset = 'default', templateId } = req.body;
    
    // 🔥 Якщо запит з історії або є templateId - швидко повертаємо шаблон
    if (templateId) {
      console.log('Fast path: loading template by ID:', templateId);
      const result = await pool.query('SELECT * FROM templates WHERE id = $1', [templateId]);
      if (result.rows.length) {
        const template = result.rows[0];
        return res.json({
          success: true,
          data: {
            html: template.html_content,
            css: template.css_content
          }
        });
      }
    }
    
    const userText = `${description} ${keywords.join(' ')}`.trim();

    console.log('\n=== NEW QUERY ===');
    console.log('User text:', userText);
    console.log('Brand name:', brandName);
    console.log('Preset requested:', preset);
    console.log('Keywords:', keywords);

    // Перевіряємо чи є підключення до БД
    try {
      await pool.query('SELECT 1');
      console.log('Database connection OK');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return res.status(500).json({ 
        success: false, 
        error: 'Database connection failed. Please try again later.' 
      });
    }

    let categories = extractBusinessTypes(userText);
    console.log('Extracted categories:', categories);

    // Використовуємо гібридний пошук: embedding + scoring
    let template = await hybridTemplateSearch(pool, categories, userText);
    console.log('Selected template:', template ? `${template.name} (${template.category})` : 'NOT FOUND');

    if (!template) {
      console.log('No templates found in database at all');
      return res.status(404).json({ 
        success: false, 
        error: 'No suitable template found. Please try different keywords or contact support.' 
      });
    }

    const finalBrandName = brandName?.trim() || keywords.find(k => k && k.length > 1) || description.split(/\s+/).find(w => w.length > 1) || 'My Brand';
    console.log('Final brand name:', finalBrandName);

    const html = template.html_content.replace(/{{BRAND_NAME}}/g, finalBrandName).replace(/{{DESCRIPTION}}/g, description || '');

    // Визначення кольорів
    const colorIntent = hasColorIntent(userText);
    console.log('Has color intent:', colorIntent);

    const userColors = extractExplicitColors(userText);
    console.log('Extracted colors:', userColors);

    // default preset: якщо в запиті немає color intent — повний original css
    if (!preset || preset === 'default') {
      if (!colorIntent) {
        console.log('No color intent, returning original template CSS');
        return res.json({ success: true, data: { html, css: template.css_content } });
      }
      // є intent — застосувати тільки кольори (без preset styles)
      const bg = userColors.bg ?? '#ffffff';
      let text = userColors.text ?? getBetterContrast(bg);
      
      // Якщо текст і фон однакові, використовуємо автоматичний контраст
      if (text === bg) {
        text = contrast(bg);
      }
      
      const accent = bg;
      const buttonText = getBetterContrast(accent);
      const palette = { bg, text, accent, buttonText };
      console.log('Palette applied (default preset with color intent):', palette);

      const css = applyTheme(template.css_content, palette, {});
      return res.json({ success: true, data: { html, css } });
    }

    // non-default presets
    let palette;
    if (!colorIntent) {
      palette = { bg: '#ffffff', text: '#020617', accent: '#020617', buttonText: '#020617' };
    } else {
      const bg = userColors.bg ?? '#ffffff';
      let text = userColors.text ?? getBetterContrast(bg);
      
      // Якщо текст і фон однакові, використовуємо автоматичний контраст
      if (text === bg) {
        text = contrast(bg);
      }
      
      const accent = bg;
      const buttonText = getBetterContrast(accent);
      palette = { bg, text, accent, buttonText };
    }
    console.log('Final palette for non-default preset:', palette);

    const presetStyles = PRESETS[preset] || PRESETS.corporate;
    console.log('Using preset styles:', preset, presetStyles ? Object.keys(presetStyles) : 'DEFAULT');

    const css = applyTheme(template.css_content, palette, presetStyles);

    return res.json({ success: true, data: { html, css } });

  } catch (e) {
    console.error('Error in /generate:', e);
    
    // Детальніша обробка помилок
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (e.message.includes('database') || e.message.includes('pool')) {
      errorMessage = 'Database connection error. Please try again later.';
    } else if (e.message.includes('embedding')) {
      errorMessage = 'Failed to process your request. Please try with different keywords.';
    } else if (e.message.includes('template')) {
      errorMessage = 'Template processing error. Please try again.';
      statusCode = 404;
    }
    
    res.status(statusCode).json({ 
      success: false, 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? e.message : undefined
    });
  }
});

module.exports = router;
