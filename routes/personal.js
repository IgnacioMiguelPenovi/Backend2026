const express = require('express');
const router = express.Router();

const PersonalRepository = require('../models/PersonalRepository');
const { SUCURSALES, DIAS, HORARIOS } = require('../config/opciones');

const personalRepository = new PersonalRepository();

router.get('/', async (req, res, next) => {
  try {
    const personas = await personalRepository.obtenerTodos();
    res.render('personal/lista', { personas });
  } catch (error) {
    next(error);
  }
});

router.get('/nuevo', (req, res) => {
  res.render('personal/formulario', {
    persona: null,
    sucursales: SUCURSALES,
    dias: DIAS,
    horarios: HORARIOS
  });
});

router.post('/', async (req, res, next) => {
  try {
    await personalRepository.crear(req.body);
    res.redirect('/personal');
  } catch (error) {
    next(error);
  }
});

router.get('/:id/editar', async (req, res, next) => {
  try {
    const persona = await personalRepository.obtenerPorId(req.params.id);

    if (!persona) {
      return res.status(404).render('404');
    }

    res.render('personal/formulario', {
      persona,
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
    const persona = await personalRepository.actualizar(
      req.params.id,
      req.body
    );

    if (!persona) {
      return res.status(404).render('404');
    }

    res.redirect('/personal');
  } catch (error) {
    next(error);
  }
});

router.post('/:id/desactivar', async (req, res, next) => {
  try {
    const actualizado = await personalRepository.cambiarEstado(
      req.params.id,
      false
    );

    if (!actualizado) {
      return res.status(404).render('404');
    }

    res.redirect('/personal');
  } catch (error) {
    next(error);
  }
});

router.post('/:id/activar', async (req, res, next) => {
  try {
    const actualizado = await personalRepository.cambiarEstado(
      req.params.id,
      true
    );

    if (!actualizado) {
      return res.status(404).render('404');
    }

    res.redirect('/personal');
  } catch (error) {
    next(error);
  }
});

module.exports = router;