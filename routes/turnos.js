const express = require('express');
const router = express.Router();
const Turno = require('../models/TurnoModel');
const { SUCURSALES, DIAS, HORARIOS } = require('../config/opciones');

// Middleware para asegurar que el usuario esté logueado
function requiereSesion(req, res, next) {
  if (!req.session || !req.session.usuario) {
    return res.redirect('/login');
  }
  next();
}

// Vista del formulario para añadir un nuevo turno
router.get('/nuevoTurno', requiereSesion, (req, res) => {
  res.render('nuevoTurno', {
    titulo: 'Añadir Turno',
    sucursales: SUCURSALES,
    dias: DIAS,
    horarios: HORARIOS,
    error: null,
    valores: {}
  });
});

// Procesar la creación del turno asociado al usuario logueado
router.post('/nuevoTurno', requiereSesion, async (req, res, next) => {
  try {
    const { sucursal, dia, horario, motivo } = req.body;
    const usuarioId = req.session.usuario.id;

    // Validación de campos obligatorios
    if (!sucursal || !dia || !horario) {
      return res.status(400).render('nuevoTurno', {
        titulo: 'Añadir Turno',
        sucursales: SUCURSALES,
        dias: DIAS,
        horarios: HORARIOS,
        error: 'Debés seleccionar sucursal, día y horario para el turno.',
        valores: req.body
      });
    }

    // Verificar si el usuario ya tiene un turno reservado para ese mismo día y horario
    const turnoExistente = await Turno.findOne({
      usuario: usuarioId,
      dia,
      horario,
      estado: 'confirmado'
    });

    if (turnoExistente) {
      return res.status(400).render('nuevoTurno', {
        titulo: 'Añadir Turno',
        sucursales: SUCURSALES,
        dias: DIAS,
        horarios: HORARIOS,
        error: `Ya tenés un turno reservado el ${dia} a las ${horario} hs en la sucursal ${turnoExistente.sucursal}.`,
        valores: req.body
      });
    }

    // Creación del turno asociado al usuario de la sesión
    await Turno.create({
      usuario: usuarioId,
      sucursal,
      dia,
      horario,
      motivo: motivo ? motivo.trim() : ''
    });

    res.redirect('/index?exito=1');
  } catch (error) {
    next(error);
  }
});

// Listado de los turnos del usuario logueado
router.get('/misTurnos', requiereSesion, async (req, res, next) => {
  try {
    const usuarioId = req.session.usuario.id;
    const turnos = await Turno.find({ usuario: usuarioId }).sort({ creadoEn: -1 }).lean();

    res.render('misTurnos', {
      titulo: 'Mis Turnos',
      turnos
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
