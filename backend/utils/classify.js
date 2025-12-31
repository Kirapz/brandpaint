// utils/classify.js

function extractBusinessType(text = '') {
  const t = text.toLowerCase();

  const MAP = {
    healthcare: /(лікар|лікарн|клінік|медич|hospital|clinic|medical)/,
    food: /(кава|кавов|кафе|ресторан|їжа|coffee|cafe|restaurant|food|coffe)/,
    it: /(it|tech|web|software|app|стартап|програм|сайт)/,
    creative: /(дизайн|портфоліо|art|design|creative|фото|studio)/,
    shop: /(магазин|shop|store|brand|одяг|fashion)/,
    business: /(business|corporate|agency|consulting|bank|бізнес)/,
    education: /(школ|курс|academy|education|навчан)/,
    beauty: /(салон|beauty|spa|hair|барбер)/,
  };

  for (const [type, rx] of Object.entries(MAP)) {
    if (rx.test(t)) return type;
  }

  return 'default';
}

function autoDetectPreset(text = '') {
  const t = text.toLowerCase();

  if (/(затиш|тепл|cozy|кава|кавов)/.test(t)) return 'cozy';
  if (/(corporate|business|law|medical|it)/.test(t)) return 'corporate';
  if (/(design|creative|art|portfolio|beauty)/.test(t)) return 'creative';

  return 'minimal';
}

module.exports = {
  extractBusinessType,
  autoDetectPreset
};
