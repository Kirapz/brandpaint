const c = require('./backend/utils/colors.js');
function show(s){
  console.log('---', s, '=>', JSON.stringify(c.extractExplicitColors(s)));
}
show('темно-коричневий фон, білий текст');
show('світло-рожевий фон, темно-фіолетовий текст');
show("кав'ярня фон темно-помаранчевий та текст темно-коричневий");
show('лікарня, фон темно-помаранчевий ,текст темно коричневий');
show('лікарня, темно-червоний текст, темно-синій фон');
console.log('\ngetBetterContrast tests:');
console.log('bg darkbrown + preferred darkbrown =>', c.getBetterContrast('#8b4513', '#451a03'));
console.log('bg darkbrown + no preferred =>', c.getBetterContrast('#8b4513'));
