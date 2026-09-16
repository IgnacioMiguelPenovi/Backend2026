const express = require('express');
const router = express.Router();
const AlumnoRepository = require('../models/AlumnoRepository');
const { SUCURSALES, DIAS, HORARIOS } = require('../config/opciones');

const alumnoRepository = new AlumnoRepository();

router.get('/', (req, res) => {
  const alumnos = alumnoRepository.obtenerTodos();
  res.render('alumnos/lista', { alumnos });
});

router.get('/nuevo', (req, res) => {
  res.render('alumnos/formulario', {
    alumno: null,
    sucursales: SUCURSALES,
    dias: DIAS,
    horarios: HORARIOS
  });
});

router.post('/', (req, res) => {
  alumnoRepository.crear(req.body);
  res.redirect('/alumnos');
});

router.get('/:id', (req, res) => {
  const alumno = alumnoRepository.obtenerPorId(req.params.id);
  if (!alumno) {
    return res.status(404).render('404');
  }
  res.render('alumnos/detalle', { alumno });
});

router.get('/:id/editar', (req, res) => {
  const alumno = alumnoRepository.obtenerPorId(req.params.id);
  if (!alumno) {
    return res.status(404).render('404');
  }
  res.render('alumnos/formulario', {
    alumno,
    sucursales: SUCURSALES,
    dias: DIAS,
    horarios: HORARIOS
  });
});

router.post('/:id', (req, res) => {
  alumnoRepository.actualizar(req.params.id, req.body);
  res.redirect(`/alumnos/${req.params.id}`);
});

router.post('/:id/eliminar', (req, res) => {
  alumnoRepository.eliminar(req.params.id);
  res.redirect('/alumnos');
});

module.exports = router;
