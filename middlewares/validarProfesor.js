const { SUCURSALES, DIAS, HORARIOS } = require('../config/opciones');

const LONGITUD_MINIMA = 2;
const LONGITUD_MAXIMA = 50;

function validarProfesor(req, res, next) {
  const { nombre, apellido, sucursal, dias, horarios } = req.body;

  if (!nombre || !apellido || !sucursal || !dias || !horarios) {
    return res.status(400).json({
      error: 'Faltan datos requeridos: nombre, apellido, sucursal, dias y horarios son obligatorios'
    });
  }

  const detalles = [];

  if (typeof nombre !== 'string' || 
    nombre.trim().length < LONGITUD_MINIMA ||
    nombre.trim().length > LONGITUD_MAXIMA
  ) {
    detalles.push(`eL nombre debe tener entre ${LONGITUD_MINIMA} Y ${LONGITUD_MAXIMA} caracteres`);
  }
  if (typeof apellido !== 'string' || 
    apellido.trim().length < LONGITUD_MINIMA ||
    apellido.trim().length > LONGITUD_MAXIMA
  ) {
    detalles.push(`eL apellido debe tener entre ${LONGITUD_MINIMA} y ${LONGITUD_MAXIMA} caracteres`);
  }
  if (!SUCURSALES.includes(sucursal)) {
    detalles.push(`sucursal debe ser una de: ${SUCURSALES.join(', ')}`);
  }

  // Desde un formulario, si se tilda una sola opción llega un string en vez de un array
  const listaDias = Array.isArray(dias) ? dias : [dias];
  const listaHorarios = Array.isArray(horarios) ? horarios : [horarios];

  if (listaDias.length === 0 || !listaDias.every((d) => DIAS.includes(d))) {
    detalles.push(`dias debe contener al menos un día válido: ${DIAS.join(', ')}`);
  }
  if (listaHorarios.length === 0 || !listaHorarios.every((h) => HORARIOS.includes(h))) {
    detalles.push(`horarios debe contener al menos un horario válido: ${HORARIOS.join(', ')}`);
  }

  if (detalles.length > 0) {
    return res.status(400).json({ error: 'Datos inválidos', detalles });
  }

  next();
}

module.exports = validarProfesor;