const express = require('express');
const router = express.Router();
const path = require('path');
const getBrowser = require('./browser'); // path to the shared browser module
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
// const { chromium } = require('playwright');

// const chromiumPath = process.env.CHROMIUM_PATH || '/usr/bin/chromium';

process.env.PUPPETEER_CACHE_DIR = '/la_cash';

router.use(bodyParser.json());

const db = new sqlite3.Database('database.db');

const paths = ['', 'news', 'iscrizioni', 'atleti', 'staff', 'risultati', 'galleria', 'calendario', 'info'];
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

  const folderPath = path.join('public/images/gallery', folder);
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
        <title>${folder}</title>
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
          <h1 style="color: white; text-align: center; font-size: 50px;">${folder}</h1>
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
  const folderPath = path.join(__dirname, '../public/images/gallery');
  const subfolders = getSubfoldersFromFolder(folderPath);

  try {
    if (pageName !== 'home') {

      switch (pageName) {
        case "admin":
          break;
        case "news":
          await getNews(output, res);
          pathToImgDir = imgFolder + middlePath + pageName;
          break;
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
          pathToImgDir = imgFolder + `/gallery`;
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
  } catch {
    res.send('Errore grave. contattare alex.decarli@safbolzano.it');
    console.error('Error:', error.message);
  }
  output.content = `        <div class="text-holder">
            
            <div class="row">
                <div class="col-sm-4">
                    <h1>
                        Calendario                    </h1>
                </div>
                <div class="col-sm-4 right" style="float:right;">
                    <a href="calendario_graf.php" class="calendarbot">
                        <i class="fa fa-calendar" style="color:black;"></i><label>calendario grafico</label>
                    </a>
                </div>
            </div>    
            

            <div class="common_section none">
                <p>
                </p><form id="calendario" method="GET" action="">
                    <fieldset>

                        <table class="selezione" style="width:100%;">
                            <tbody><tr>
                                <td>
                                    <label for="anno">Anno:</label> <br>
                                    <select name="anno" id="anno">
                                        <option value="2025" selected="">2025</option><option value="2024">2024</option><option value="2023">2023</option><option value="2022">2022</option><option value="2021">2021</option><option value="2020">2020</option><option value="2019">2019</option><option value="2018">2018</option><option value="2017">2017</option><option value="2016">2016</option><option value="2015">2015</option><option value="2014">2014</option><option value="2013">2013</option><option value="2012">2012</option><option value="2011">2011</option><option value="2010">2010</option><option value="2009">2009</option><option value="2008">2008</option><option value="2007">2007</option><option value="2006">2006</option><option value="2005">2005</option><option value="2004">2004</option><option value="2003">2003</option><option value="2002">2002                                    </option></select>
                                </td>
                                <td>
                                    <label for="mese">Mese:</label><br>
                                    <select name="mese" id="mese">
                                        <option value="1">Gennaio
</option><option value="2">Febbraio
</option><option value="3">Marzo
</option><option value="4">Aprile
</option><option value="5">Maggio
</option><option value="6">Giugno
</option><option value="7" selected="">Luglio
</option><option value="8">Agosto
</option><option value="9">Settembre
</option><option value="10">Ottobre
</option><option value="11">Novembre
</option><option value="12">Dicembre
                                    </option></select>
                                </td>
                                <td>
                                    <label for="livello">Livello:</label><br>
                                    <select name="livello" id="livello" onchange="setTipologie();">
                                        <option value=""></option>
                                        <option value="COD" selected="">Nazionale</option><option value="REG">Regionale</option>                                    </select>
                                </td>
                                <td>
                                    <label for="regione">Regione:</label><br>
                                    <select name="new_regione" id="new_regione">        
                                        <option value="" selected=""></option><option value="ABRUZZO">Abruzzo</option><option value="ALTOADIGE">Alto Adige</option><option value="BASILICATA">Basilicata</option><option value="CALABRIA">Calabria</option><option value="CAMPANIA">Campania</option><option value="EMILIAROMAGNA">Emilia Romagna</option><option value="FRIULIVENEZIAGIULIA">Friuli Venezia Giulia</option><option value="LAZIO">Lazio</option><option value="LIGURIA">Liguria</option><option value="LOMBARDIA">Lombardia</option><option value="MARCHE">Marche</option><option value="MOLISE">Molise</option><option value="PIEMONTE">Piemonte</option><option value="PUGLIA">Puglia</option><option value="SARDEGNA">Sardegna</option><option value="SICILIA">Sicilia</option><option value="TOSCANA">Toscana</option><option value="TRENTINO">Trentino</option><option value="UMBRIA">Umbria</option><option value="VALLEDAOSTA">Valledaosta</option><option value="VENETO">Veneto</option>      
                                    </select>
                                </td>
                                <td>
                                    <label for="new_tipo">Tipologia:</label><br>
                                    <select name="new_tipo" id="tipo" onchange="setOmologazione(this.value);">
                                        <option value="0"></option>
                                        <option value="2">Cross</option><option value="3">Indoor</option><option value="8">Marcia su strada</option><option value="11">Montagna</option><option value="4">Montagna/trail</option><option value="13">Nordic walking</option><option value="5">Outdoor</option><option value="10">Piazza e altri ambiti</option><option value="6">Strada</option><option value="12">Trail</option><option value="7">Ultramaratona</option><option value="9">Ultramaratona/trail</option>  
                                    </select>
                                </td>
                                <td><label for="new_categoria">Categoria:</label><br>
                                    <select name="new_categoria" id="categoria">
                                        <option value="" selected=""></option><option value="ESO">Esordienti</option><option value="RAG">Ragazzi</option><option value="CAD">Cadetti</option><option value="ALL">Allievi</option><option value="JUN">Juniores</option><option value="PRO">Promesse</option><option value="SEN">Seniores</option><option value="MAS">Master</option>
                                    </select>
                                </td>
                                <td style="margin-top:22px;"><input type="reset" value="Reset"><br></td>
                                <td>
                                <input style="margin-top:6px;" class="button" type="submit" name="submit" id="submit" value="Invia">
                                </td>
                            </tr>
                        </tbody></table>

                        <table class="selezione" style="width:100%;">
                            <tbody><tr>
                                <td style="width:180px;">
                                                                        <input type="checkbox" id="new_campionati" name="new_campionati" value="1">
                                    <label for="new_campionati">Campionati Federali</label>
                                </td>
                                <td style="width:180px;">
                                    <label id="omologazione_lb" for="omologazione" style="display: none;">Omologazione:</label>
                                    <select name="omologazione" id="omologazione" disabled="" style="display: none;">
                                        <option value="">Tutte</option>
                                        <option value="no">No</option>
                                        <option value="si">Si</option>
                                    </select>
                                </td>
                                <td>
                                    <label id="omologazione_tipo_lb" for="omologazione_tipo" style="display: none;">Omologazione tipo:</label>
                                    <select name="omologazione_tipo" id="omologazione_tipo" disabled="" style="display: none;">
                                        <option value="">Tutte</option>
                                        <option value="a">A</option>
                                        <option value="b">B</option>
                                    </select>
                                </td>
                            </tr>
                        </tbody></table>
 
                        </fieldset>
                    </form>
                <p></p>  

            </div>

                        
            <a href="https://www.fidal.it/ical/ical_man.php?&amp;anno=2025&amp;mese=07&amp;livello=COD" target="_blank" class="calendarbot" style="float:left;">
                <i class="fa fa-calendar-check-o"></i>
            </a>
            <br>
            <br>
                        <div class="table_btm">
                            <table width="100%" class="table tablesorter tablesorter-default" role="grid" aria-labelledby="tablesorter019e516f28f65caption">
                                <caption class="sr-only" id="tablesorter019e516f28f65caption"></caption>
                                <thead class="head">
                                    <tr role="row" class="tablesorter-headerRow"><th width="3%" data-column="0" class="tablesorter-header tablesorter-headerUnSorted" tabindex="0" scope="col" role="columnheader" aria-disabled="false" unselectable="on" aria-sort="none" aria-label=": No sort applied, activate to apply an ascending sort" style="user-select: none;"><div class="tablesorter-header-inner"></div></th>
                                    <th width="7%" data-column="1" class="tablesorter-header tablesorter-headerUnSorted" tabindex="0" scope="col" role="columnheader" aria-disabled="false" unselectable="on" aria-sort="none" aria-label="Data: No sort applied, activate to apply an ascending sort" style="user-select: none;"><div class="tablesorter-header-inner">Data</div></th>
                                    <th width="3%" data-column="2" class="tablesorter-header tablesorter-headerUnSorted" tabindex="0" scope="col" role="columnheader" aria-disabled="false" unselectable="on" aria-sort="none" aria-label="Livello: No sort applied, activate to apply an ascending sort" style="user-select: none;"><div class="tablesorter-header-inner">Livello</div></th>
                                    <th data-column="3" class="tablesorter-header tablesorter-headerUnSorted" tabindex="0" scope="col" role="columnheader" aria-disabled="false" unselectable="on" aria-sort="none" aria-label="Denominazione: No sort applied, activate to apply an ascending sort" style="user-select: none;"><div class="tablesorter-header-inner">Denominazione</div></th>
                                    <th data-column="4" class="tablesorter-header tablesorter-headerUnSorted" tabindex="0" scope="col" role="columnheader" aria-disabled="false" unselectable="on" aria-sort="none" aria-label="Tipologia: No sort applied, activate to apply an ascending sort" style="user-select: none;"><div class="tablesorter-header-inner">Tipologia</div></th>
                                    <th data-column="5" class="tablesorter-header tablesorter-headerUnSorted" tabindex="0" scope="col" role="columnheader" aria-disabled="false" unselectable="on" aria-sort="none" aria-label="Località: No sort applied, activate to apply an ascending sort" style="user-select: none;"><div class="tablesorter-header-inner">Località</div></th>
                                </tr></thead>    
                                <tbody aria-live="polite" aria-relevant="all">

                                <tr role="row" class="odd"><td><i class="fa fa-circle" style="color:red;"></i></td><td><b style="color:black;" title="VenerdÃ¬ - Domenica">04-06/07</b></td><td><abbr title="NAZ.LE">N</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/CAMPIONATI-ITALIANI-INDIVIDUALI-su-PISTA-JUNIORES-E-PROMESSE/COD13168">CAMPIONATI ITALIANI INDIVIDUALI su PISTA JUNIORES E PROMESSE</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">OUTDOOR</td><td style="text-align: left;">Grosseto (GR)</td></tr><tr role="row" class="even"><td><i class="fa fa-circle" style="color:gray;"></i></td><td><b style="color:black;" title="VenerdÃ¬">04/07</b></td><td><abbr title="BRONZE">B</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/XIV^-Edizione-CorriArsago-3-Memorial-“Corri-per-il-Gaspa”/COD13304">XIV^ Edizione CorriArsago 3° Memorial “Corri per il Gaspa”</a><br><font style="font-style: italic;">5km</font></td><td style="text-align: left;">STRADA</td><td style="text-align: left;">Arsago Seprio (VA)</td></tr><tr role="row" class="odd"><td><i class="fa fa-circle" style="color:gray;"></i></td><td><b style="color:black;" title="Sabato">05/07</b></td><td><abbr title="BRONZE">B</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/X^-Sei-Ore-de-Conti/COD13064">X^ Sei Ore de Conti</a><br><font style="font-style: italic;">6h</font></td><td style="text-align: left;">ULTRAMARATONA</td><td style="text-align: left;">Serra De' Conti (AN)</td></tr><tr role="row" class="even"><td></td><td><b style="color:black;" title="Sabato">05/07</b></td><td><abbr title="BRONZE">B</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/X^-Primiero-Dolomiti-Marathon/COD12958">X^ Primiero Dolomiti Marathon</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">TRAIL</td><td style="text-align: left;">Primiero San Martino Di Castrozza TN</td></tr><tr role="row" class="odd"><td></td><td><b style="color:black;" title="Domenica">06/07</b></td><td><abbr title="BRONZE">B</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/XVIII^-IVARS-Tre-Campanili-Half-Marathon/COD13266">XVIII^ IVARS Tre Campanili Half Marathon</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">MONTAGNA</td><td style="text-align: left;">Vestone (BS)</td></tr><tr role="row" class="even"><td></td><td><b style="color:black;" title="Domenica">06/07</b></td><td><abbr title="BRONZE">B</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/X^-Trofeo-Fattoria-Didattica/COD13300">X^ Trofeo Fattoria Didattica</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">MONTAGNA</td><td style="text-align: left;">Morbegno (SO)</td></tr><tr role="row" class="odd"><td></td><td><b style="color:black;" title="Domenica">06/07</b></td><td><abbr title="NAZ.LE">N</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/VII^-Birrasta-Memorial-Gian-Paolo-PAPO-Bolondi-/COD12872">VII^ Birrasta "Memorial Gian Paolo PAPO Bolondi"</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">PIAZZA e altri ambiti</td><td style="text-align: left;">Novellara (RE)</td></tr><tr role="row" class="even"><td><i class="fa fa-circle" style="color:gray;"></i></td><td><b style="color:black;" title="Domenica">06/07</b></td><td><abbr title="BRONZE">B</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/Annullato-X^-Trofeo-Citta-di-Castrofilippo/COD12890">Annullato - X^ Trofeo Citta' di Castrofilippo</a><br><font style="font-style: italic;">10km</font></td><td style="text-align: left;">STRADA</td><td style="text-align: left;">Castrofilippo (AG)</td></tr><tr role="row" class="odd"><td><i class="fa fa-circle" style="color:red;"></i></td><td><b style="color:black;" title="MartedÃ¬">08/07</b></td><td><abbr title="INTERNAZ.LE">I</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/XXXVI^-Meeting-Arcobaleno-EAP-Atleticaeuropa/COD12874">XXXVI^ Meeting Arcobaleno EAP Atleticaeuropa</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">OUTDOOR</td><td style="text-align: left;">Celle Ligure (SV)</td></tr><tr role="row" class="even"><td><i class="fa fa-circle" style="color:gray;"></i></td><td><b style="color:black;" title="MercoledÃ¬">09/07</b></td><td><abbr title="BRONZE">B</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/XXXV^-Kermesse-in-Notturna/COD14058">XXXV^ Kermesse in Notturna</a><br><font style="font-style: italic;">5km</font></td><td style="text-align: left;">STRADA</td><td style="text-align: left;">Perugia (PG)</td></tr><tr role="row" class="odd"><td><i class="fa fa-circle" style="color:red;"></i></td><td><b style="color:black;" title="MercoledÃ¬">09/07</b></td><td><abbr title="INTERNAZ.LE">I</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/XXXVIII^-Meeting-Int-le-Trofeo-Citta-di-Avellino-/COD12972">XXXVIII^ Meeting Int.le "Trofeo Citta' di Avellino"</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">OUTDOOR</td><td style="text-align: left;">Avellino (AV)</td></tr><tr role="row" class="even"><td><i class="fa fa-circle" style="color:red;"></i></td><td><b style="color:black;" title="GiovedÃ¬">10/07</b></td><td><abbr title="INTERNAZ.LE">I</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/XXVIII^-Meeting-Internazionale-Citta-di-Nembro-/COD13283">XXVIII^ Meeting Internazionale "Citta' di Nembro"</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">OUTDOOR</td><td style="text-align: left;">Nembro (BG)</td></tr><tr role="row" class="odd"><td></td><td><b style="color:black;" title="GiovedÃ¬">10/07</b></td><td><abbr title="INTERNAZ.LE">I</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/II^-Pole-Vault-Opitergium/COD12788">II^ Pole Vault Opitergium</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">PIAZZA e altri ambiti</td><td style="text-align: left;">Oderzo (TV)</td></tr><tr role="row" class="even"><td><i class="fa fa-circle" style="color:red;"></i></td><td><b style="color:black;" title="Sabato">12/07</b></td><td><abbr title="INTERNAZ.LE">I</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/5--Meeting-della-Leonessa-9--Memorial-Davide-Boroni/COD13350">5. Meeting della Leonessa - 9. Memorial Davide Boroni</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">OUTDOOR</td><td style="text-align: left;">Brescia (BS)</td></tr><tr role="row" class="odd"><td><i class="fa fa-circle" style="color:red;"></i></td><td><b style="color:black;" title="Sabato - Domenica">12-13/07</b></td><td><abbr title="NAZ.LE">N</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/Campionati-Assoluti-FISPES/COD14052">Campionati Assoluti FISPES</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">OUTDOOR</td><td style="text-align: left;">Grosseto (GR)</td></tr><tr role="row" class="even"><td><i class="fa fa-circle" style="color:red;"></i></td><td><b style="color:black;" title="Sabato">12/07</b></td><td><abbr title="INTERNAZ.LE">I</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/XXI^-Meeting-su-pista-Regione-FVG---ospiti-di-gente-unica-Provincia-di/COD12979">XXI^ Meeting su pista Regione FVG...ospiti di gente unica - Provincia di Pordenone - Comune di Brugnera - 10^ Memorial Guido Maccan - 6^ Memorial Gianfranco Chessa</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">OUTDOOR</td><td style="text-align: left;">Brugnera (PN)</td></tr><tr role="row" class="odd"><td><i class="fa fa-circle" style="color:gray;"></i></td><td><b style="color:black;" title="Domenica">13/07</b></td><td><abbr title="BRONZE">B</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/III^-La-Sant-Erasmo-Run-K10/COD13214">III^ La Sant'Erasmo Run K10</a><br><font style="font-style: italic;">10km</font></td><td style="text-align: left;">STRADA</td><td style="text-align: left;">Taggia (IM)</td></tr><tr role="row" class="even"><td></td><td><b style="color:black;" title="Domenica">13/07</b></td><td><abbr title="BRONZE">B</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/LXXI^-San-Giacomo-Altissimo/COD12984">LXXI^ San Giacomo Altissimo</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">MONTAGNA</td><td style="text-align: left;">Brentonico Loc San Giacomo TN</td></tr><tr role="row" class="odd"><td><i class="fa fa-circle" style="color:red;"></i></td><td><b style="color:black;" title="Domenica">13/07</b></td><td><abbr title="INTERNAZ.LE">I</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/XXXVI^-Meeting-Int-le-Sport-e-Solidarieta-Lignano-Sabbiadoro/COD12976">XXXVI^ Meeting Int.le Sport e Solidarieta' Lignano Sabbiadoro</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">OUTDOOR</td><td style="text-align: left;">Lignano Sabbiadoro (UD)</td></tr><tr role="row" class="even"><td><i class="fa fa-circle" style="color:red;"></i></td><td><b style="color:black;" title="MartedÃ¬">15/07</b></td><td><abbr title="INTERNAZ.LE">I</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/II^-Grand-Prix-Brescia-2025/COD13294">II^ Grand Prix Brescia 2025</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">OUTDOOR</td><td style="text-align: left;">Brescia (BS)</td></tr><tr role="row" class="odd"><td><i class="fa fa-circle" style="color:red;"></i></td><td><b style="color:black;" title="GiovedÃ¬ - Domenica">17-20/07</b></td><td><abbr title="INTERNAZ.LE">I</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/CAMPIONATI-EUROPEI-UNDER-23-SU-PISTA/COD13412">CAMPIONATI EUROPEI  UNDER 23 SU PISTA</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">OUTDOOR</td><td style="text-align: left;">Bergen --</td></tr><tr role="row" class="even"><td></td><td><b style="color:black;" title="VenerdÃ¬">18/07</b></td><td><abbr title="INTERNAZ.LE">I</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/XXI^-Stabhochsprung-Schlanders/COD12768">XXI^ Stabhochsprung Schlanders</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">PIAZZA e altri ambiti</td><td style="text-align: left;">Silandro/schlanders BZ</td></tr><tr role="row" class="odd"><td><i class="fa fa-circle" style="color:gray;"></i></td><td><b style="color:black;" title="VenerdÃ¬">18/07</b></td><td><abbr title="BRONZE">B</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/XV^-Tornaco-di-Notte/COD12904">XV^ Tornaco di Notte</a><br><font style="font-style: italic;">5km</font></td><td style="text-align: left;">STRADA</td><td style="text-align: left;">Tornaco (NO)</td></tr><tr role="row" class="even"><td><i class="fa fa-circle" style="color:green;"></i></td><td><b style="color:black;" title="Sabato">19/07</b></td><td><abbr title="INTERNAZ.LE">I</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/INTERNATIONAL-SNOWDON-RACE/COD14099">INTERNATIONAL SNOWDON RACE</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">MONTAGNA/TRAIL</td><td style="text-align: left;">Llanberis --</td></tr><tr role="row" class="odd"><td><i class="fa fa-circle" style="color:gray;"></i></td><td><b style="color:black;" title="Sabato">19/07</b></td><td><abbr title="BRONZE">B</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/III^-Nuova-Montirun/COD13432">III^ Nuova Montirun</a><br><font style="font-style: italic;">5km</font></td><td style="text-align: left;">STRADA</td><td style="text-align: left;">Montirone (BS)</td></tr><tr role="row" class="even"><td></td><td><b style="color:black;" title="Sabato">19/07</b></td><td><abbr title="BRONZE">B</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/I^-Bagolino-Alpin-Trail/COD13433">I^ Bagolino Alpin Trail</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">TRAIL</td><td style="text-align: left;">Bagolino (BS)</td></tr><tr role="row" class="odd"><td><i class="fa fa-circle" style="color:red;"></i></td><td><b style="color:black;" title="Sabato - Domenica">19-20/07</b></td><td><abbr title="NAZ.LE">N</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/CHALLENGE-ASSOLUTO-SU-PISTA/COD13170">CHALLENGE ASSOLUTO SU PISTA</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">OUTDOOR</td><td style="text-align: left;">Conegliano (TV)</td></tr><tr role="row" class="even"><td><i class="fa fa-circle" style="color:red;"></i></td><td><b style="color:black;" title="Sabato">19/07</b></td><td><abbr title="NAZ.LE">N</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/TROFEO-DELLE-REGIONI-MASTER-su-PISTA/COD13169">TROFEO DELLE REGIONI MASTER su PISTA</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">OUTDOOR</td><td style="text-align: left;">Nocera Inferiore (SA)</td></tr><tr role="row" class="odd"><td><i class="fa fa-circle" style="color:gray;"></i></td><td><b style="color:black;" title="Sabato">19/07</b></td><td><abbr title="BRONZE">B</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/XXVIII^-Attraverso-le-Mura/COD12896">XXVIII^ Attraverso le Mura</a><br><font style="font-style: italic;">10km (U/D), 6km (All. D)</font></td><td style="text-align: left;">STRADA</td><td style="text-align: left;">Massa (MS)</td></tr><tr role="row" class="even"><td><i class="fa fa-circle" style="color:red;"></i></td><td><b style="color:black;" title="Domenica - Sabato">20-26/07</b></td><td><abbr title="INTERNAZ.LE">I</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/FESTIVAL-OLIMPICO-DELLA-GIOVENTU-EUROPEA-UNDER-18/COD13413">FESTIVAL OLIMPICO DELLA GIOVENTU' EUROPEA - UNDER 18</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">OUTDOOR</td><td style="text-align: left;">Skopje --</td></tr><tr role="row" class="odd"><td></td><td><b style="color:black;" title="Domenica">20/07</b></td><td><abbr title="BRONZE">B</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/X^-Piancavallo-Run-Panoramica-delle-Malghe/COD12838">X^ Piancavallo.Run - Panoramica delle Malghe</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">TRAIL</td><td style="text-align: left;">Piancavallo PN</td></tr><tr role="row" class="even"><td></td><td><b style="color:black;" title="Domenica">20/07</b></td><td><abbr title="BRONZE">B</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/II^-Trail-sui-Sentieri-dei-Campioni/COD12944">II^ Trail sui Sentieri dei Campioni</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">TRAIL</td><td style="text-align: left;">Sestriere (TO)</td></tr><tr role="row" class="odd"><td><i class="fa fa-circle" style="color:red;"></i></td><td><b style="color:black;" title="LunedÃ¬ - Domenica">21-27/07</b></td><td><abbr title="INTERNAZ.LE">I</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/CAMPIONATI-MONDIALI-UNIVERSITARI-(UNIVERSIADI)/COD13414">CAMPIONATI MONDIALI UNIVERSITARI (UNIVERSIADI)</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">OUTDOOR</td><td style="text-align: left;">Bochum --</td></tr><tr role="row" class="even"><td><i class="fa fa-circle" style="color:red;"></i></td><td><b style="color:black;" title="MercoledÃ¬">23/07</b></td><td><abbr title="INTERNAZ.LE">I</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/International-Pegaso-Meeting-Citta-di-Firenze/COD13001">International Pegaso Meeting, Citta' di Firenze</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">OUTDOOR</td><td style="text-align: left;">Firenze (FI)</td></tr><tr role="row" class="odd"><td></td><td><b style="color:black;" title="VenerdÃ¬">25/07</b></td><td><abbr title="INTERNAZ.LE">I</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/I^-Jumping-Overcoming-Boundaries/COD13256">I^ Jumping Overcoming Boundaries</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">PIAZZA e altri ambiti</td><td style="text-align: left;">Gorizia (GO)</td></tr><tr role="row" class="even"><td><i class="fa fa-circle" style="color:gray;"></i></td><td><b style="color:black;" title="Sabato">26/07</b></td><td><abbr title="GOLD">G</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/XCIX^-Giro-Podistico-Int-le-di-Castelbuono/COD12957">XCIX^ Giro Podistico Int.le di Castelbuono</a><br><font style="font-style: italic;">10km</font></td><td style="text-align: left;">STRADA</td><td style="text-align: left;">Castelbuono (PA)</td></tr><tr role="row" class="odd"><td></td><td><b style="color:black;" title="Sabato">26/07</b></td><td><abbr title="BRONZE">B</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/XIV^-Trans-D-Havet/COD12808">XIV^ Trans D'Havet</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">TRAIL</td><td style="text-align: left;">Valdagno (VI)</td></tr><tr role="row" class="even"><td><i class="fa fa-circle" style="color:red;"></i></td><td><b style="color:black;" title="Sabato">26/07</b></td><td><abbr title="NAZ.LE">N</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/XIX-Meeting-Nazionale-Citta-di-Teramo/COD13924">XIX Meeting Nazionale Citta' di Teramo</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">OUTDOOR</td><td style="text-align: left;">Teramo (TE)</td></tr><tr role="row" class="odd"><td></td><td><b style="color:black;" title="Sabato">26/07</b></td><td><abbr title="BRONZE">B</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/II^-Giir-di-Mont-Uphill/COD13444">II^ Giir di Mont - Uphill</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">MONTAGNA</td><td style="text-align: left;">Premana (LC)</td></tr><tr role="row" class="even"><td><i class="fa fa-circle" style="color:gray;"></i></td><td><b style="color:black;" title="Sabato">26/07</b></td><td><abbr title="BRONZE">B</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/X^-Memorial-Cristina-Calleri/COD13004">X^ Memorial Cristina Calleri</a><br><font style="font-style: italic;">10km</font></td><td style="text-align: left;">STRADA</td><td style="text-align: left;">Torregrotta (ME)</td></tr><tr role="row" class="odd"><td><i class="fa fa-circle" style="color:gray;"></i></td><td><b style="color:black;" title="Sabato">26/07</b></td><td><abbr title="BRONZE">B</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/Annullato-III^-Edizione-Giro-dell-Abbazia/COD12911">Annullato - III^ Edizione Giro dell'Abbazia</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">STRADA</td><td style="text-align: left;">Montescaglioso (MT)</td></tr><tr role="row" class="even"><td><i class="fa fa-circle" style="color:red;"></i></td><td><b style="color:black;" title="Sabato">26/07</b></td><td><abbr title="INTERNAZ.LE">I</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/XVIII^-Triveneto-Meeting-Internazionale/COD12959">XVIII^ Triveneto Meeting Internazionale</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">OUTDOOR</td><td style="text-align: left;">Trieste (TS)</td></tr><tr role="row" class="odd"><td></td><td><b style="color:black;" title="Sabato">26/07</b></td><td><abbr title="NAZ.LE">N</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/CAMPIONATI-ITALIANI-INDIVIDUALI-Sen-Pro-e-Jun-di-CORSA-IN-MONTAGNA-Uphill/COD13367">CAMPIONATI ITALIANI INDIVIDUALI  Sen/Pro e Jun di CORSA IN MONTAGNA Uphill (validi per il CdS Sen/Pro e Jun)</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">MONTAGNA</td><td style="text-align: left;">Premana (LC)</td></tr><tr role="row" class="even"><td></td><td><b style="color:black;" title="Sabato">26/07</b></td><td><abbr title="NAZ.LE">N</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/CAMPIONATI-ITALIANI-ASSOLUTI-e-MASTER-di-TRAIL-LUNGO/COD13368">CAMPIONATI ITALIANI ASSOLUTI e MASTER di TRAIL LUNGO</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">TRAIL</td><td style="text-align: left;">Valdagno (VI)</td></tr><tr role="row" class="odd"><td><i class="fa fa-circle" style="color:gray;"></i></td><td><b style="color:black;" title="Domenica">27/07</b></td><td><abbr title="BRONZE">B</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/XXVIII^-Corrida-di-San-Lorenzo-Highlander-Run/COD13295">XXVIII^ Corrida di San Lorenzo - Highlander Run</a><br><font style="font-style: italic;">8km U/4km D</font></td><td style="text-align: left;">STRADA</td><td style="text-align: left;">Zogno (BG)</td></tr><tr role="row" class="even"><td></td><td><b style="color:black;" title="Domenica">27/07</b></td><td><abbr title="BRONZE">B</abbr></td><td style="text-align: left;"><a href="https://www.fidal.it/calendario/XXXI^-Giir-di-Mont/COD13443">XXXI^ Giir di Mont</a><br><font style="font-style: italic;"></font></td><td style="text-align: left;">MONTAGNA</td><td style="text-align: left;">Premana (LC)</td></tr>
                                </tbody>
                            </table>
                        </div>    
                        
                        <br><br>
                        <div>
                            <h5>Legenda</h5>
                            <table style="background:transparent;">
                                <tbody><tr>
                                    <td class="legendatd"><i class="fa fa-circle" style="color:green; margin-right:2px;"></i>Ultramaratona/Trail</td>
                                    <td class="legendatd"><i class="fa fa-circle" style="color:green; margin-right:2px;"></i>Montagna</td>
                                    <td class="legendatd"><i class="fa fa-circle" style="color:green; margin-right:2px;"></i>Cross</td>
                                </tr>
                                <tr>
                                    <td class="legendatd"><i class="fa fa-circle" style="color:gray; margin-right:2px;"></i>Marcia su strada</td>
                                    <td class="legendatd"><i class="fa fa-circle" style="color:gray; margin-right:2px;"></i>Ultramaratona</td>
                                    <td class="legendatd"><i class="fa fa-circle" style="color:gray; margin-right:2px;"></i>Strada</td>
                                </tr>
                                <tr>
                                    <td class="legendatd"><i class="fa fa-circle" style="color:red; margin-right:2px;"></i>Outdoor</td>
                                    <td class="legendatd"><i class="fa fa-circle" style="color:blue; margin-right:2px;"></i>Indoor</td>
                                    <td></td>
                                </tr>
                            </tbody></table>
                        </div>
            

        </div>
        <script>

</script>`
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

async function getCalendar(output, res, req, reqUrl) {
  try {
    // const browser = await chromium.launch();
    const browser = await getBrowser();
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

    // output.content = sectionHtml + reset;
                                                                                                                                                                                                                    output.content = sectionHtml;

    await page.close();
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).send('Internal Server Error getcalendar');
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

    //res.send(extractedPropertiesArray);

    // Sorting by category and then by name
    extractedPropertiesArray.sort((a, b) => {
      if (a.category_id !== b.category_id) {
        return a.category_id - b.category_id;
      } else {
        return a.name.localeCompare(b.name);
      }
    });

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
          <div class="athlete ${genderLabel} " onclick="openLink('https://atletica.me/atleta/${obj.id}');">
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
    console.error(error);
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


async function getInfo(output, res) {
  const titles = ['PICCOLA STORIA DI UNA GRANDE SQUADRA', '1953 LA FONDAZIONE E LE ORIGINI', 'I SUCCESSI DEL PRIMO DECENNIO', '1960 L EPOCA DEI TALENTI', 'GLI ANNI 80 e 90 LA SAF AL MASCHILE', 'LA SAF DI OGGI E DI DOMANI'];
  output.content = `
  <div class="contacts section">
            <h1 class="paragraph">
                PICCOLA STORIA DI UNA GRANDE SQUADRA
            </h1>
            <p class="paragraph">1953-2013. Sessant&rsquo;anni di storia sportiva della città di Bolzano passano anche attraverso le
                maglie
                biancorosse della Società Atletica Femminile Bolzano, indossate in questo periodo da oltre 3000 ragazze
                e da circa 1000 ragazzi (questi ultimi a partire dal 1979). Un passato ricco di successi e di ricordi,
                un presente caratterizzato dall&rsquo;entusiasmo ancora vivo di tutti i componenti della famiglia dei
                &ldquo;safini&rdquo;, in previsione di un futuro che ci auguriamo potrà essere altrettanto roseo.

                La storia, si diceva. Una storia che nasce in un&rsquo;Italia ed in una Bolzano decisamente diverse da
                quelle
                che conosciamo oggi, dove lo sport al femminile costituiva l&rsquo;eccezione più che la regola: in
                Provincia
                di Bolzano l&rsquo;unica formazione di atletica leggera femminile era quella dello Sport Club Merano,
                mentre
                in Trentino l&rsquo;ATAF Trento era nata solo l&rsquo;anno prima. La SAF BOLZANO nacque per rispondere
                alla sempre
                più crescente domanda delle ragazze bolzanine di poter praticare l&rsquo;atletica leggera. Fu allora
                che,
                grazie all&rsquo;intraprendenza di alcuni appassionati, venne fondata la Società. Il Dott. Demetrio
                Eller fu
                chiamato a presiederla e il Prof. Franco Criscuolo ne era il Direttore Tecnico, ruolo che tuttora
                ricopre. È lui, a tutti gli effetti, il principale artefice di 60 anni di ininterrotta attività
                agonistica, la vera anima di questa squadra, il collante tra tutti i protagonisti e le protagoniste
                della nostra avventura in biancorosso.</p>
            <div class="skewX">
                <button onclick="getSection(1)" class="fa-text btn-app-sect1">
                    1953
                </button>
                <button onclick="getSection(2)" class="fa-text btn-app-sect2">
                    1960
                </button>
                <button onclick="getSection(3)" class="fa-text btn-app-sect3">
                    1980
                </button>
                <button onclick="getSection(4)" class="fa-text btn-app-sect4">
                    2000
                </button>
            </div>
            <div id="section1">
                <h2 class="paragraph">1953 LA FONDAZIONE E LE ORIGINI</h2>
                <p class="paragraph">
                    La SAF BOLZANO nasce ufficialmente il 12 febbraio 1953. Per reclutare le atlete la SAF organizza, il
                    10 maggio di quell’anno, una riunione di atletica leggera al campo Druso, dove tutte le ragazze
                    bolzanine sono invitate a partecipare. Alla manifestazione, seguita da un folto pubblico di
                    appassionati, si presenta, come riportano i giornali dell’epoca, "un numeroso lotto di giovani
                    atlete". La settimana successiva, il 17 maggio, la SAF BOLZANO organizza e prende parte alla sua
                    prima manifestazione ufficiale: i Campionati regionali di Società 1953. Tra le atlete in campo vi
                    sono già i nomi di quelle che, negli anni immediatamente successivi, diventeranno le prime grandi
                    protagoniste della nostra storia: Carla Venturato e Anita Baldo, che nel 1955 sarà la prima "safina"
                    a vestire la maglia azzurra della Nazionale. I successi sono subito molti, tra cui spiccano i
                    quattro titoli regionali assoluti conquistati a Trento il 20 settembre 1953 da Anita Baldo nei 200 e
                    800 metri, Liliana Pace negli 80 metri e Carla Venturato nel salto in alto.

                    Già nel 1954 arriva il primo alloro a livello nazionale: il merito è della giovane Brigitte Pupp che
                    a Bergamo vince il titolo italiano di Seconda Serie nel lancio del giavellotto. La SAF, come del
                    resto tutto il movimento dell’atletica femminile, cresce in fretta. Ed è questa una crescita sia
                    quantitativa sia qualitativa. Le tesserate aumentano costantemente di numero, passando dalle 37 del
                    1953 alle oltre 120 del 1962.
                </p>
                <h2 class="paragraph">I SUCCESSI DEL PRIMO DECENNIO</h2>
                <p class="paragraph">
                    La seconda metà degli anni cinquanta riserva alla SAF grossissime soddisfazioni sia a livello
                    regionale sia in campo nazionale.

                    Nel 1957 Anita Baldo migliora per due volte il primato italiano dei 400 metri portandolo a 59"7,
                    prima donna italiana a scendere sotto il muro del minuto su questa distanza. La stessa Baldo,
                    insieme a Maria Gabriella Venturato e Franca De Paoli, centra anche il record italiano della
                    staffetta 3x800.

                    L’anno successivo tocca ad Edvige Boscaro realizzare il record italiano juniores sui 100 metri col
                    tempo di 12"7, prestazione che le vale anche la maglia azzurra assoluta. Il 1958 è anche l’anno
                    della consacrazione di Franca De Paoli: convocata in Nazionale, il 6 luglio a Pisa eguaglia il
                    record italiano degli 800 metri che apparteneva alla sua eterna rivale, la napoletana Gilda
                    Jannaccone, col tempo di 2’15"4. La settimana successiva, a Bolzano, frantuma con le compagne
                    Venturato e Buffa il record italiano della staffetta 3x800, stabilito dalla SAF un anno prima,
                    portandolo a 7’21"5, con un miglioramento di 7" netti. Questi risultati le valgono l’inserimento nel
                    gruppo dei Probabili Olimpici di Roma 1960; la mancata convocazione rimane forse il suo più grande
                    rammarico.

                </p>
            </div>
            <div id="section2">
                <h2 class="paragraph">1960 L'EPOCA DEI TALENTI</h2>
                <p class="paragraph">
                    L’attività della SAF non si ferma: le atlete cambiano, i risultati restano. Dopo i grandi successi
                    dei primi 10 anni, la nostra Società continua a mantenersi ad altissimi livelli nel panorama
                    nazionale. Il gruppo delle junior Campionesse d’Italia mantiene le aspettative anche nella categoria
                    assoluta. I nomi di spicco, che fanno la storia della SAF BOLZANO nella seconda metà degli anni ’60,
                    sono tanti. Nel 1966 Maria Grazia Bertoldo centra quel titolo italiano di corsa campestre che aveva
                    sfiorato nel ’64 e nel ’65. Seconda, in quella gara, Clara Pellegrinelli. Entrambe le atlete, ancora
                    juniores, conquistarono con i loro successi la maglia azzurra di categoria in due occasioni,
                    raggiungendo Marilena Paraventi, ostacolista già in Nazionale giovanile nel 1965. Maria Grazia, in
                    luglio, si laurea campionessa italiana juniores sugli 800 metri, mentre "solo" seconda è Clara sui
                    400. La Pellegrinelli corona l’inseguimento al titolo l’anno successivo, laureandosi finalmente
                    Campionessa italiana juniores sul giro di pista ad Ancona. Ancora, assieme a Luigina Tononi,
                    riconquista per la SAF il titolo italiano di Società di corsa campestre. Naturalmente, moltissimi
                    nomi nuovi. Tra il 1965 e il 1966, in mezzo ad altre 180 nuove tesserate, due atlete entrano a far
                    parte della famiglia delle "safine": Gloria Giappi e Silvana Zangirolami. In pochi mesi di attività
                    le due giovanissime raggiungono importanti traguardi: ancora una volta la SAF BOLZANO porta le sue
                    atlete in Nazionale juniores. Per la Zangirolami è l’inizio di una carriera costellata di grandi
                    successi.

                    Zangirolami, Giappi, Pellegrinelli e Bertoldo conquistano titoli, battono record, vestono la maglia
                    azzurra a più riprese.
                </p>
            </div>
            <div id="section3">
                <h2 class="paragraph">GLI ANNI 80' e 90' LA SAF AL MASCHILE</h2>
                <p class="paragraph">
                    Nel 1979, dopo oltre un quarto di secolo di vita e circa 2000 atlete tesserate, la SAF vive una
                    svolta storica, aprendo una sezione maschile. Il contesto sociale alle soglie degli anni ‘80 è ben
                    diverso rispetto a quello del 1953. Si pensi solo che all’epoca della fondazione della SAF i
                    calendari dell’atletica maschile e femminile prevedevano una rigida separazione degli appuntamenti
                    agonistici e risultava praticamente impossibile gestire comunemente atlete ed atleti.

                    La storia dell’atletica maschile targata SAF, pur non raggiungendo gli sfavillanti traguardi delle
                    colleghe atlete, può considerarsi comunque ricca di soddisfazioni, almeno a livello giovanile. Il
                    vivaio cresce di anno in anno: dai 22 tesserati del primo anno, si passa ad oltre 100 ragazzi nel
                    1984, per raggiungere l’apice nel 1989 quando gli atleti maschi tesserati sono 132. Serbatoio
                    principale di reclutamento sono le scuole medie "Ugo Foscolo", presso le quali il Direttore Tecnico
                    Franco Criscuolo è docente di educazione fisica. Silvano Librera, nel 1981, è il primo atleta
                    maschio a vincere un titolo regionale nel lancio del peso, ripetendosi nei due anni successivi
                    assieme ai compagni di squadra Vanni Casarotto nella marcia e Luca Vasarin nel salto in alto.

                    Non solo quantità, però. Nel giro di pochi anni la SAF riesce a costruire una squadra competitiva
                    che ben figura a livello giovanile, e nella seconda metà degli anni ‘80 la SAF targata uomini
                    raggiunge i più grandi successi. L’anno 1989 risulta poi straordinario. La squadra allievi, composta
                    principalmente dai ragazzi nati nel 1972, domina in campo regionale e raggiunge prestigiosi
                    traguardi anche a livello nazionale. Il bilancio parla di quattordici titoli regionali individuali,
                    la settima posizione nella finale A1 del Campionato italiano a squadre, il terzo posto ai Campionati
                    italiani di staffette della 4x400, che stabilisce anche il nuovo record regionale, il titolo
                    italiano di prove multiple individuale ed a squadre.

                    Trascinati da Paolo Valt (Campione italiano di Octathlon individuale ed a squadre, argento ai
                    Campionati italiani di lancio del giavellotto, bronzo nella 4x400), si mettono in evidenza Christian
                    Pedratscher (record regionale nei 400 metri, bronzo nella 4x400, Campione italiano di Octathlon a
                    squadre), Cristian Riccardi (componente sia della 4x400, sia della squadra di prove multiple),
                    Leonardo Colletti (asta e prove multiple), Alessio Fuganti (mezzofondista e componente della 4x400),
                    i lanciatori Peter Marinello e Mirco Flaim, Sergio Gobbo ed Alberto D’Avino nella marcia.

                    Paolo Valt, passato poi al G.S. Carabinieri Bologna sarà l’unico atleta maschio cresciuto nella SAF
                    a vestire la maglia azzurra della Nazionale ed a vincere il titolo di Campione italiano assoluto nel
                    lancio del giavellotto nel 2002.
                </p>
            </div>
            <div id="section4">
                <h2 class="paragraph">LA SAF DI OGGI E DI DOMANI</h2>
                <p class="paragraph">
                    Una nuova svolta a livello dirigenziale avviene nel 1999. Il Presidente, l’Ing. Lorenzo Püchler,
                    lascia la carica. Gli subentra Anna Lorenzini Paoli, che si insedia a capo di un Consiglio Direttivo
                    completamente rinnovato.

                    Come sempre è Franco Criscuolo a garantire la continuità nel ruolo di Direttore Tecnico. Accanto a
                    lui, quelli che erano i suoi atleti si dedicano ora alla cura delle giovani leve: Alessio Fuganti,
                    Stefano Sartori, Mirco Flaim e Luca Vasarin, assieme a Lia Püchler ritornata alla SAF dopo 10 anni,
                    coadiuvano il Prof. Criscuolo nella gestione tecnica. Con loro anche alcuni degli atleti dell’ultimo
                    decennio, Marco ed Emanuele Grimaldo, garantiscono al settore tecnico un nuovo slancio verso il
                    futuro. Segretaria rimane, come da moltissimi anni, Michela De Pillo, e collaborano attivamente
                    all’organizzazione della Società anche Alessandro Romania ed Enzo Zanotelli.

                    Il lavoro è impegnativo e non facile in un contesto in cui il movimento dell’atletica leggera
                    italiana non vive certo un periodo florido. La dirigenza decide di puntare sul settore giovanile per
                    cercare di creare un nuovo gruppo capace di cogliere quelle soddisfazioni che in passato non sono
                    mancate. I risultati, comunque, iniziano ad arrivare. Dal 2001 al 2004 la SAF BOLZANO vince, a
                    livello provinciale, il Gran Prix giovanile, manifestazione che somma i risultati stagionali di
                    tutti gli atleti ed atlete dai 9 ai 15 anni.

                    E i risultati arrivano, e sono straordinari, anche a livello nazionale: il gruppo delle atlete nate
                    negli anni 1991 e 1992 raggiunge nel 2008 il quinto posto ai Campionati Italiani di Società nella
                    categoria allieve e dopo molti anni una nostra atleta, Monica Lazzara, torna a vestire per quattro
                    volte la maglia della Nazionale giovanile, partecipando ai Campionati mondiali juniores nel 2010.

                    Anche il settore maschile è ricco di successi soprattutto grazie a Stefano Valente, capace di
                    riscrivere la storia del mezzofondo della SAF Bolzano migliorando innumerevoli volte i record
                    sociali di 800 e 1500 metri.

                    Non da ultimo, è certamente da considerare un ottimo risultato anche il continuo incremento dei
                    tesserati al settore giovanile: la strada per creare nuovamente un movimento articolato e
                    competitivo è quella giusta.

                    Dal punto di vista societario, infine, nel 2013 Anna Lorenzini Paoli lascia la carica di
                    Presidente,che viene assunta da Alessio Fuganti.
                </p>
            </div>
        </div>
  `;



}

async function getNumberOfAthletes(output, res) {
  try {
    // const websiteUrl = 'https://www.fidal.it/societa/SAF-BOLZANO-1953/BZ018';
    // const browser = await chromium.launch();

    // const page = await browser.newPage();
    // await page.goto(websiteUrl, { waitUntil: 'domcontentloaded' });

    // const numbers = await page.evaluate(() => {
    //   const labels = document.querySelectorAll('.dati-societa label');
    //   const lastThreeLabels = Array.from(labels).slice(-3);
    //   return lastThreeLabels.map(label => label.textContent.trim());
    // });

    // const totalAthletesNumber = numbers[0] ? parseInt(numbers[0].replace(/[^\d]/g, ''), 10) : 0;
    // const maleAthletesNumber = numbers[1] ? parseInt(numbers[1].replace(/[^\d]/g, ''), 10) : 0;
    // const femaleAthletesNumber = numbers[2] ? parseInt(numbers[2].replace(/[^\d]/g, ''), 10) : 0;

    // await browser.close();

    // output.content = `<div>
    //             <div class="n-container beat shadowBack">
    //                 <h3>MASCHI</h3>
    //                 <p>${maleAthletesNumber}</p>
    //             </div>
    //             <div class="n-container beat shadowBack">
    //                 <h3>FEMMINE</h3>
    //                 <p>${femaleAthletesNumber}</p>
    //             </div>
    //             <div class="n-container beat shadowBack">
    //                 <h3>ATLETI</h3>
    //                 <p>${totalAthletesNumber}</p>
    //             </div>
    //         </div>`;
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error getnumberofathletes');
  }
}

router.get('/', async (req, res) => {
  const imageFiles = getImagesFromFolder(path.join(__dirname, '../public/images/gallery'));
  await getHome(output, res);
  res.render('home', { pageTitle: "home", output: output, images: imageFiles });
});

module.exports = router;
