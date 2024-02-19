const express = require('express');
const exphbs = require('express-hbs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.engine('hbs', exphbs.express4({
  partialsDir: path.join(__dirname, 'views', 'partials'), // If you have partials
  layoutsDir: path.join(__dirname, 'views', 'layouts'), // If you have layouts
  defaultLayout: 'main', // Your main layout file
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/public')));
app.use('/public', express.static(path.join(__dirname, 'public')));


//app.use('/public/styles/globals.css', (req, res, next) => {
//  res.type('text/css');
//  next();
//});

//read css and print in inside a js file (how corrupt is this bruh)
//path: ./public/styles/globals.css
const cssContent = fs.readFileSync('./public/styles/globals.css', 'utf-8');
fs.writeFileSync('./public/scripts/css.js', `const globalStyles = ${JSON.stringify(cssContent)};`);
console.log('CSS content has been copied to globalsStyles.js');


app.use('/styles', express.static(path.join(__dirname, 'public', 'styles'), { 'extensions': ['css'] }));

const indexRouter = require('./routes/index');
app.use('/', indexRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
