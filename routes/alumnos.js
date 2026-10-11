const express = require('express');
const router = express.Router();
const AlumnoRepository = require('../models/AlumnoRepository');
const { SUCURSALES, DIAS, HORARIOS } = require('../config/opciones');

const alumnoRepository = new AlumnoRepository();

router.get('/', async (req, res, next) => {
  try {
    const alumnos = await alumnoRepository.obtenerTodos();
    res.render('alumnos/lista', { alumnos });
  } catch (error) {
    next(error);
  }
});

router.get('/nuevo', (req, res) => {
  res.render('alumnos/formulario', {
    alumno: null,
    sucursales: SUCURSALES,
    dias: DIAS,
    horarios: HORARIOS
  });
});

router.post('/', async (req, res, next) => {
  try {
    await alumnoRepository.crear(req.body);
    res.redirect('/alumnos');
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const alumno = await alumnoRepository.obtenerPorId(req.params.id);
    if (!alumno) {
      return res.status(404).render('404');
    }
    res.render('alumnos/detalle', { alumno });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/editar', async (req, res, next) => {
  try {
    const alumno = await alumnoRepository.obtenerPorId(req.params.id);
    if (!alumno) {
      return res.status(404).render('404');
    }
    res.render('alumnos/formulario', {
      alumno,
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
    await alumnoRepository.actualizar(req.params.id, req.body);
    res.redirect(`/alumnos/${req.params.id}`);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/eliminar', async (req, res, next) => {
  try {
    await alumnoRepository.eliminar(req.params.id);
    res.redirect('/alumnos');
  } catch (error) {
    next(error);
  }
});

module.exports = router;