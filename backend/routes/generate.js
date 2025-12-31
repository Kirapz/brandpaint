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

    console.log('Processing query:', userText, 'preset=', preset);

    const category = extractBusinessType(userText);
    const embedding = await getEmbedding(userText);

    const template = await searchTemplates(pool, category, embedding) || await searchTemplates(pool, null, embedding);

    if (!template) return res.status(404).json({ success: false, error: 'Template not found' });

    const finalBrandName = brandName?.trim() || keywords.find(k => k && k.length > 1) || description.split(/\s+/).find(w => w.length > 1) || 'My Brand';

    const html = template.html_content.replace(/{{BRAND_NAME}}/g, finalBrandName).replace(/{{DESCRIPTION}}/g, description || '');

    // default preset: якщо в запиті немає color intent — повний original css
    if (!preset || preset === 'default') {
      if (!hasColorIntent(userText)) {
        return res.json({ success: true, data: { html, css: template.css_content } });
      }
      // є intent — застосувати тільки кольори (без preset styles)
      const userColors = extractExplicitColors(userText);
      const bg = userColors.bg ?? '#ffffff';
      let text = userColors.text ?? contrast(bg);
      if (text === bg) text = contrast(bg);
      const accent = bg;
      const buttonText = contrast(accent);
      const palette = { bg, text, accent, buttonText };
      const css = applyTheme(template.css_content, palette, {});
      return res.json({ success: true, data: { html, css } });
    }

    // non-default presets
    let palette;
    if (!hasColorIntent(userText)) {
      palette = { bg: '#ffffff', text: '#020617', accent: '#020617', buttonText: '#020617' };
    } else {
      const userColors = extractExplicitColors(userText);
      const bg = userColors.bg ?? '#ffffff';
      let text = userColors.text ?? contrast(bg);
      if (text === bg) text = contrast(bg);
      const accent = bg;
      const buttonText = contrast(accent);
      palette = { bg, text, accent, buttonText };
    }

    const presetStyles = PRESETS[preset] || PRESETS.corporate;
    const css = applyTheme(template.css_content, palette, presetStyles);

    return res.json({ success: true, data: { html, css } });

  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

module.exports = router;
