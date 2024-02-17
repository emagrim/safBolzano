const express = require('express');
const router = express.Router();
const path = require('path');

const paths = ['', 'news', 'iscrizioni', 'atleti', 'staff', 'risultati', 'galleria', 'calendario', 'info'];
const Npaths = paths.length;

const output = {
  css: {
    link: `/public/styles/globals.css`,
    file: `globals.css`,
  },
  nav: `<div id="nav"></div>`,
  foot: `<div id="foot"></div>`,
  std: `<script src="../scripts/std.js"></script><script src="../scripts/css.js"></script><script src="../scripts/introducer.js"></script>`,
  content: ``,
  style: `<script>document.getElementById('globalStyles').textContent = globalStyles;</script>`,
  font: `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">`,
  fontawesome: `<script src="https://kit.fontawesome.com/fb4513912a.js" crossorigin="anonymous"></script>`,
}

router.get('/:page', (req, res) => {
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
        break;
      case "galleria":
        output.content = ``;
        pathToImgDir = imgFolder + `/gallery`;
        break;
      case "calendario":
        output.content = ``;
        pathToImgDir = imgFolder + middlePath + pageName;
        break;
      case "info":
        output.content = ``;
        pathToImgDir = imgFolder + middlePath + pageName;
        break;
      default:
        break;
    }

    imageFiles = getImagesFromFolder(path.join(__dirname, `${pathToImgDir}`));
    res.render(pageName, { pageTitle: pageName, output: output, images: imageFiles });

  } else {
    res.redirect('/');
  }
});

function getImagesFromFolder(folderPath) {
  const fs = require('fs');
  return fs.readdirSync(folderPath).filter(file => {
    return fs.statSync(path.join(folderPath, file)).isFile() && /\.(jpg|jpeg|png|gif)$/i.test(file);
  });
}

router.get('/', (req, res) => {
  const imageFiles = getImagesFromFolder(path.join(__dirname, '../public/images/gallery'));
  res.render('home', { pageTitle: "home", output: output, images: imageFiles });
});

module.exports = router;
