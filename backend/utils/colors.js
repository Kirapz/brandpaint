// utils/colors.js
const COLORS = {
  black: { hex: '#020617', rx: /(чорн|black)/i },
  white: { hex: '#ffffff', rx: /(білий|white|light)/i },
  green: { hex: '#16a34a', rx: /(зел|green|еко)/i },
  yellow: { hex: '#facc15', rx: /(жовт|yellow)/i },
  brown: { hex: '#92400e', rx: /(коричн|brown)/i },
  blue: { hex: '#2563eb', rx: /(син|blue)/i },
  purple: { hex: '#7c3aed', rx: /(фіолет|purple)/i },
  pink: { hex: '#ec4899', rx: /(рожев|pink)/i },
  red: { hex: '#dc2626', rx: /(червон|red)/i },
};

function findColor(word) {
  if (!word) return null;
  for (const c of Object.values(COLORS)) {
    if (c.rx.test(word)) return c.hex;
  }
  return null;
}

function tokenizeWithIndices(str) {
  const tokens = [];
  const rx = /[а-яіїєґa-z]+/gi;
  let m;
  while ((m = rx.exec(str)) !== null) {
    tokens.push({ word: m[0].toLowerCase(), index: m.index });
  }
  return tokens;
}

function findNearestColorToken(allTokens, globalIdx) {
  let best = null;
  let bestDist = Infinity;
  for (const t of allTokens) {
    const c = findColor(t.word);
    if (!c) continue;
    const dist = Math.abs(t.index - globalIdx);
    if (dist < bestDist) {
      bestDist = dist;
      best = { hex: c, word: t.word, index: t.index, dist };
    }
  }
  return best;
}

/* Надійний парсер (як в останній версії, з врахуванням ком) */
function extractExplicitColors(text = '') {
  const t = (text || '').toLowerCase();
  if (!t.trim()) return { bg: null, text: null };
  const allTokens = tokenizeWithIndices(t);
  let bg = null;
  let textColor = null;
  const parts = t.split(',').map(p => p.trim());
  let searchCursor = 0;

  for (const part of parts) {
    const partStart = Math.max(0, t.indexOf(part, searchCursor));
    searchCursor = partStart + part.length;
    const fonRx = /(?:фон|background)/i;
    const textRx = /(?:текст|text)/i;
    const fonMatch = fonRx.exec(part);
    const textMatch = textRx.exec(part);

    const checkNeighbors = (globalKeyIdx) => {
      if (!allTokens.length) return null;
      let idx = allTokens.findIndex(tok => tok.index > globalKeyIdx);
      if (idx === -1) idx = allTokens.length;
      const candidates = [];
      if (allTokens[idx]) candidates.push(allTokens[idx]);
      if (allTokens[idx - 1]) candidates.push(allTokens[idx - 1]);
      for (const cand of candidates) {
        const c = findColor(cand.word);
        if (c) return { hex: c, word: cand.word, index: cand.index };
      }
      return null;
    };

    if (fonMatch) {
      const keyIdxInPart = fonMatch.index;
      const keyGlobal = partStart + keyIdxInPart;
      const near = checkNeighbors(keyGlobal);
      if (near) bg = near.hex;
      const pMatchDirect = part.match(/(?:фон|background)\s*([а-яіїєґa-z]+)|([а-яіїєґa-z]+)\s*(?:фон|background)/i);
      if (pMatchDirect) {
        const colorWord = (pMatchDirect[1] || pMatchDirect[2] || '').trim();
        const c = findColor(colorWord);
        if (c) bg = c;
      }
      if (!bg) {
        const nearest = findNearestColorToken(allTokens, keyGlobal);
        if (nearest) bg = nearest.hex;
      }
    } else {
      if (!bg) {
        const tokensInPart = tokenizeWithIndices(part);
        for (const tk of tokensInPart) {
          const c = findColor(tk.word);
          if (c) { bg = c; break; }
        }
      }
    }

    if (textMatch) {
      const keyIdxInPart = textMatch.index;
      const keyGlobal = partStart + keyIdxInPart;
      const near = checkNeighbors(keyGlobal);
      if (near) textColor = near.hex;
      const pMatchDirect = part.match(/(?:текст|text)\s*([а-яіїєґa-z]+)|([а-яіїєґa-z]+)\s*(?:текст|text)/i);
      if (pMatchDirect) {
        const colorWord = (pMatchDirect[1] || pMatchDirect[2] || '').trim();
        const c = findColor(colorWord);
        if (c) textColor = c;
      }
      if (!textColor) {
        const nearest = findNearestColorToken(allTokens, keyGlobal);
        if (nearest) textColor = nearest.hex;
      }
      const lightDark = part.match(/\b(світл|темн|light|dark)\b/i);
      if (!textColor && lightDark) {
        const w = lightDark[0].toLowerCase();
        textColor = /світл|light/.test(w) ? '#020617' : '#ffffff';
      }
    } else {
      if (!textColor) {
        const tokensInPart = tokenizeWithIndices(part);
        for (const tk of tokensInPart) {
          const c = findColor(tk.word);
          if (c) { textColor = c; break; }
        }
      }
    }
  }

  const allColorTokens = allTokens.map(tk => ({ ...tk, color: findColor(tk.word) })).filter(x => x.color);
  if (!bg && allColorTokens.length) bg = allColorTokens[allColorTokens.length - 1].color;
  if (!textColor && allColorTokens.length) textColor = allColorTokens[0].color;

  return { bg: bg || null, text: textColor || null };
}

function contrast(hex) {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const l = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return l > 0.6 ? '#020617' : '#ffffff';
}

module.exports = {
  COLORS,
  findColor,
  tokenizeWithIndices,
  findNearestColorToken,
  extractExplicitColors,
  contrast
};
