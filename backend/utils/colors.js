// utils/colors.js
const COLORS = {
  black: { hex: '#000000', rx: /(чорн|black)/i },
  white: { hex: '#ffffff', rx: /(білий|white)/i },
  
  red: { hex: '#dc2626', rx: /(червон|red)(?!\s*(?:темн|світл|dark|light))/i },
  darkred: { hex: '#991b1b', rx: /(темно[\s-]?червон|темн[\s-]?червон|dark[\s-]?red)/i },
  lightred: { hex: '#fca5a5', rx: /(світло[\s-]?червон|світл[\s-]?червон|light[\s-]?red)/i },
  cherry: { hex: '#7f1d1d', rx: /(вишнев|cherry)/i },
  
  pink: { hex: '#ec4899', rx: /(рожев|pink)(?!\s*(?:темн|світл|dark|light|ніжн))/i },
  darkpink: { hex: '#be185d', rx: /(темно[\s-]?рожев|темн[\s-]?рожев|dark[\s-]?pink)/i },
  lightpink: { hex: '#fbcfe8', rx: /(світло[\s-]?рожев|світл[\s-]?рожев|light[\s-]?pink|ніжно[\s-]?рожев|ніжн[\s-]?рожев)/i },
  
  orange: { hex: '#ea580c', rx: /(помаранчев|orange)(?!\s*(?:темн|світл|dark|light))/i },
  darkorange: { hex: '#c2410c', rx: /(темно[\s-]?помаранчев|темн[\s-]?помаранчев|dark[\s-]?orange)/i },
  lightorange: { hex: '#fed7aa', rx: /(світло[\s-]?помаранчев|світл[\s-]?помаранчев|light[\s-]?orange)/i },
  
  yellow: { hex: '#facc15', rx: /(жовт|yellow)(?!\s*(?:темн|світл|dark|light))/i },
  darkyellow: { hex: '#a16207', rx: /(темно[\s-]?жовт|темн[\s-]?жовт|dark[\s-]?yellow)/i },
  lightyellow: { hex: '#fef3c7', rx: /(світло[\s-]?жовт|світл[\s-]?жовт|light[\s-]?yellow)/i },
  gold: { hex: '#d4af37', rx: /(золот|gold)/i },
  
  green: { hex: '#16a34a', rx: /(зелен|green)(?!\s*(?:темн|світл|dark|light|салат))/i },
  darkgreen: { hex: '#0a4d24ff', rx: /(темно[\s-]?зелен|темн[\s-]?зелен|dark[\s-]?green|болотн)/i },
  lightgreen: { hex: '#bbf7d0', rx: /(світло[\s-]?зелен|світл[\s-]?зелен|light[\s-]?green|салатов)/i },
  
  blue: { hex: '#2563eb', rx: /(син|blue)(?!\s*(?:темн|світл|dark|light))/i },
  darkblue: { hex: '#041546ff', rx: /(темно[\s-]?син|темн[\s-]?син|dark[\s-]?blue)/i },
  lightblue: { hex: '#bfdbfe', rx: /(світло[\s-]?син|світл[\s-]?син|light[\s-]?blue|блакитн)/i },
  navy: { hex: '#1e40af', rx: /(темно[\s-]?блакитн|navy)/i },
  
  purple: { hex: '#7c3aed', rx: /(фіолет|purple)(?!\s*(?:темн|світл|dark|light))/i },
  darkpurple: { hex: '#581c87', rx: /(темно[\s-]?фіолет|темн[\s-]?фіолет|dark[\s-]?purple)/i },
  lightpurple: { hex: '#a69adaff', rx: /(світло[\s-]?фіолет|світл[\s-]?фіолет|light[\s-]?purple)/i },
  
  brown: { hex: '#92400e', rx: /(коричнев|brown)(?!\s*(?:темн|світл|dark|light))/i },
  darkbrown: { hex: '#451a03', rx: /(темно[\s-]?коричнев|темн[\s-]?коричнев|dark[\s-]?brown)/i },
  lightbrown: { hex: '#fed7aa', rx: /(світло[\s-]?коричнев|світл[\s-]?коричнев|light[\s-]?brown)/i },
  
  gray: { hex: '#6b7280', rx: /(сір|gray|grey)/i },
  darkgray: { hex: '#374151', rx: /(темно[\s-]?сір|темн[\s-]?сір|dark[\s-]?gray|dark[\s-]?grey)/i },
  lightgray: { hex: '#d1d5db', rx: /(світло[\s-]?сір|світл[\s-]?сір|light[\s-]?gray|light[\s-]?grey)/i },
  
  turquoise: { hex: '#14b8a6', rx: /(бірюзов|turquoise|teal)/i },
  cyan: { hex: '#06b6d4', rx: /(ціан|cyan)/i },
  silver: { hex: '#c0c0c0', rx: /(срібн|silver)/i },
  beige: { hex: '#f5f5dc', rx: /(беж|beige)/i },
  cream: { hex: '#fffdd0', rx: /(кремов|cream)/i },
  ivory: { hex: '#fffff0', rx: /(слонов[\s-]?кістк|ivory)/i },
  peach: { hex: '#ffcba4', rx: /(персиков|peach)/i },
  coral: { hex: '#ff7f50', rx: /(корал|coral)/i },
  salmon: { hex: '#fa8072', rx: /(лосос|salmon)/i },
  khaki: { hex: '#f0e68c', rx: /(хакі|khaki)/i },
  olive: { hex: '#808000', rx: /(оливков|olive)/i },
  maroon: { hex: '#800000', rx: /(бордов|maroon)/i },
  
  sand: { hex: '#c2b280', rx: /(піщан|sand)/i },
  stone: { hex: '#928e85', rx: /(камін|stone)/i },
  earth: { hex: '#8b4513', rx: /(земл|earth)/i },
  
  light: { hex: '#f8fafc', rx: /(світл|light)(?!\s*(?:червон|рожев|помаранчев|жовт|зелен|син|фіолет|коричнев|сір))/i },
  dark: { hex: '#000000', rx: /(темн|dark)(?!\s*(?:червон|рожев|помаранчев|жовт|зелен|син|фіолет|коричнев|сір))/i },
};

function findColor(word) {
  if (!word) return null;
  
  const wordLower = word.toLowerCase();
  
  // Перевіряємо складені кольори спочатку
  for (const [colorName, colorData] of Object.entries(COLORS)) {
    if (colorName.includes('dark') || colorName.includes('light') || 
        colorName === 'cherry' || colorName === 'turquoise' || 
        colorName === 'silver' || colorName === 'gold') {
      if (colorData.rx.test(wordLower)) {
        return colorData.hex;
      }
    }
  }
  
  // Потім основні кольори
  for (const [colorName, colorData] of Object.entries(COLORS)) {
    if (colorData.rx.test(wordLower)) {
      return colorData.hex;
    }
  }
  
  return null;
}

function tokenizeWithIndices(str) {
  const tokens = [];
  const rx = /[а-яіїєґa-z]+(?:[\s-][а-яіїєґa-z]+)*/gi;
  let m;
  while ((m = rx.exec(str)) !== null) {
    tokens.push({ word: m[0].toLowerCase(), index: m.index });
    
    const parts = m[0].split(/[\s-]+/);
    if (parts.length > 1) {
      let offset = m.index;
      for (const part of parts) {
        if (part.length > 2) { 
          tokens.push({ word: part.toLowerCase(), index: offset });
        }
        offset += part.length + 1;
      }
    }
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

function extractExplicitColors(text = '') {
  const t = (text || '').toLowerCase();
  if (!t.trim()) return { bg: null, text: null, explicitBg: false, explicitText: false };
  
  let bg = null;
  let textColor = null;
  let explicitBg = false;
  let explicitText = false;
  
  console.log('🎨 Parsing colors from:', t);
  
  // Шукаємо фон
  const bgMatch = t.match(/(?:фон|background)\s*([а-яіїєґa-z\s-]+)|([а-яіїєґa-z\s-]+)\s*(?:фон|background)/i);
  if (bgMatch) {
    const colorWord = (bgMatch[1] || bgMatch[2] || '').trim();
    console.log('🔍 Found bg word:', colorWord);
    const c = findColor(colorWord);
    if (c) {
      bg = c;
      explicitBg = true;
      console.log('✅ Bg color:', c);
    }
  }
  
  // Шукаємо текст
  const textMatch = t.match(/(?:текст|text)\s*([а-яіїєґa-z\s-]+)|([а-яіїєґa-z\s-]+)\s*(?:текст|text)/i);
  if (textMatch) {
    const colorWord = (textMatch[1] || textMatch[2] || '').trim();
    console.log('🔍 Found text word:', colorWord);
    const c = findColor(colorWord);
    if (c) {
      textColor = c;
      explicitText = true;
      console.log('✅ Text color:', c);
    }
  }
  
  console.log('🎨 Final result:', { bg, text: textColor, explicitBg, explicitText });
  return { bg, text: textColor, explicitBg, explicitText };
} 

function contrast(hex) {
  if (!hex || hex === 'null' || hex === null) return '#000000';
  
  const cleanHex = hex.replace('#', '');
  const n = parseInt(cleanHex, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  if (luminance > 0.7) {
    return '#000000';
  } else if (luminance > 0.5) {
    return '#1e293b';
  } else if (luminance > 0.3) {
    return '#f8fafc';
  } else {
    return '#ffffff';
  }
}

function getBetterContrast(bgHex, preferredTextHex = null) {
  if (!bgHex) return '#000000';

  // If the user explicitly provided a preferred text color, respect it as-is
  if (preferredTextHex) {
    return preferredTextHex;
  }

  // otherwise compute a readable contrast color
  return contrast(bgHex);
}

function calculateContrastRatio(color1, color2) {
  const l1 = getRelativeLuminance(color1);
  const l2 = getRelativeLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(hex) {
  const cleanHex = hex.replace('#', '');
  const n = parseInt(cleanHex, 16);
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  
  const rs = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
  const gs = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
  const bs = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

module.exports = {
  COLORS,
  findColor,
  tokenizeWithIndices,
  findNearestColorToken,
  extractExplicitColors,
  contrast,
  getBetterContrast,
  calculateContrastRatio,
  getRelativeLuminance
}
