// utils/classify.js

function extractBusinessTypes(text = '') {
  const t = text.toLowerCase();
  const categories = [];

  const MAP = {
    healthcare: /(лікар|лікарн|клінік|медич|медцентр|стомат|аптек|здоров|терап|hospital|clinic|medical|health|pharmacy)/,
    food: /(кава|кав|кав['']ярн|кафе|ресторан|їжа|бар|піца|доставк|десерт|пекарн|кондитер|паб|кухн|смак|coffee|cafe|restaurant|food|pizza|bakery|bar|bistro)/,
    it: /(it|tech|web|software|app|стартап|програм|айті|тех|розробк|сервіс|цифр|диджитал|digital|dev|coding|дев|AI)/,
    creative: /(дизайн|портфоліо|art|design|creative|студія|мист|архіт|креатив|галер|studio|artist)/,
    photography: /(фото|фотограф|photography|photographer|photo|світлин)/,
    shop: /(магазин|shop|store|бренд|бренд\w*|одяг|одяг\w*|взутт|товар|торг|бутік|маркет|трц|fashion|boutique|market|goods|electronics|електрон|техніка)/,
    business: /(business|corporate|agency|consulting|bank|бізнес|корпор|агенц|консульт|банк|фінанс|інвест|офіс|фірм|менеджмент|invest|finance|real estate|нерухом)/,
    education: /(школ|курс|academy|education|навчан|універ|тренінг|вебінар|урок|вчит|освіт|school|university|training|language|мов)/,
    beauty: /(салон|beauty|spa|hair|барбер|макіяж|манікюр|космет|естети|вії|зачіск|makeup|cosmetic|barber|nails)/,
    lifestyle: /(фітнес|спорт|gym|тренажер|здоров|lifestyle|спортзал|тренування|fitness)/,
    legal: /(нотар|юрист|адвокат|правов|legal|law|notary|юридич)/
  };

  for (const [type, rx] of Object.entries(MAP)) {
    if (rx.test(t)) {
      categories.push(type);
    }
  }

  return categories.length > 0 ? categories : Object.keys(MAP);
}

function extractBusinessType(text = '') {
  const categories = extractBusinessTypes(text);
  return categories.length > 0 ? categories[0] : 'default';
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
  extractBusinessTypes,
  autoDetectPreset
};