const s = "кав'ярня фон темно-помаранчевий та текст темно-коричневий";
const fonRx = /(?:фон|background)\s*([а-яіїєґa-z]+(?:[\s-][а-яіїєґa-z]+)*)|([а-яіїєґa-z]+(?:[\s-][а-яіїєґa-z]+)*)\s*(?:фон|background)/i;
const textRx = /(?:текст|text)\s*([а-яіїєґa-z]+(?:[\s-][а-яіїєґa-z]+)*)|([а-яіїєґa-z]+(?:[\s-][а-яіїєґa-z]+)*)\s*(?:текст|text)/i;
console.log('string:', s);
console.log('fon match:', s.match(fonRx));
console.log('text match:', s.match(textRx));
