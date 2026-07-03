import * as cheerio from 'cheerio';

const html = await fetch('https://oteguiobras.com/obras/12-samsung-la-plata.html', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}).then(r => r.text());

const $ = cheerio.load(html);

console.log('=== info-bar items ===');
$('ul.info-bar li strong').each((i, el) => {
  const full = $(el).text();
  const iVal = $(el).find('i').text();
  const key = full.replace(iVal, '').replace(/:$/, '').trim().toLowerCase();
  console.log(i, '| full:', JSON.stringify(full));
  console.log('   key:', JSON.stringify(key), ' val:', JSON.stringify(iVal));
});

console.log('\n=== info-bar HTML ===');
console.log($('ul.info-bar').html()?.substring(0, 800));

// Banco Frances
const html2 = await fetch('https://oteguiobras.com/obras/41-nombre-de-la-obra.html', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}).then(r => r.text());
const $2 = cheerio.load(html2);
console.log('\n=== Banco Frances - info-bar HTML ===');
console.log($2('ul.info-bar').html()?.substring(0, 800) || '(sin info-bar)');
console.log('\n=== Banco Frances - product-description HTML ===');
console.log($2('.product-description').html()?.substring(0, 1000) || '(sin product-description)');
