// routes/generate.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
// Тимчасово коментуємо embedding до встановлення pgvector
// const { getEmbedding } = require('../services/embedding');
const { extractBusinessType } = require('../utils/classify');
const { extractExplicitColors, contrast } = require('../utils/colors');
const PRESETS = require('../utils/presets');
const { applyTheme } = require('../utils/theme');
// Тимчасово коментуємо до встановлення pgvector
// const { searchTemplates } = require('../services/templates');

function hasColorIntent(text) {
  return /(фон|background|текст|text|color|колір|червоний|синій|зелений|жовтий|red|blue|green|yellow)/i.test(text);
}

// Простий пошук шаблонів без embedding
async function searchTemplatesByKeywords(pool, category, userText) {
  try {
    let query = 'SELECT * FROM templates';
    let params = [];
    
    if (category) {
      query += ' WHERE category = $1';
      params.push(category);
    }
    
    query += ' ORDER BY created_at DESC LIMIT 5';
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      // Якщо немає шаблонів по категорії, беремо будь-який
      const fallbackResult = await pool.query('SELECT * FROM templates ORDER BY created_at DESC LIMIT 1');
      return fallbackResult.rows[0] || null;
    }
    
    // Простий пошук по ключовим словам
    const userWords = userText.toLowerCase().split(/\s+/);
    let bestTemplate = result.rows[0];
    let bestScore = 0;
    
    for (const template of result.rows) {
      const templateKeywords = (template.keywords || '').toLowerCase();
      let score = 0;
      
      for (const word of userWords) {
        if (word.length > 2 && templateKeywords.includes(word)) {
          score++;
        }
      }
      
      if (score > bestScore) {
        bestScore = score;
        bestTemplate = template;
      }
    }
    
    return bestTemplate;
  } catch (error) {
    console.error('Error searching templates:', error);
    throw error;
  }
}

router.post('/', async (req, res) => {
  try {
    const { description = '', keywords = [], brandName = '', preset = 'default' } = req.body;
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

    let category = extractBusinessType(userText);
    console.log('Extracted category:', category);

    // Використовуємо простий пошук замість embedding
    let template = await searchTemplatesByKeywords(pool, category, userText);
    console.log('Template by category:', category, template ? template.id : 'NOT FOUND');

    if (!template) {
      console.log('Fallback to any available template');
      template = await searchTemplatesByKeywords(pool, null, userText);
      console.log('Template by fallback:', template ? template.id : 'NOT FOUND');
    }

    if (!template) {
      console.log('No templates found in database');
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
      let text = userColors.text ?? contrast(bg);
      if (text === bg) text = contrast(bg);
      const accent = bg;
      const buttonText = contrast(accent);
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
      let text = userColors.text ?? contrast(bg);
      if (text === bg) text = contrast(bg);
      const accent = bg;
      const buttonText = contrast(accent);
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
