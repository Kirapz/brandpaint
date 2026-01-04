// routes/generate.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { getEmbedding } = require('../services/embedding');
const { extractBusinessType } = require('../utils/classify');
const { extractExplicitColors, contrast } = require('../utils/colors');
const PRESETS = require('../utils/presets');
const { applyTheme } = require('../utils/theme');
const { searchTemplates } = require('../services/templates');

function hasColorIntent(text) {
  return /(фон|background|текст|text|color)/i.test(text);
}

router.post('/', async (req, res) => {
  try {
    const { description = '', keywords = [], brandName = '', preset = 'default' } = req.body;
    const userText = `${description} ${keywords.join(' ')}`.trim();

    console.log('\n=== NEW QUERY ===');
    console.log('User text:', userText);
    console.log('Preset requested:', preset);

    let category = extractBusinessType(userText);
    console.log('Extracted category:', category);

    const embedding = await getEmbedding(userText);
    console.log('Embedding generated');

    let template = await searchTemplates(pool, category, embedding);
    console.log('Template by category:', category, template ? template.id : 'NOT FOUND');

    if (!template) {
      console.log('Fallback to null category searchTemplates');
      template = await searchTemplates(pool, null, embedding);
      console.log('Template by null category:', template ? template.id : 'NOT FOUND');
    }

    if (!template) return res.status(404).json({ success: false, error: 'Template not found' });

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
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
