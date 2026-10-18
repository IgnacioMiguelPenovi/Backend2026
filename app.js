require('dotenv').config();
const conectarDB = require('./config/db');
const express = require('express');
const session = require('express-session');
const path = require('path');
const morgan = require('morgan');
const logger = require('./middlewares/logger');
const personalRouter = require('./routes/personal');
const sucursalesRouter = require('./routes/sucursales');
const turnosRouter = require('./routes/turnos');
const indexRouter = require('./routes/index');
const alumnosRouter = require('./routes/alumnos');
//const profesoresRouter = require('./routes/profesores');
const alumnosApiRouter = require('./routes/api/alumnos');
//const profesoresApiRouter = require('./routes/api/profesores');
const loginRouter = require('./routes/login')
const sucursalesRouter = require('./routes/sucursales');
const registerRouter = require('./routes/register')
const turnosRouter = require('./routes/turnos');


const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use(logger);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'cambiar-este-secreto',
  resave: false,
  saveUninitialized: false
}));

app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  next();
});

app.use('/', indexRouter);
app.use('/alumnos', alumnosRouter);
//app.use('/profesores', profesoresRouter);
app.use('/api/alumnos', alumnosApiRouter);
//app.use('/api/profesores', profesoresApiRouter);
app.use('/login', loginRouter);
app.use('/sucursales', sucursalesRouter);
app.use('/register', registerRouter);
app.use('/personal', personalRouter);
app.use('/sucursales', sucursalesRouter);
app.use('/', turnosRouter);


app.post('/logout', (req, res) => {
  console.log('Entro a /logout');
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.use((req, res) => {
  res.status(404).render('404');
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Error interno del servidor');
});

const PORT = process.env.PORT || 3000;

conectarDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
  });
});
