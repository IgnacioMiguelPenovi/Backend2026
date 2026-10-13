const express = require('express');
const router = express.Router();

const MIN_USER = 3;
const MAX_USER = 30;
const MIN_PASS = 6;
const MAX_PASS = 50;

// Expresión regular para verificar al menos un carácter especial
const REGEX_CARACTER_ESPECIAL = /[@$!%*?&#._\-]/;

router.get('/', (req, res) => {
  res.render('login');
});

router.post('/', (req, res) => {
  const { user, password } = req.body;

  // Validación de presencia y tipo
  if (!user || typeof user !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).render('login', { error: 'El usuario y la contraseña son obligatorios' });
  }

  const usuarioLimpio = user.trim();

  // Validación de longitud mínima y máxima para el usuario
  if (usuarioLimpio.length < MIN_USER || usuarioLimpio.length > MAX_USER) {
    return res.status(400).render('login', {
      error: `El usuario debe tener entre ${MIN_USER} y ${MAX_USER} caracteres`
    });
  }

  // Validación de longitud mínima y máxima para la contraseña
  if (password.length < MIN_PASS || password.length > MAX_PASS) {
    return res.status(400).render('login', {
      error: `La contraseña debe tener entre ${MIN_PASS} y ${MAX_PASS} caracteres`
    });
  }

  // 👇 VALIDACIÓN DEL CARÁCTER ESPECIAL 👇
  if (!REGEX_CARACTER_ESPECIAL.test(password)) {
    return res.status(400).render('login', {
      error: 'La contraseña debe incluir al menos un carácter especial (*, !, @, #, $, %, etc.)'
    });
  }

  // Si pasa las validaciones, se inicia la sesión
  req.session.usuario = {
    nombre: usuarioLimpio
  };

  res.redirect('/index');
});

module.exports = router;