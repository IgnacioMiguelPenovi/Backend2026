const express = require('express');
const router = express.Router();

const MIN_USER = 3;
const MAX_USER = 30;
const MIN_PASS = 6;
const MAX_PASS = 50;

const MAX_INTENTOS = 3;
const TIEMPO_BLOQUEO_MS = 5 * 60 * 1000; // 5 minutos de bloqueo (opcional)

// Expresión regular para verificar al menos un carácter especial
const REGEX_CARACTER_ESPECIAL = /[@$!%*?&#._\-]/;

router.get('/', (req, res) => {
  res.redirect('/alumnos/nuevo');
});

router.post('/', (req, res) => {
  
  res.redirect('/login');
});

module.exports = router;