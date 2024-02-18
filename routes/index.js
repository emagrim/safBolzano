const express = require('express');
const router = express.Router();
const path = require('path');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const axios = require('axios');


const paths = ['', 'news', 'iscrizioni', 'atleti', 'staff', 'risultati', 'galleria', 'calendario', 'info'];
const Npaths = paths.length;

const output = {
  css: {
    link: `/public/styles/globals.css`,
    file: `globals.css`,
  },
  nav: `<div id="nav"></div>`,
  foot: `<div id="foot"></div>`,
  std: `<script src="../scripts/std.js"></script><script src="../scripts/css.js"></script><script src="../scripts/introducer.js"></script><script src="../scripts/url.js"></script>`,
  content: ``,
  style: `<script>document.getElementById('globalStyles').textContent = globalStyles;</script>`,
  font: `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">`,
  fontawesome: `<script src="https://kit.fontawesome.com/fb4513912a.js" crossorigin="anonymous"></script>`,
}

router.get('/:page', async (req, res) => {
  const pageName = req.params.page;
  let imageFiles = getImagesFromFolder(path.join(__dirname, '../public/images/gallery'));
  const imgFolder = '../public/images/';
  const middlePath = 'img/';
  let pathToImgDir;

  if (pageName !== 'home') {

    switch (pageName) {
      case "news":
        output.content = ``;
        pathToImgDir = imgFolder + middlePath + pageName;
        break;
      case "iscrizioni":
        output.content = ``;
        pathToImgDir = imgFolder + middlePath + pageName;
        break;
      case "atleti":
        output.content = ``;
        pathToImgDir = imgFolder + middlePath + pageName;
        break;
      case "staff":
        output.content = ``;
        pathToImgDir = imgFolder + middlePath + pageName;
        break;
      case "risultati":
        output.content = ``;
        pathToImgDir = imgFolder + middlePath + pageName;

        await getGare(output, res)

        break;
      case "galleria":
        output.content = ``;
        pathToImgDir = imgFolder + `/gallery`;
        break;
      case "calendario":
        pathToImgDir = imgFolder + middlePath + pageName;

        await getCalendar(output, res, req, req.originalUrl);

        break;
      case "info":
        output.content = ``;
        pathToImgDir = imgFolder + middlePath + pageName;
        break;
      default:
        pathToImgDir = imgFolder + middlePath + pageName;
        break;
    }

    if (pathToImgDir) {
      imageFiles = getImagesFromFolder(path.join(__dirname, `${pathToImgDir}`));
    } else {
      console.log('Error: pathToImgDir is not defined');
    }
    res.render(pageName, { pageTitle: pageName, output: output, images: imageFiles });

  } else {
    res.redirect('/');
  }
});

function getImagesFromFolder(folderPath) {
  const fs = require('fs');
  if (fs.existsSync(folderPath)) {
    return fs.readdirSync(folderPath).filter(file => {
      const filePath = path.join(folderPath, file);
      return (
        fs.statSync(filePath).isFile() &&
        /\.(jpg|jpeg|png|gif)$/i.test(file) &&
        file.toLowerCase() !== 'favicon.ico'
      );
    });
  } else {
    console.log('Error: Directory does not exist -', folderPath);
    return [];
  }
}

async function getCalendar(output, res, req, reqUrl) {
  router.use(bodyParser.json());
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const website = 'https://www.fidal.it/calendario.php';
    await page.goto(website, { waitUntil: 'domcontentloaded' });

    let sectionHtml = await page.$eval('.section', section => section.innerHTML);

    const url = req.protocol + '://' + req.get('host') + req.originalUrl;

    const parts = url.split('?');
    const secondPartLink = parts[1];

    const fullLink = website + '?' + secondPartLink;

    console.log(secondPartLink);
    console.log(fullLink);

    await page.goto(fullLink, { waitUntil: 'domcontentloaded' });
    sectionHtml = await page.$eval('.section', section => section.innerHTML);

    const reset = `    <script>

</script>`;

output.content = sectionHtml + reset;

    await browser.close();
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
}

async function getGare(output, res) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://atletica.me/societa/211');
    console.log('Navigated to the website.');

    await page.addScriptTag({ url: 'https://atletica.me/script/societa.js?v=1.0.1' });
    console.log('Included the script.');

    await page.waitForFunction(() => typeof getManifestazioniSocieta === 'function', { timeout: 5000 });
    console.log('getManifestazioniSocieta function is defined.');

    const result = await page.evaluate(() => {
      console.log('Executing getManifestazioniSocieta...');
      console.log('Is getManifestazioniSocieta defined?', typeof getManifestazioniSocieta === 'function');

      const races = getManifestazioniSocieta();

      if (!races || races.length === 0) {
        return 'no upcoming races next';
      }

      return races;
    });

    await browser.close();

    output.content = `
    
    `;

    console.log('Content of the result:', result);

  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
}







router.get('/', (req, res) => {
  output.content = ' ';
  const imageFiles = getImagesFromFolder(path.join(__dirname, '../public/images/gallery'));
  res.render('home', { pageTitle: "home", output: output, images: imageFiles });
});

module.exports = router;
