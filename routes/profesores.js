const express = require('express');
const router = express.Router();
const ProfesorRepository = require('../models/ProfesorRepository');
const { SUCURSALES, DIAS, HORARIOS } = require('../config/opciones');

const profesorRepository = new ProfesorRepository();

router.get('/', async (req, res, next) => {
  try {
    const profesores = await profesorRepository.obtenerTodos();
    res.render('profesores/lista', { profesores });
  } catch (error) {
    next(error);
  }
});

router.get('/nuevo', (req, res) => {
  res.render('profesores/formulario', {
    profesor: null,
    sucursales: SUCURSALES,
    dias: DIAS,
    horarios: HORARIOS
  });
});

router.post('/', async (req, res, next) => {
  try {
    await profesorRepository.crear(req.body);
    res.redirect('/profesores');
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const profesor = await profesorRepository.obtenerPorId(req.params.id);
    if (!profesor) {
      return res.status(404).render('404');
    }
    res.render('profesores/detalle', { profesor });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/editar', async (req, res, next) => {
  try {
    const profesor = await profesorRepository.obtenerPorId(req.params.id);
    if (!profesor) {
      return res.status(404).render('404');
    }
    res.render('profesores/formulario', {
      profesor,
      sucursales: SUCURSALES,
      dias: DIAS,
      horarios: HORARIOS
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id', async (req, res, next) => {
  try {
    await profesorRepository.actualizar(req.params.id, req.body);
    res.redirect(`/profesores/${req.params.id}`);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/eliminar', async (req, res, next) => {
  try {
    await profesorRepository.eliminar(req.params.id);
    res.redirect('/profesores');
  } catch (error) {
    next(error);
  }
});

module.exports = router;