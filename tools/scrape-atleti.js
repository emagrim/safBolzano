// Legge la lista atleti della societa' da atletica.me (serve un browser: i dati sono
// in una variabile JavaScript della pagina) e scrive un file JSON da importare in
// WordPress: SAF > Atleti > Importa, oppure `wp saf import-atleti atleti.json`.
//
// Uso:  npm install && npx playwright install chromium && node scrape-atleti.js [uscita.json]

const { chromium } = require('playwright');
const fs = require('fs');

const URL = 'https://atletica.me/societa/211';
const out = process.argv[2] || 'atleti.json';

(async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: 'domcontentloaded' });
    const raw = await page.evaluate(() => window.glob_tutti_gli_atleti || []);

    const athletes = raw.map(obj => ({
      id: obj.id || '',
      name: obj.nomecognome,
      profile_image: obj[2] === null || obj[2] === 'null' ? 'https://atletica.me/img/noimage.jpg' : obj[2],
      gender: obj.sesso,
      category_id: obj.categoria_id,
      age: obj.eta,
      data_nascita: obj.data_nascita,
      generale: obj.generale === null || obj.generale === 'null' ? 'Polivalente' : obj.generale,
    }));

    fs.writeFileSync(out, JSON.stringify(athletes, null, 1));
    console.log(`${athletes.length} atleti scritti in ${out}`);
  } finally {
    await browser.close();
  }
})().catch(err => {
  console.error(err);
  process.exit(1);
});
