const { SUCURSALES, DIAS, HORARIOS } = require('../config/opciones');

const LONGITUD_MINIMA = 2;
const LONGITUD_MAXIMA = 50;

function validarAlumno(req, res, next) {
  const { nombre, apellido, sucursal, turnoDia, turnoHorario } = req.body;

  if (!nombre || !apellido || !sucursal || !turnoDia || !turnoHorario) {
    return res.status(400).json({
      error: 'Faltan datos requeridos: nombre, apellido, sucursal, turnoDia y turnoHorario son obligatorios'
    });
  }

  const detalles = [];

  if (typeof nombre !== 'string' ||
    nombre.trim().length < LONGITUD_MINIMA ||
    nombre.trim().length > LONGITUD_MAXIMA
  ) {
    detalles.push(`eL nombre debe contener entre ${LONGITUD_MINIMA} y ${LONGITUD_MAXIMA} caracteres`);
  }
  if (typeof apellido !== 'string' || 
    apellido.trim().length < LONGITUD_MINIMA ||
    apellido.trim().length > LONGITUD_MAXIMA
  ) {
    detalles.push(`El apellido debe contener entre ${LONGITUD_MINIMA} y ${LONGITUD_MAXIMA} caracteres`);
  }
  if (!SUCURSALES.includes(sucursal)) {
    detalles.push(`sucursal debe ser una de: ${SUCURSALES.join(', ')}`);
  }
  if (!DIAS.includes(turnoDia)) {
    detalles.push(`turnoDia debe ser uno de: ${DIAS.join(', ')}`);
  }
  if (!HORARIOS.includes(turnoHorario)) {
    detalles.push(`turnoHorario debe ser uno de: ${HORARIOS.join(', ')}`);
  }

  if (detalles.length > 0) {
    return res.status(400).json({ error: 'Datos inválidos', detalles });
  }

  next();
}

module.exports = validarAlumno;