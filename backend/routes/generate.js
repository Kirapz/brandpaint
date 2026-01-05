// routes/generate.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { extractBusinessTypes } = require('../utils/classify');
const { extractExplicitColors, contrast, getBetterContrast } = require('../utils/colors');
const PRESETS = require('../utils/presets');
const { applyTheme } = require('../utils/theme');
const { searchTemplates } = require('../services/templates');

// Embedding cache для пришвидшення
const embeddingCache = new Map();

async function cachedSearchTemplates(pool, text) {
  if (embeddingCache.has(text)) {
    console.log('✅ Cache hit');
    return embeddingCache.get(text);
  }
  
  const result = await searchTemplates(pool, text, 10);
  embeddingCache.set(text, result);
  
  // Обмежуємо розмір кешу
  if (embeddingCache.size > 100) {
    const firstKey = embeddingCache.keys().next().value;
    embeddingCache.delete(firstKey);
  }
  
  return result;
}

function hasColorIntent(text) {
  return /(фон|background|текст|text|color|колір|червоний|синій|зелений|жовтий|red|blue|green|yellow)/i.test(text);
}

// Окрема функція для scoring
function scoreAndSelectTemplate(templates, categories, userText) {
  const userWords = userText.toLowerCase()
    .split(/[\s,]+/)
    .map(w => w.trim())
    .filter(w => w.length > 2);
  
  // Рахуємо частоту слів
  const wordFreq = {};
  userWords.forEach(w => wordFreq[w] = (wordFreq[w] || 0) + 1);
  
  const scoredTemplates = templates.map(template => {
    let score = template.similarity || 0;
    const templateName = (template.name || '').toLowerCase();
    const templateKeywords = (template.keywords || '').toLowerCase();
    const templateCategory = template.category || '';
    
    // +3 бали за категорію
    if (categories.includes(templateCategory)) {
      score += 3;
    }
    
    // Перевіряємо слова з врахуванням частоти
    for (const word of Object.keys(wordFreq)) {
      const freq = wordFreq[word];
      
      if (templateName.includes(word)) {
        score += 2 * freq;
      }
      
      if (templateKeywords.includes(word)) {
        score += 1 * freq;
      }
    }
    
    // Бонуси для специфічних слів
    if ((userText.includes('кава') || userText.includes('coffee')) && 
        (templateName.includes('coffee') || templateKeywords.includes('coffee'))) {
      score += 3;
    }
    
    if ((userText.includes('спорт') || userText.includes('фітнес')) && 
        (templateName.includes('fitness') || templateName.includes('gym'))) {
      score += 3;
    }
    
    return { ...template, finalScore: score };
  });
  
  // Стабільне сортування
  scoredTemplates.sort((a, b) => {
    if (b.finalScore !== a.finalScore) {
      return b.finalScore - a.finalScore;
    }
    return (b.similarity || 0) - (a.similarity || 0);
  });
  
  console.log('🏆 Top 3:', scoredTemplates.slice(0, 3).map(t => 
    `${t.name} (${t.category}): ${t.finalScore}`
  ));
  
  return scoredTemplates[0];
}

// Гібридний пошук: embedding + scoring система
async function hybridTemplateSearch(pool, categories, userText) {
  try {
    console.log('🔍 Search:', categories);
    
    // Пропускаємо embedding для дуже коротких текстів
    if (userText.length < 5) {
      console.log('⚠️ Text too short, keyword-only');
      const result = await pool.query(
        'SELECT id, name, category, keywords, html_content, css_content FROM templates LIMIT 30'
      );
      return scoreAndSelectTemplate(result.rows, categories, userText);
    }
    
    // Спочатку пробуємо embedding з timeout і кешем
    let embeddingResults = [];
    try {
      const embeddingPromise = cachedSearchTemplates(pool, userText);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Embedding timeout')), 10000)
      );
      
      embeddingResults = await Promise.race([embeddingPromise, timeoutPromise]);
      console.log(`✅ Embedding: ${embeddingResults.length}`);
    } catch (embeddingError) {
      console.warn('⚠️ Embedding failed, keyword search');
      const result = await pool.query(
        'SELECT id, name, category, keywords, html_content, css_content FROM templates LIMIT 30'
      );
      embeddingResults = result.rows;
    }
    
    if (embeddingResults.length === 0) {
      return null;
    }
    
    return scoreAndSelectTemplate(embeddingResults, categories, userText);
    
  } catch (error) {
    console.error('❌ Search error:', error);
    throw error;
  }
}

router.post('/', async (req, res) => {
  try {
    const { description = '', keywords = [], brandName = '', preset = 'default', templateId } = req.body;
    
    // 🔥 ШВИДКИЙ ШЛЯХ: якщо є templateId - повертаємо одразу
    if (templateId) {
      console.log('⚡ Fast path: ID', templateId);
      const result = await pool.query(
        'SELECT html_content, css_content FROM templates WHERE id = $1',
        [templateId]
      );
      if (result.rows.length) {
        return res.json({
          success: true,
          data: {
            html: result.rows[0].html_content,
            css: result.rows[0].css_content
          }
        });
      }
    }
    
    const userText = `${description} ${keywords.join(' ')}`.trim();
    console.log('\n=== QUERY ===');
    console.log('Text:', userText.substring(0, 50));
    console.log('Brand:', brandName);

    let categories = extractBusinessTypes(userText);
    console.log('Categories:', categories);

    // Використовуємо гібридний пошук
    let template = await hybridTemplateSearch(pool, categories, userText);

    if (!template) {
      return res.status(404).json({ 
        success: false, 
        error: 'No suitable template found.' 
      });
    }

    const finalBrandName = brandName?.trim() || keywords.find(k => k && k.length > 1) || description.split(/\s+/).find(w => w.length > 1) || 'My Brand';

    const html = template.html_content.replace(/{{BRAND_NAME}}/g, finalBrandName).replace(/{{DESCRIPTION}}/g, description || '');

    // Визначення кольорів
    const colorIntent = hasColorIntent(userText);
    const userColors = extractExplicitColors(userText);
    
    // Виправлення однакових кольорів фону і тексту
    if (userColors.bg && userColors.text && userColors.bg === userColors.text) {
      userColors.text = getBetterContrast(userColors.bg);
    }

    // default preset: якщо в запиті немає color intent — повний original css
    if (!preset || preset === 'default') {
      if (!colorIntent) {
        return res.json({ success: true, data: { html, css: template.css_content } });
      }
      const bg = userColors.bg ?? '#ffffff';
      let text = userColors.text ?? getBetterContrast(bg);
      
      if (text === bg) {
        text = contrast(bg);
      }
      
      const accent = bg;
      const buttonText = getBetterContrast(accent);
      const palette = { bg, text, accent, buttonText };

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
      
      if (text === bg) {
        text = contrast(bg);
      }
      
      const accent = bg;
      const buttonText = getBetterContrast(accent);
      palette = { bg, text, accent, buttonText };
    }

    const presetStyles = PRESETS[preset] || PRESETS.corporate;
    const css = applyTheme(template.css_content, palette, presetStyles);

    return res.json({ success: true, data: { html, css } });

  } catch (e) {
    console.error('Error:', e.message);
    
    let errorMessage = 'Internal server error';
    let statusCode = 500;
    
    if (e.message.includes('database') || e.message.includes('pool')) {
      errorMessage = 'Database connection error.';
    } else if (e.message.includes('template')) {
      errorMessage = 'Template processing error.';
      statusCode = 404;
    }
    
    res.status(statusCode).json({ 
      success: false, 
      error: errorMessage
    });
  }
});

module.exports = router;
