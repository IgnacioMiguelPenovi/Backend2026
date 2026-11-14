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
const loginRouter = require('./routes/login');
const registerRouter = require('./routes/register');
const UNA_HORA_MS = 60 * 60 * 1000;
const recuperacionRouter = require('./routes/recuperacion');
const { MongoStore } = require('connect-mongo'); // Almacén para guardar las contraseñas
const { registrarActividad } = require('./utils/auditoria');


const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(morgan('dev'));
app.use(logger);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.set('trust proxy', 1);

app.use(session({
  secret: process.env.SESSION_SECRET || 'cambiar-este-secreto',
  resave: false,
  saveUninitialized: false,
  rolling: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    dbName: process.env.DB_NAME || 'turnoflex'
  }),
  cookie: {
    maxAge: UNA_HORA_MS,
    httpOnly: true,
    sameSite: 'lax'
  }
}));

app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  next();
});

let dbPromise;
app.use(async (req, res, next) => {
  try {
    dbPromise = dbPromise || conectarDB();
    await dbPromise;
    next();
  } catch (err) {
    dbPromise = null;
    next(err);
  }
});

app.use('/', indexRouter);
app.use('/alumnos', alumnosRouter);
app.use('/api/alumnos', alumnosApiRouter);
app.use('/api/chat', require('./routes/chatbot'));
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/personal', personalRouter);
app.use('/sucursales', sucursalesRouter);
app.use('/', turnosRouter);
app.use('/recuperacion', recuperacionRouter);


app.post('/logout', async (req, res) => {
  if (req.session?.usuario) {
    try {
      await registrarActividad(req, {
        accion: 'CIERRE_SESION',
        entidad: 'Sesion',
        cambios: { estado: { anterior: 'activa', nuevo: 'cerrada' } }
      });
    } catch (error) {
      console.error('No se pudo registrar el cierre de sesión:', error);
    }
  }

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

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
  });
}

module.exports = app;
