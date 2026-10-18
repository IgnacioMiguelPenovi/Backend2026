const express = require('express');
const router = express.Router();
const Usuario = require('../models/UsuarioModel');

const MIN_USER = 3;
const MAX_USER = 30;
const MIN_PASS = 6;
const MAX_PASS = 50;

const MAX_INTENTOS = 3;
const TIEMPO_BLOQUEO_MS = 5 * 60 * 1000; // 5 minutos de bloqueo (opcional)

// Expresión regular para verificar al menos un carácter especial
const REGEX_CARACTER_ESPECIAL = /[@$!%*?&#._\-]/;

router.get('/', (req, res) => {
  // Verificar si está bloqueado por superar los intentos
  if (req.session.bloqueadoHasta && Date.now() < req.session.bloqueadoHasta) {
    const minutosRestantes = Math.ceil((req.session.bloqueadoHasta - Date.now()) / 60000);
    return res.render('login', {
      error: `Has superado el límite de ${MAX_INTENTOS} intentos. Intentá de nuevo en ${minutosRestantes} minuto(s).`,
      bloqueado: true
    });
  }

  res.render('login', {
    mensaje: req.query.registrado === '1' ? 'Registro completado. Ya podés iniciar sesión.' : null
  });
});

router.post('/',async (req, res, next) => {
  // Inicializar contador si no existe
  req.session.intentos = req.session.intentos || 0;

  // 1. Verificar si la sesión actualmente está bloqueada por tiempo
  if (req.session.bloqueadoHasta) {
    if (Date.now() < req.session.bloqueadoHasta) {
      const minutosRestantes = Math.ceil((req.session.bloqueadoHasta - Date.now()) / 60000);
      return res.status(429).render('login', {
        error: `Acceso temporalmente bloqueado. Intentá en ${minutosRestantes} minuto(s).`,
        bloqueado: true
      });
    } else {
      // Si el tiempo de castigo ya expiró, reseteamos el bloqueo y los intentos
      delete req.session.bloqueadoHasta;
      req.session.intentos = 0;
    }
  }

  // Función auxiliar para registrar intento fallido y responder con error
  const fallarIntento = (mensajeError) => {
    req.session.intentos += 1;
    const intentosRestantes = MAX_INTENTOS - req.session.intentos;

    if (req.session.intentos >= MAX_INTENTOS) {
      req.session.bloqueadoHasta = Date.now() + TIEMPO_BLOQUEO_MS;
      return res.status(429).render('login', {
        error: `Has superado el límite de ${MAX_INTENTOS} intentos. Tu acceso ha sido bloqueado por 5 minutos.`,
        bloqueado: true
      });
    }

    return res.status(400).render('login', {
      error: `${mensajeError} (Te quedan ${intentosRestantes} intento(s))`
    });
  };

  const { user, password } = req.body;

  // Validación de presencia y tipo
  if (!user || typeof user !== 'string' || !password || typeof password !== 'string') {
    return fallarIntento('El usuario y la contraseña son obligatorios');
  }

  const usuarioLimpio = user.trim();

  // Validación de longitud mínima y máxima para el usuario
  if (usuarioLimpio.length < MIN_USER || usuarioLimpio.length > MAX_USER) {
    return fallarIntento(`El usuario debe tener entre ${MIN_USER} y ${MAX_USER} caracteres`);
  }

  // Validación de longitud mínima y máxima para la contraseña
  if (password.length < MIN_PASS || password.length > MAX_PASS) {
    return fallarIntento(`La contraseña debe tener entre ${MIN_PASS} y ${MAX_PASS} caracteres`);
  }

  // Validación de carácter especial
  if (!REGEX_CARACTER_ESPECIAL.test(password)) {
    return fallarIntento('La contraseña debe incluir al menos un carácter especial (*, !, @, #, $, %, etc.)');
  }

  // VERIFICACIÓN CON LA BD DE MONGO
    let usuarioDB;

  try {
    usuarioDB = await Usuario.findOne({
      usuario: usuarioLimpio.toLowerCase()
    }).select('+contrasena');
  } catch (error) {
    return next(error);
  }

  if (
    !usuarioDB ||
    usuarioDB.contrasena !== password ||
    usuarioDB.estado !== 'activo'
  ) {
    return fallarIntento('Usuario o contraseña incorrectos');
  }

  // SI EL INICIO ES EXITOSO:
  // Se resetean los intentos y se crea la sesión
  req.session.intentos = 0;
  delete req.session.bloqueadoHasta;

  req.session.usuario = {
    id: usuarioDB._id,
    nombre: usuarioDB.nombre,
    usuario: usuarioDB.usuario,
    rol: usuarioDB.rol,
    sucursal: usuarioDB.sucursal
  };

  res.redirect('/index');
});

module.exports = router;
