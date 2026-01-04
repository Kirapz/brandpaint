// utils/classify.js

function extractBusinessType(text = '') {
  const t = text.toLowerCase();

const MAP = {
  healthcare: /(лікар|лікарн|клінік|медич|медцентр|стомат|аптек|здоров|терап|hospital|clinic|medical|health|pharmacy)/,
  food: /(кава|кав|кав['’]ярн|кафе|ресторан|їжа|бар|піца|доставк|десерт|пекарн|кондитер|паб|кухн|смак|coffee|cafe|restaurant|food|pizza|bakery|bar)/,
  it: /(it|tech|web|software|app|стартап|програм|айті|тех|розробк|сервіс|цифр|диджитал|digital|dev|coding|дев|AI)/,
  creative: /(дизайн|портфоліо|art|design|creative|фото|студія|мист|архіт|креатив|галер|studio|photography|artist)/,
  shop: /(магазин|shop|store|бренд|бренд\w*|одяг|одяг\w*|взутт|товар|торг|бутік|маркет|трц|fashion|boutique|market|goods)/i,
  business: /(business|corporate|agency|consulting|bank|бізнес|корпор|агенц|консульт|банк|фінанс|інвест|офіс|фірм|менеджмент|invest|finance)/,
  education: /(школ|курс|academy|education|навчан|універ|тренінг|вебінар|урок|вчит|освіт|school|university|training)/,
  beauty: /(салон|beauty|spa|hair|барбер|макіяж|манікюр|космет|естети|вії|зачіск|makeup|cosmetic|barber|nails)/,
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
