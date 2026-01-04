// utils/theme.js
const { contrast } = require('./colors');

function lighten(hex, p) {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(Math.min(255, (n >> 16) + 255 * p));
  const g = Math.round(Math.min(255, ((n >> 8) & 255) + 255 * p));
  const b = Math.round(Math.min(255, (n & 255) + 255 * p));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function applyTheme(css, palette, presetStyles = {}) {
  const surface = lighten(palette.bg, 0.06);
  const card = lighten(palette.bg, 0.12);
  const border = lighten(palette.bg, 0.18);
  const buttonText = palette.buttonText ?? contrast(palette.accent);

  return `
${css}

:root {
  --bg: ${palette.bg};
  --surface: ${surface};
  --card: ${card};
  --border: ${border};
  --text: ${palette.text};
  --accent: ${palette.accent};
  --button-text: ${buttonText};
  ${presetStyles.buttonBorderRadius ? `--button-radius: ${presetStyles.buttonBorderRadius};` : ''}
  ${presetStyles.fontFamily ? `--font-family: ${presetStyles.fontFamily};` : ''}
  ${presetStyles.cardShadow ? `--card-shadow: ${presetStyles.cardShadow};` : ''}
}

/* базові перекриття */
body { background: var(--bg) !important; color: var(--text) !important; ${presetStyles.fontFamily ? 'font-family: var(--font-family) !important;' : ''} }
.btn-coffee, .btn-submit, button { background-color: var(--accent) !important; color: var(--button-text) !important; ${presetStyles.buttonBorderRadius ? 'border-radius: var(--button-radius) !important;' : ''} border: none !important; }
h1,h2,h3,.logo,.nav-links a { color: var(--text) !important; ${presetStyles.fontFamily ? 'font-family: var(--font-family) !important;' : ''} }
section, header, footer { background: var(--surface) !important; }
.card, .menu-item { background: var(--card) !important; border: 1px solid var(--border) !important; ${presetStyles.cardShadow ? 'box-shadow: var(--card-shadow) !important;' : ''} }


`;
}

module.exports = { applyTheme, lighten };
