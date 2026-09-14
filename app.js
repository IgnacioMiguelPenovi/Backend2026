const express = require('express');
const path = require('path');
const morgan = require('morgan');
const logger = require('./middlewares/logger');

const indexRouter = require('./routes/index');
const librosRouter = require('./routes/libros');
const librosApiRouter = require('./routes/api/libros');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use(logger);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use('/', indexRouter);
app.use('/libros', librosRouter);
app.use('/api/libros', librosApiRouter);

app.use((req, res) => {
  res.status(404).render('404');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Error interno del servidor');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});
