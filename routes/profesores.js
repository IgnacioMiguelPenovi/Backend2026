const express = require('express');
const router = express.Router();
const ProfesorRepository = require('../models/ProfesorRepository');
const { SUCURSALES, DIAS, HORARIOS } = require('../config/opciones');

const profesorRepository = new ProfesorRepository();

router.get('/', (req, res) => {
  const profesores = profesorRepository.obtenerTodos();
  res.render('profesores/lista', { profesores });
});

router.get('/nuevo', (req, res) => {
  res.render('profesores/formulario', {
    profesor: null,
    sucursales: SUCURSALES,
    dias: DIAS,
    horarios: HORARIOS
  });
});

router.post('/', (req, res) => {
  profesorRepository.crear(req.body);
  res.redirect('/profesores');
});

router.get('/:id', (req, res) => {
  const profesor = profesorRepository.obtenerPorId(req.params.id);
  if (!profesor) {
    return res.status(404).render('404');
  }
  res.render('profesores/detalle', { profesor });
});

router.get('/:id/editar', (req, res) => {
  const profesor = profesorRepository.obtenerPorId(req.params.id);
  if (!profesor) {
    return res.status(404).render('404');
  }
  res.render('profesores/formulario', {
    profesor,
    sucursales: SUCURSALES,
    dias: DIAS,
    horarios: HORARIOS
  });
});

router.post('/:id', (req, res) => {
  profesorRepository.actualizar(req.params.id, req.body);
  res.redirect(`/profesores/${req.params.id}`);
});

router.post('/:id/eliminar', (req, res) => {
  profesorRepository.eliminar(req.params.id);
  res.redirect('/profesores');
});

module.exports = router;
