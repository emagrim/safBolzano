const express = require('express');
const exphbs = require('express-hbs');
const path = require('path');
const fs = require('fs');
const favicon = require('serve-favicon');

const app = express();
const PORT = process.env.PORT || 3000;

app.engine('hbs', exphbs.express4({
  partialsDir: path.join(__dirname, 'views', 'partials'), // If you have partials
  layoutsDir: path.join(__dirname, 'views', 'layouts'), // If you have layouts
  //defaultLayout: 'main', // Your main layout file
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/public')));
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(favicon(path.join(__dirname, 'public', 'images', 'img', 'favicon.ico')));


//app.use('/public/styles/globals.css', (req, res, next) => {
//  res.type('text/css');
//  next();
//});

//read css and print in inside a js file (how corrupt is this bruh)
//path: ./public/styles/globals.css

app.use('/styles', express.static(path.join(__dirname, 'public', 'styles'), { 'extensions': ['css'] }));

const indexRouter = require('./routes/index');
app.use('/', indexRouter);

app.get('/favicon.ico', (req, res) => res.status(204));

app.set('apiKey', process.env.API_KEY);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
