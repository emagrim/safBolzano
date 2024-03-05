const express = require('express');
const router = express.Router();
const path = require('path');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const axios = require('axios');
const sqlite3 = require('sqlite3');
const fs = require('fs');
const cheerio = require('cheerio');
const { IgApiClient } = require('instagram-private-api');
const { workerData, parentPort } = require('worker_threads');


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
  std: `<script src="../scripts/std.js"></script><script src="../scripts/css.js"></script><script src="../scripts/introducer.js"></script><script src="../scripts/url.js"></script><script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>
  `,
  content: ``,
  style: `<link rel="stylesheet" type="text/css" href="/styles/globals.css">`,
  font: `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">`,
  fontawesome: `<script src="https://kit.fontawesome.com/fb4513912a.js" crossorigin="anonymous"></script>`,
}
let homeOne = ``;

router.get('/:page', async (req, res) => {
  const pageName = req.params.page;
  let imageFiles = getImagesFromFolder(path.join(__dirname, '../public/images/gallery'));
  const imgFolder = '../public/images/';
  const middlePath = 'img/';
  let pathToImgDir;

  try {
    if (pageName !== 'home') {

      switch (pageName) {
        case "news":
          await getNews(output, res);
          pathToImgDir = imgFolder + middlePath + pageName;
          break;
        case "iscrizioni":
          output.content = ``;
          pathToImgDir = imgFolder + middlePath + pageName;
          break;
        case "atleti":
          output.content = ``;
          pathToImgDir = imgFolder + middlePath + pageName;

          await getAtleti(output, res);

          break;
        case "staff":
          getStaff();
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
    res.render("Error in handling route.");
  }
  console.log('Content:', output.content);
  res.render(pageName, { pageTitle: pageName, output: output, images: imageFiles });
});

function getImagesFromFolder(folderPath) {
  if (fs.existsSync(folderPath)) {
    const stats = fs.statSync(folderPath);

    if (stats.isDirectory()) {
      return fs.readdirSync(folderPath).filter(file => {
        const filePath = path.join(folderPath, file);
        return (
          fs.statSync(filePath).isFile() &&
          /\.(jpg|jpeg|png|gif)$/i.test(file) &&
          file.toLowerCase() !== 'favicon.ico'
        );
      });
    } else {
      console.log('Error: Path is not a directory -', folderPath);
      return [];
    }
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

async function getAtleti(output, res) {
  try {
    const websiteUrl = 'https://atletica.me/societa/211';
    const browser = await puppeteer.launch();
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

      return {
        profile_image: obj[2],
        id: obj.id,
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

    const categorie = {
      70: "Esordienti maschi",
      71: "Esordienti femmine",
      72: "Ragazzi U14",
      73: "Ragazze U14",
      74: "Cadetti U16",
      75: "Cadette U16",
      76: "Alievi U18",
      77: "Alieve U18",
      78: "Promesse uomoni U23",
      79: "Promesse donne U23",
      80: "Senior uomini",
      81: "Senior donne",
      82: "Master uomini 35",
      83: "Master donne 35",
      84: "Master uomini 40",
      85: "Master donne 40",
      86: "Master uomini 50",
      87: "Master donne 50",
      88: "Master uomini 55",
      89: "Master donne 55",
      90: "Master uomini 60",
      91: "Master donne 60",
      92: "Master uomini 60+",
      93: "Master donne 60+",
      94: "Master uomini 65",
      95: "Master donne 65",
      96: "over 65 uomini",
      97: "over 65 donne",
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
          <div class="athlete ${genderLabel} ">
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
                <div class="athleteField">${obj.punteggio_migliore_anno_attuale}</div>
                <div class="athleteField">${obj.data_nascita}</div>
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

    output.content = `<div class="athletesList"><h1 titleH1>I NOSTRI ATLETI</h2>${concatenatedLines}</div>`;
  } catch (error) {
    console.error(error);
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
    <div class="longSection containsOther">
      <div class="outputMessageForSection"><p class="title">Gare nei prossimi giorni</p><p class="message">${result}</p></div>
      <div class="recordDiSocieta"></div>
    </div>
    `;

    console.log('Content of the result:', result);

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
    <div class="athlete staffSlot fakeGlassGreenBack">
            <div class="part1">  
              <img src="${person.foto}" width="50px" height="50px" class="athleteField profileImg" />
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
  });
}

async function getNews(output, res) {
  const targetUsername = 'saf_bolzano';
  const username = "alex_il_deca";
  const password = "Alex8OttoSonoIo";

  try {
    const ig = new IgApiClient();
    ig.state.generateDevice(username);
    await ig.account.login(username, password);
    console.log(username, password);

    const user = await ig.user.searchExact(targetUsername);
    const userId = user.pk;

    const userFeed = ig.feed.user(userId);

    const posts = await userFeed.items();

    console.log(posts);

    const formattedPosts = posts.map(post => ({
      imageUrl: post.image_versions2.candidates[0].url,
      description: post.caption.text,
    }));

    const htmlOutput = formattedPosts.map(post => {
      const isVideo = post.videoUrl !== undefined;
      const descriptionWithLinks = linkifyMentions(post.description);

      return `
        <div class="ig-post glassedBack">
          ${isVideo ? `<video controls><source src="${post.videoUrl}" type="video/mp4"></video>` : `<img src="${post.imageUrl}" alt="${post.description}">`}
          <div class="description">
            <h3>${descriptionWithLinks.split('\n')[0]}</h3>
            <p>${descriptionWithLinks.substring(descriptionWithLinks.indexOf('\n') + 1).replace(/\n/g, '<br>')}</p>
          </div>
        </div>
      `;
    }).join('');

    function linkifyMentions(description) {
      return description
        .replace(/@(\S+)/g, '<a href="https://instagram.com/$1" target="_blank">@$1</a>')
        .replace(/#(\S+)/g, '<a href="https://www.instagram.com/explore/tags/$1" target="_blank">#$1</a>');
    }


    function isUpperCaseMajority(text) {
      const len = text.length;
      let upperCount = 0;

      for (let i = 0; i < len; i++) {
        if (text[i].toUpperCase() === text[i]) {
          upperCount++;
        }
      }

      return upperCount > len / 2;
    }

    output.content = htmlOutput;
  } catch (error) {
    console.error('Error:', error.message);
    output.content = 'Internal Server Error';
  }
}

async function getHome(output, res) {
  const targetUsername = 'saf_bolzano';
  const username = "";
  const password = "Alex8OttoSonoIo";

  console.log("initializzated getHome function");

  try {
    console.log("inside TRY-CATCH (home)");
    const ig = new IgApiClient();
    ig.state.generateDevice(username);
    await ig.account.login(username, password);
    console.log(username, password);

    const user = await ig.user.searchExact(targetUsername);
    const userId = user.pk;

    const userFeed = ig.feed.user(userId);

    const posts = await userFeed.items();
    const limitedPosts = posts.slice(0, 3);

    console.log(posts);

    const formattedPosts = limitedPosts.map(post => ({
      imageUrl: post.image_versions2.candidates[0].url,
      description: post.caption.text,
    }));

    const htmlOutput = formattedPosts.map(post => {
      const isVideo = post.videoUrl !== undefined;
      const descriptionWithLinks = linkifyMentions(post.description);

      return `
        <div class="ig-post glassedBack">
          <div class="description">
            <h3>${descriptionWithLinks.split('\n')[0]}</h3>
          </div>
          ${isVideo ? `<video style="height: 350px; width: auto;" controls><source src="${post.videoUrl}" type="video/mp4"></video>` : `<img style="height: 300px; width: 300px;" src="${post.imageUrl}" alt="${post.description}">`}
        </div>
      `;
    }).join('');

    function linkifyMentions(description) {
      return description
        .replace(/@(\S+)/g, '<a href="https://instagram.com/$1" target="_blank">@$1</a>')
        .replace(/#(\S+)/g, '<a href="https://www.instagram.com/explore/tags/$1" target="_blank">#$1</a>');
    }

    output.content = htmlOutput;
  } catch (error) {
    console.error('Error:', error.message);
    output.content = 'Internal Server Error';
  }
}


router.get('/', async (req, res) => {
  const imageFiles = getImagesFromFolder(path.join(__dirname, '../public/images/gallery'));
  await getHome(output, res);
  res.render('home', { pageTitle: "home", output: output, images: imageFiles });
});

module.exports = router;
