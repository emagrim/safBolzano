const express = require('express');
const router = express.Router();
const path = require('path');
//const puppeteer = require('puppeteer-core');
const bodyParser = require('body-parser');
const axios = require('axios');
const sqlite3 = require('sqlite3');
const fs = require('fs');
const cheerio = require('cheerio');
const { IgApiClient } = require('instagram-private-api');
const { workerData, parentPort } = require('worker_threads');
const handlebars = require('handlebars');
const authenticateAdmin = require('./adminAuthMiddleware');
const { send } = require('process');
const { PDFDocument } = require('pdf-lib');
const nodemailer = require('nodemailer');
const CookieConsent = require('vanilla-cookieconsent');
require('web-streams-polyfill');
const fetch = require('node-fetch');
globalThis.fetch = fetch;
const { chromium } = require('playwright');

// Function needed to read file without having problems with fs not being promises...
function readFileAsync(filePath, encoding = 'utf8') {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, encoding, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

// const chromiumPath = process.env.CHROMIUM_PATH || '/usr/bin/chromium';

process.env.PUPPETEER_CACHE_DIR = '/la_cash';

router.use(bodyParser.json());

const db = new sqlite3.Database('database.db');

// const paths = ['', 'news', 'iscrizioni', 'atleti', 'staff', 'risultati', 'galleria', 'calendario', 'info'];
const paths = ['', 'iscrizioni', 'atleti', 'staff', 'risultati', 'galleria', 'calendario', 'info'];
const Npaths = paths.length;

const output = {
  css: {
    link: `/public/styles/globals.css`,
    file: `globals.css`,
  },
  nav: `<div id="nav"></div>`,
  foot: `<div id="foot"></div>`,
  std: `<meta name="viewport" content="width=device-width, initial-scale=1.0"><script src="../scripts/std.js"></script><script src="../scripts/css.js"></script><script src="../scripts/introducer.js"></script><script src="../scripts/url.js"></script><script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script><script src="../scripts/functions.js"></script>`,
  content: ``,
  style: `<link rel="stylesheet" type="text/css" href="/styles/globals.css"><meta name="viewport" content="width=device-width, initial-scale=1.0">`,
  font: `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">`,
  fontawesome: `<script src="https://kit.fontawesome.com/fb4513912a.js" crossorigin="anonymous"></script>`,
  cookies: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vanilla-cookieconsent@3.1.1/build/cookieconsent.min.css" />
  <script src="https://cdn.jsdelivr.net/npm/vanilla-cookieconsent@3.1.1/build/cookieconsent.min.js"></script>`,
}

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS record_sociali (
      id INTEGER PRIMARY KEY,
      disciplina TEXT,
      tempo TEXT,
      nome TEXT,
      cognome TEXT,
      data TEXT,
      old_tempo TEXT,
      old_nome TEXT,
      old_cognome TEXT,
      old_data TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS record_sociali_f (
    id INTEGER PRIMARY KEY,
    disciplina TEXT,
    tempo TEXT,
    nome TEXT,
    cognome TEXT,
    data TEXT,
    old_tempo TEXT,
    old_nome TEXT,
    old_cognome TEXT,
    old_data TEXT
)`);
});

router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());

router.use('/admin-panel-1953', authenticateAdmin);

let adminOut;
let pdfBytes;


router.post('/staff-save', async (req, res) => {
  try {
    const staffData = req.body;
    console.log('Received staff data:', staffData);

    // Check if staffData is an array
    if (!Array.isArray(staffData)) {
      return res.status(400).json({ error: 'Invalid data format. Expected an array.' });
    }

    db.serialize(() => {
      // Clear existing staff records from the database
      db.run('DELETE FROM staff', function (err) {
        if (err) {
          console.error('Error deleting staff records:', err);
          return res.status(500).send('Internal Server Error');
        }

        const insertQuery = `INSERT INTO staff (id, nome, cognome, ruolo, specialita, anno, foto)
                             VALUES (?, ?, ?, ?, ?, ?, ?)`;

        staffData.forEach(async (staff, index) => {
          const { id, nome, cognome, ruolo, specialita, anno, foto } = staff;
          await db.run(insertQuery, [id, nome, cognome, ruolo, specialita, anno, foto], function (err) {
            if (err) {
              console.error('Error inserting staff record:', err);
            } else {
              console.log(`Staff record inserted with ID ${id}`);
            }
          });
        });

        res.send('Staff data received and saved successfully.');
      });
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/send-email', (req, res) => {
  const { nome, email, cognome, codice_fiscale, data_nascita, luogo_nascita } = req.body;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'noreply.safbolzano1953@gmail.com',
      pass: 'chloebraccioalzato14'
    }
  });

  const mailOptions = {
    from: 'noreply.safbolzano1953@gmail.com',
    to: email,
    subject: `SAF BZ 1953 - Conferma dati iscrizione atleta ${nome} ${cognome}`,
    html: `<p>Ciao, ${nome} ${cognome},</p>
      <p>Nome: ${nome}</p>
      <p>Cognome: ${cognome}</p>
      <p>Codice Fiscale: ${codice_fiscale}</p>
      <p>Data di nascita: ${data_nascita}</p>
      <p>Luogo di nascita: ${luogo_nascita}</p>
      <p>Controlla i dati per fare richiesta di iscrizione alla nostra società "SAF BOLZANO 1953".</p>
      <p>In caso di dati errati o mancanti, rispondere a questa mail o ricompilare il modulo sul sito ufficiale safbolzano.it.</p>
      <p>Se tutto è andato bene, ci vediamo prossimamente al campo!</p>
      <p>Saluti,<br/>Lo staff di Saf Bolzano.</p>`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Email sent:', info.response);
      res.status(200).send('Email Sent');
    }
  });
});

router.post('/admin-save', async (req, res) => {
  try {
    const records = req.body;
    console.log('Received data:', records);

    // Check if records is an array
    if (!Array.isArray(records)) {
      return res.status(400).json({ error: 'Invalid data format. Expected an array.' });
    }

    db.serialize(() => {
      db.run('DELETE FROM record_sociali', function (err) {
        if (err) {
          console.error('Error deleting records:', err);
          return res.status(500).send('Internal Server Error');
        }

        const insertQuery = `INSERT INTO record_sociali (id, disciplina, tempo, nome, cognome, data, old_tempo, old_nome, old_cognome, old_data)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        records.forEach((record, index) => {
          const { disciplina, tempo, nome, cognome, data, old_tempo, old_nome, old_cognome, old_data } = record;
          const id = index + 1;
          db.run(insertQuery, [id, disciplina, tempo, nome, cognome, data, old_tempo, old_nome, old_cognome, old_data], function (err) {
            if (err) {
              console.error('Error inserting record:', err);
            } else {
              console.log(`Record inserted with ID ${id}`);
            }
          });
        });

        res.send('Data received and saved successfully.');
      });
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});


router.post('/admin-panel-1953', async (req, res) => {
  try {
    await getAdminPanel(output, adminOut);
    res.render('admin-panel-1953', { output: output, adminOut: adminOut });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
});

router.get('/galleria/:folder', (req, res) => {
  const folder = req.params.folder;
  console.log('Folder:', folder);

  const folderPath = path.join('../public/data/gallery', folder);
  console.log('Folder Path:', folderPath);

  if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
    return res.status(404).send('Folder does not exist.');
  }

  const images = getImagesFromFolder(folderPath);
  console.log('Images:', images);

  if (!images || images.length === 0) {
    return res.status(404).send('No images found or folder does not exist.');
  }

  const subfolders = getSubfoldersFromFolder(folderPath); // Use folderPath here

  let imageTags = '';

  for (const image of images) {
    imageTags += `
    <div class="image">
      
      <img src="/${folderPath}/${image}" alt="${image}" style="width: 75%; height: auto;">
    
      <a href="/${folderPath}/${image}" download="${image}">
        <svg class="dwIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.--><path d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128l-368 0zm79-167l80 80c9.4 9.4 24.6 9.4 33.9 0l80-80c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-39 39L344 184c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 134.1-39-39c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9z"/></svg>
      </a>
    </div>
    
    `;
  }

  res.send(`
    <html>
    <head>
        <title>${folder.split('_')[0].split(".").reverse().join('/')} ${folder.split('_')[1]}</title>
        ${output.style}
        <style>
            .image{
                display: flex;
                flex-direction: row;
                align-items: center;
            }

            .dwIcon{
                width: 75px;
                transition: all 0.3s ease-in-out;
            }
            .dwIcon:hover{
                opacity: 0.5;
                scale: 1.1;
            }
            .gallery {
                display: flex;
                flex-wrap: wrap;
            }
            .gallery img {
                margin: 10px;
            }
            img:hover{
                transform: scale(1.015);
            }
            .line{
                width: 100%;
                height: 3px;
                background-color: #000;
            }
        </style>
        ${output.std}
    </head>
    <body>
        <div style="z-index: 98;padding: 100px auto 100px auto; background-color: #1c1e21; position:fixed;width:100%;">
          <h1 style="color: white; text-align: center; font-size: 50px;">${folder.split('_')[0].split(".").reverse().join('/')} ${folder.split('_')[1]}</h1>
        </div>
        <div class="gallery">
            ${imageTags}
        </div>
        <div>
        </div>
        <a href="/galleria" class="circle" style="width:50px; height:50px; border-radius:50%;position:fixed; background-color:#1c1e21;bottom:20px; left:20px;z-index:99;font-size:44px;color:white;text-decoration:none;text-align:center;">
          &#8592;
        </a>
        ${output.foot}
    </body>
    </html>
`);

});

function getImagesFromFolder(folderPath) {
  let imageFiles = [];

  function searchFolder(currentPath) {
    if (fs.existsSync(currentPath)) {
      const stats = fs.statSync(currentPath);

      if (stats.isDirectory()) {
        const files = fs.readdirSync(currentPath);

        files.forEach(file => {
          const filePath = path.join(currentPath, file);
          const fileStats = fs.statSync(filePath);

          if (fileStats.isDirectory()) {
            searchFolder(filePath); // Recursive call for subfolders
          } else if (/\.(jpg|jpeg|png|gif)$/i.test(file) && file.toLowerCase() !== 'favicon.ico') {
            const relativePath = path.relative(folderPath, filePath);
            imageFiles.push(relativePath); // Collect image file paths with relative path
          }
        });
      }
    } else {
      console.log('Error: Directory does not exist -', currentPath);
    }
  }

  searchFolder(folderPath); // Initial call with the provided folder path
  return imageFiles;
}

function getFirstImage(folderPath) {
  if (fs.existsSync(folderPath)) {
    const files = fs.readdirSync(folderPath).filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === '.jpg' || ext === '.png' || ext === '.jpeg' || ext === '.gif';
    });

    return files.length > 0 ? files[0] : null;
  } else {
    return null;
  }
}

function getSubfoldersFromFolder(folderPath) {
  if (fs.existsSync(folderPath)) {
    const stats = fs.statSync(folderPath);

    if (stats.isDirectory()) {
      return fs.readdirSync(folderPath)
        .filter(file => {
          const filePath = path.join(folderPath, file);
          return fs.statSync(filePath).isDirectory();
        })
        .map(folder => { const folderFullPath = path.join(folderPath, folder); const date = folder.substring(0, 10).split('.').reverse().join('/'); const name = folder.substring(11); const firstImage = getFirstImage(folderFullPath); return { date, name, folder, firstImage }; }).reverse();
    } else {
      console.log('Error: Path is not a directory -', folderPath);
      return [];
    }
  } else {
    console.log('Error: Directory does not exist -', folderPath);
    return [];
  }
}

module.exports = router;


router.get('/:page', async (req, res) => {
  const pageName = req.params.page;
  let imageFiles = getImagesFromFolder(path.join(__dirname, '../public/images/gallery'));
  const imgFolder = '../public/images/';
  const middlePath = 'img/';
  let pathToImgDir;
  const folderPath = path.join(__dirname, '../public/data/gallery');
  const subfolders = getSubfoldersFromFolder(folderPath);

  try {
    if (pageName !== 'home') {

      switch (pageName) {
        case "admin":
          break;
        // case "news":
        //   await getNews(output, res);
        //   pathToImgDir = imgFolder + middlePath + pageName;
        //   break;
        case "iscrizioni":
          await getNumberOfAthletes(output, res);
          pathToImgDir = imgFolder + middlePath + pageName;
          break;
        case "atleti":
          output.content = ``;
          pathToImgDir = imgFolder + middlePath + pageName;

          await getAtleti(output, res);

          break;
        case "athlete":

          await getAthlete(output, res);

          break;
        case "staff":
          getStaff();
          pathToImgDir = imgFolder + middlePath + pageName;
          break;
        case "risultati":
          pathToImgDir = imgFolder + middlePath + pageName;

          //await getGare(output, res);
          await getRecordSociali(output, res);

          break;
        case "galleria":
          output.content = ``;
          pathToImgDir = '../public/data/gallery';
          imageFiles = getImagesFromFolder(path.join(__dirname, pathToImgDir));
          break;
        case "calendario":
          pathToImgDir = imgFolder + middlePath + pageName;

          await getCalendar(output, res, req, req.originalUrl);

          break;
        case "info":
          await getNumberOfAthletes(output, res);
          pathToImgDir = imgFolder + middlePath + pageName;
          break;
        default:
          output.content = ``;
          console.log("default switch case chosen.");
          console.log(output.content);
          pathToImgDir = imgFolder + middlePath + pageName;

          break;
      }

      if (pathToImgDir) {
        imageFiles = getImagesFromFolder(path.join(__dirname, `${pathToImgDir}`));
      } else {
        console.log('Error: pathToImgDir is not defined');
      }

    } else {
      console.log("calling function from ELSE")
      await getHome(output, res);
      res.redirect('/');
    }
  } catch (error) {
    res.send('Errore grave. contattare alex.decarli@safbolzano.it');
    console.error('Error:', error.message);
  }
  console.log('Content:', output.content);
  // res.render(pageName, { pageTitle: pageName, output: output, images: imageFiles, folder: subfolders });
  res.render(pageName, { pageTitle: pageName, output: output, images: imageFiles, folder: subfolders });
});

router.get('/news/:articleId', async (req, res) => {
  const articleId = req.params.articleId;  // Extract the ID from the URL
  console.log('Article ID:', articleId);  // Log the id for debugging

  try {
    await getArticle(res, articleId);  // Call your function to fetch the article by ID
  } catch (error) {
    res.status(500).send('Error fetching article');
  }
});



let staffContent;

async function getAdminPanel(output, res) {
  let staff = await getStaff(output, res);
  staff = staffContent;
  let record = await getRecordSociali(output, res);
  record = output.content;
  try {
    adminOut = `
    <h1>Admin Panel</h1>
    <div>
      <h2>Staff</h2>
      ${staff}
    </div>
    <div>
      <h2>Record Sociali</h2>
      ${record}
    </div>
    `;
    return adminOut;
    //${record.map(record => `<p>${record.disciplina} - ${record.tempo}</p>`).join('')}
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error');
  }
}

async function getCalendar(output, res, req) {
  try {
    const table_path = path.join(__dirname, '..', 'public', 'partials', 'calendario_table.html');
    const legend_path = path.join(__dirname, '..', 'public', 'partials', 'calendario_legend.html');

    // Leggiamo il contenuto dei file. 'await' attende che la lettura sia completata.
    const results = await readFileAsync(table_path);
    const legend = await readFileAsync(legend_path);

    const reset = `    <script>

</script>`;
    output.content = {
        // filters,
        results,
        legend
      } || '<div>No .section content found</div>';
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error (getCalendar)');
  }
}

async function getCalendarFromFIDAL(output, res, req) {
  try {
    const website = 'https://www.fidal.it/calendario.php';

    // Build full link with query parameters from original URL
    const url = req.protocol + '://' + req.get('host') + req.originalUrl;
    const secondPartLink = url.split('?')[1];
    const fullLink = website + (secondPartLink ? '?' + secondPartLink : '');

    console.log('Fetching:', fullLink);

    // Download the page content
    const response = await axios.get(fullLink);
    const $ = cheerio.load(response.data);

    // Grab the whole section
    const $section = $('.section');

    // Extract filters (the form with id calendario)
    const filters = $section.find('form#calendario').parent().html() || '';

    // Extract results table container (assumed .table_btm)
    const results = $section.find('.table_btm').html() || '';

    // Extract legend (container with h5 containing "Legenda")
    const legend = $section.find('h5').filter((i, el) => {
      return $(el).text().trim().toLowerCase().includes('legenda');
    }).parent().html() || '';

    const reset = `    <script>

</script>`;
    output.content = {
        filters,
        results,
        legend
      } || '<div>No .section content found</div>';
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error (cheerio getCalendar)');
  }
}

async function getAtleti(output, res) {
  try {
    const websiteUrl = 'https://atletica.me/societa/211';
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(websiteUrl, { waitUntil: 'domcontentloaded' });

    const glob_tutti_gli_atleti = await page.evaluate(() => {
      return window.glob_tutti_gli_atleti || [];
    });

    console.log('Array Content:', glob_tutti_gli_atleti);
    console.log('Array Length:', glob_tutti_gli_atleti.length);

    // Extracting specific properties from each object
    const extractedPropertiesArray = glob_tutti_gli_atleti.map(obj => {

      if (obj[2] === null || obj[2] === 'null') {
        obj[2] = 'https://atletica.me/img/noimage.jpg';
      }
      if (obj.generale === null || obj.generale === 'null') {
        obj.generale = 'Polivalente';
      }

      return {
        profile_image: obj[2],
        id: obj.id || 'No ID',
        name: obj.nomecognome,
        gender: obj.sesso,
        category_id: obj.categoria_id,
        birth_year: obj.anno_nascita,
        age: obj.eta,
        data_nascita: obj.data_nascita,
        generale: obj.generale,
        punteggio_migliore_anno_attuale: obj[10],
      };
    });

    // Sorting by category and then by name
    extractedPropertiesArray.sort((a, b) => {
      if (a.category_id !== b.category_id) {
        return a.category_id - b.category_id;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

    // Category mapping
    const categorie = {
      70: "Esordienti maschi",
      71: "Esordienti femmine",
      72: "Ragazzi U14",
      73: "Ragazze U14",
      74: "Cadetti U16",
      75: "Cadette U16",
      76: "Alievi U18",
      77: "Alieve U18",
      78: "Juniores uomini U20",
      79: "Juniores donne U20",
      80: "Promesse uomini U23",
      81: "Promesse donne U23",
      82: "Senior uomini",
      83: "Senior donne",
      84: "Master uomini O35",
      85: "Master donne O35",
      86: "Master uomini O40",
      87: "Master donne O40",
      88: "Master uomini O45",
      89: "Master donne O45",
      90: "Master uomini O50",
      91: "Master donne O50",
      92: "Master uomini O55",
      93: "Master donne O55",
      94: "Master uomini O60",
      95: "Master donne O60",
      96: "Master uomini O65",
      97: "Master donne O65",
      98: "Master uomini O70",
      99: "Master donne O70",
    };


    function printAthleteDataWithCategory(athletes) {
      let lastCategory = null;
      let lastAthleteOfCategory = null;
      const formattedLines = [];

      athletes.forEach(obj => {
        const category_id = obj.category_id;
        const categoryName = categorie[category_id] || "other";

        if (categoryName !== lastCategory) {
          if (lastAthleteOfCategory !== null) {
            formattedLines.push('</div>');
          }

          if (lastCategory !== null) {
            formattedLines.push('</div>');
          }

          formattedLines.push(`<div class="categoryDiv" id="${categoryName.replace(/\s+/g, '')}">`);
          formattedLines.push(`<h2>${categoryName}</h2>`);
          formattedLines.push('<div class="athletesContainer">'); // Open div for athletes in this category
          lastCategory = categoryName;
        }

        const genderLabel = obj.gender == 2 ? "maschio" : obj.gender == 3 ? "femmina" : "other";

        formattedLines.push(`
          <div class="athlete ${genderLabel}" onclick="openLink('https://atletica.me/atleta/${obj.id}');">
            <div class="part1">
              <img src="${obj.profile_image}" width="50px" height="50px" class="athleteField profileImg" />
            </div>
            <div class="part2">
              <div>
                <h3 class="athleteField">${obj.name}</h3>
              </div>
              <div>
                <div class="athleteField">${obj.age} Anni</div>
                <div class="athleteField">${obj.generale}</div>
                <div class="athleteField">
                  ${obj.data_nascita && !isNaN(new Date(obj.data_nascita).getFullYear()) ?
                    (obj.data_nascita.length === 4 ?
                      new Date(obj.data_nascita, 0).toLocaleDateString('it-IT', { year: 'numeric' }) :
                      new Date(obj.data_nascita).toLocaleDateString('it-IT', { year: 'numeric', day: '2-digit', month: 'long' })) :
                    (typeof obj.data_nascita === 'string' ? obj.data_nascita.slice(0, 4) : 'Data non valida')}
                </div>
              </div>
            </div>
          </div>
        `);

        lastAthleteOfCategory = obj;
      });

      if (lastAthleteOfCategory !== null) {
        formattedLines.push('</div>');
      }

      if (lastCategory !== null) {
        formattedLines.push('</div>');
      }

      return formattedLines.join('\n');
    }

    const concatenatedLines = printAthleteDataWithCategory(extractedPropertiesArray);

    await browser.close();

    output.content = `<div class="athletesList"> <h1 class="bigBigTitle"><p style="font-size: 0.655em; text-align: center; margin: 0; line-height: 70%; transform: translateX(0.1em)">I NOSTRI</p>ATLETI</h1>${concatenatedLines}</div>`;
  } catch (error) {
    console.error('Error:', error.message)
    next(error);
  }
}

async function getAthlete(output, res) {
  try {

    const websiteUrl = "https://atletica.me/atleta/Daniel-Synek/691523";

    const browser = await puppeteer.launch();
    const page = await browser.newPage();


    await page.goto(websiteUrl, { waitUntil: 'domcontentloaded' });

    const risultati_filtrati_anno = await page.evaluate(() => {
      return window.glob_tutti_gli_atleti || [];
    });

    console.log('Array Content:', risultati_filtrati_anno);
    console.log('Array Length:', risultati_filtrati_anno.length);



  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
}

async function getGare(output, res) {
  //https://www.fidal.it/societa/SAF-BOLZANO-1953/BZ018
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
    <div class="longSection containsOther">
      <div class="outputMessageForSection"><p class="title">Gare nei prossimi giorni</p><p class="message">${result}</p></div>
      <div class="recordDiSocieta"></div>
    </div>
    `;

    //console.log('Content of the result:', result);

  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
    return;
  }
}

const infoStaff = [
  { nome: 'Alessio', cognome: 'Fuganti', anno: 2000, ruolo: 'Presidente', specialita: 'Mezzofondo', foto: 'https://' },
  { nome: 'Mirco', cognome: 'Flaim', anno: 2000, ruolo: 'Allenatore', specialita: 'Lanci', foto: 'https://' },
  { nome: 'Stefano', cognome: 'Sartori', anno: 2000, ruolo: 'Allenatore', specialita: 'Prove multiple', foto: 'https://' },
  { nome: 'Michele', cognome: 'Sacco', anno: 2000, ruolo: 'Allenatore', specialita: 'Velocità', foto: 'https://' },
  { nome: 'Chiara', cognome: 'Cardinale', anno: 2000, ruolo: 'Fiseoterapista', specialita: 'Asta', foto: 'https://' },
];

function populateStaff() {
  db.run('CREATE TABLE IF NOT EXISTS staff (id INTEGER PRIMARY KEY, nome TEXT, cognome TEXT, anno INTEGER, ruolo TEXT, specialita TEXT, foto TEXT)');

  infoStaff.forEach(person => {
    db.run('INSERT INTO staff (nome, cognome, anno, ruolo, specialita, foto) VALUES (?, ?, ?, ?, ?, ?)', [person.nome, person.cognome, person.anno, person.ruolo, person.specialita, person.foto], function (err) {
      if (err) {
        console.error('Error inserting data:', err.message);
      } else {
        console.log(`Inserted row with ID ${this.lastID}`);
      }
    });
  });
}

function getStaff() {
  db.all('SELECT * FROM staff', (err, rows) => {
    if (err) {
      console.error('Error retrieving data:', err.message);
      return;
    }

    const retrievedData = rows.map(row => ({ id: row.id, nome: row.nome, cognome: row.cognome, anno: row.anno, ruolo: row.ruolo, specialita: row.specialita, foto: row.foto }));

    console.log('Retrieved Data:', retrievedData);

    const readStaff = retrievedData.map(obj => {
      if (obj.foto === null || obj.foto === 'null' || obj.foto === 'https://') {
        obj.foto = 'https://atletica.me/img/noimage.jpg';
      }

      return {
        id: obj.id,
        nome: obj.nome,
        cognome: obj.cognome,
        anno: obj.anno,
        ruolo: obj.ruolo,
        specialita: obj.specialita,
        foto: obj.foto,
      };
    });

    console.log('Read Staff Data:', readStaff);

    const before = `<div class="athletesList"><div class="categoryDiv"><div class="athletesContainer">`;
    const after = `</div></div></div>`;

    const content = readStaff.map(person => `
    <div class="staffSlot fakeGlassGreenBack">
            <div class="part1">  
              <img src="${person.foto}" width="100%" height="100%" class="athleteField staffImg" />
            </div>
          
            <div class="part2">
              <div>
                <h3 class="athleteField">${person.nome} ${person.cognome}</h3>
              </div>
              <div>
                <div class="athleteField">${person.ruolo}</div>
                <div class="athleteField">${person.specialita}</div>
                <div class="athleteField">${person.anno}</div>
              </div>
            </div>
          </div>
    `).join('\n');
    output.content = before + content + after;
    staffContent = output.content;

    return output.content;
  });
}

async function getArticle(output, res, articleId) {
  const accessToken = 'IGQWRQOFpMTEk1Y2w1T1B0TmtQLUpXd3FPVnBlTGFnYjVjbU95SDNZAQVlPclo4cUtURG1IY0Fwd3VwS2tqYUd2bl9iVVg2WmhqZA3luSXJKVVFlMEc1SU8wTWJtTW1EclRHT0ctOHFzMTkzS2lrSVlpS3Y0U21TSTgZD';
  const userId = '17841410337593221';

  try {
    const response = await fetch(
      `https://graph.instagram.com/${articleId}?fields=id,caption,media_url,permalink,media_type&access_token=${accessToken}`
    );
    const article = await response.json();
    console.log('API Response:', article);
    console.log('Article ID:', articleId);

    if (!article || article.error) {
      output.content = 'Article not found.';
      return;
    }

    const isVideo = article.media_type === 'VIDEO';
    const descriptionWithLinks = linkifyMentions(article.caption || '');

    output.content = `
      <div class="ig-post articleBack">
        ${isVideo ? `<video controls><source src="${article.media_url}" type="video/mp4"></video>` : `<img src="${article.media_url}" alt="${article.caption || 'Instagram Post'}">`}
        <div class="description">
          <h3>${descriptionWithLinks.split('\n')[0]}</h3>
          <p class="paragraph">${descriptionWithLinks.substring(descriptionWithLinks.indexOf('\n') + 1).replace(/\n/g, '<br>')}</p>
          <a class="articleLink" href="${article.permalink}" target="_blank">Continua su instagram</a>
        </div>
      </div>
    `;
    res.send(output.content);
  } catch (error) {
    console.error('Error:', error.message);
    output.content = 'Internal Server Error';
  }
};

/* IGQWRQQURlZAUdOVmxiYmRKZAE5xcDh3QTQ5cy1fZA05yRzBtRS1FM0lta05lLUJOdlRsdEN4cGRrSmUtWkMzSV9yVDBTQ01RWFRnVS1NNk5FQ2x4dnZA1bVF4Ry1XODEyVXpSYzlaVUFERmdUb3RSbE4ya2NuMUY4YjgZD */
async function getNews(output, res) {
  const accessToken = 'IGQWRQOFpMTEk1Y2w1T1B0TmtQLUpXd3FPVnBlTGFnYjVjbU95SDNZAQVlPclo4cUtURG1IY0Fwd3VwS2tqYUd2bl9iVVg2WmhqZA3luSXJKVVFlMEc1SU8wTWJtTW1EclRHT0ctOHFzMTkzS2lrSVlpS3Y0U21TSTgZD';
  const targetUsername = 'saf_bolzano';
  const username = "pakistan_torri";
  const password = "pakistan2024!!";
  const userId = '17841410337593221';

  try {
    const response = await fetch(
      `https://graph.instagram.com/${userId}/media?fields=id,caption,media_url,permalink,media_type&access_token=${accessToken}&limit=20`
    );
    const { data: posts } = await response.json();

    if (!posts || posts.length === 0) {
      output.content = 'No posts found.';
      return;
    }

    const htmlOutput = posts.map((post) => {
      const isVideo = post.media_type === 'VIDEO';
      const descriptionWithLinks = linkifyMentions(post.caption || ''); // Handle missing captions
      //onclick="goToPost(${post.id})"
      //<!--<a class="newsLink" href="${post.permalink}" target="_blank"><i class="fa-brands fa-instagram color"></i></a>!-->
      return `
        <div class="ig-post newsBack" id="${post.id}" onlick="openLink(${post.permalink})">
          ${isVideo ? `<video controls><source src="${post.media_url}" type="video/mp4"></video>` : `<img src="${post.media_url}" alt="${post.caption || 'Instagram Post'}">`}
          <div class="description">
            <h3>${descriptionWithLinks.split('\n')[0]}</h3>
            <p class="paragraph">${descriptionWithLinks.substring(descriptionWithLinks.indexOf('\n') + 1).replace(/\n/g, '<br>')}</p>
            <a href="${post.permalink}" target="_blank" class="newsLink"><i class="fa-solid fa-chevron-down"></i></a>
          </div>
          
          
        </div>
      `;
    }).join('');

    output.content = htmlOutput;
  } catch (error) {
    console.error('Error:', error.message);
    output.content = 'Internal Server Error';
  }

  function linkifyMentions(description) {
    return description
      .replace(/@(\S+)/g, '<a href="https://instagram.com/$1" target="_blank">@$1</a>')
      .replace(/#(\S+)/g, '<a href="https://www.instagram.com/explore/tags/$1" target="_blank">#$1</a>');
  }
}

async function getRecordSociali(output, res) {
  db.all("SELECT disciplina, tempo, nome, cognome, data FROM record_sociali", (err, rows) => {
    if (err) {
      console.error(err.message);
      return;
    }

    let tableRows = '';

    tableRows += '<tr>';
    for (const key in rows[0]) {
      tableRows += `<th>${key}</th>`;
    }
    tableRows += '</tr>';

    rows.forEach(record => {
      tableRows += '<tr>';
      for (const key in record) {
        tableRows += `<td>${record[key]}</td>`;
      }
      tableRows += '</tr>';
    });

    output.content = `<table class="table_btm">${tableRows}</table>`;
  });
}

async function getHome(output, res) {
  const accessToken = 'IGQWRQOFpMTEk1Y2w1T1B0TmtQLUpXd3FPVnBlTGFnYjVjbU95SDNZAQVlPclo4cUtURG1IY0Fwd3VwS2tqYUd2bl9iVVg2WmhqZA3luSXJKVVFlMEc1SU8wTWJtTW1EclRHT0ctOHFzMTkzS2lrSVlpS3Y0U21TSTgZD';
  const userId = '17841410337593221';

  try {
    const response = await fetch(
      `https://graph.instagram.com/${userId}/media?fields=id,caption,media_url,permalink,media_type&access_token=${accessToken}&limit=20`
    );
    const { data: posts } = await response.json();

    if (!posts || posts.length === 0) {
      output.content = 'No posts found.';
      return;
    }

    // Prendi solo gli ultimi 3 post
    const latestPosts = posts.slice(0, 3);

    const htmlOutput = latestPosts.map((post) => {
      const isVideo = post.media_type === 'VIDEO';
      const descriptionWithLinks = linkifyMentions(post.caption || ''); // Gestisci le didascalie mancanti

      return `
      <a class="newsLink newsHome" href="${post.permalink}" target="_blank">
        <div class="" id="${post.id}">
          ${isVideo ? `<video controls><source src="${post.media_url}" type="video/mp4"></video>` : `<img src="${post.media_url}" alt="${post.caption || 'Instagram Post'}">`}
        </div>
        <div class="description">
            <h3>${descriptionWithLinks.split('\n')[0]}</h3>
            <!--<p class="paragraph">${descriptionWithLinks.substring(descriptionWithLinks.indexOf('\n') + 1).replace(/\n/g, '<br>')}</p>!-->
            
          </div>
        </a>
      `;
    }).join('');

    output.content = htmlOutput;
  } catch (error) {
    console.error('Error:', error.message);
    output.content = 'Internal Server Error';
  }

  function linkifyMentions(description) {
    return description
      .replace(/@(\S+)/g, '<a href="https://instagram.com/$1" target="_blank">@$1</a>')
      .replace(/#(\S+)/g, '<a href="https://www.instagram.com/explore/tags/$1" target="_blank">#$1</a>');
  }
}


async function getNumberOfAthletes(output, res) {
  try {
    // Definiamo il percorso del file JSON. `path.join` si assicura che funzioni su tutti i sistemi operativi.
    const jsonFilePath = path.join(__dirname, '..', 'public', 'partials', 'statistiche_atleti.json');

    // Leggiamo il contenuto del file. 'await' attende che la lettura sia completata.
    const fileContent = await readFileAsync(jsonFilePath);
        
    // Convertiamo la stringa JSON in un oggetto JavaScript.
    const statistiche_atleti = JSON.parse(fileContent);
    
    output.content = `<div>
                <div class="n-container beat shadowBack">
                    <h3>MASCHI</h3>
                    <p>${statistiche_atleti.maschi}</p>
                </div>
                <div class="n-container beat shadowBack">
                    <h3>FEMMINE</h3>
                    <p>${statistiche_atleti.femmine}</p>
                </div>
                <div class="n-container beat shadowBack">
                    <h3>ATLETI</h3>
                    <p>${statistiche_atleti.atleti}</p>
                </div>
            </div>`;
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error getnumberofathletes');
  }
}

router.get('/', async (req, res) => {
  const imageFiles = getImagesFromFolder(path.join(__dirname, '../public/data/gallery'));
  await getHome(output, res);
  res.render('home', { pageTitle: "home", output: output, images: imageFiles });
});

module.exports = router;
