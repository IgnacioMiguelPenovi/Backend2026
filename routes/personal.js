const express = require('express');
const router = express.Router();

const PersonalRepository = require('../models/PersonalRepository');
const { SUCURSALES, DIAS, HORARIOS } = require('../config/opciones');
const {
  registrarActividad,
  obtenerCambios,
  obtenerCamposCreados
} = require('../utils/auditoria');

const personalRepository = new PersonalRepository();

function requiereSesion(req, res, next) {
  if (!req.session?.usuario) return res.redirect('/login');
  next();
}

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

router.get('/:id', async (req, res, next) => {
  try {
    const persona = await personalRepository.obtenerPorId(req.params.id);

    if (!persona) {
      return res.status(404).send('Personal no encontrado');
    }

    res.render('personal/detalle', { persona });
  } catch (error) {
    next(error);
  }
});

router.post('/', requiereSesion, async (req, res, next) => {
  try {
    const persona = await personalRepository.crear(req.body);
    await registrarActividad(req, {
      accion: 'PERSONAL_CREADO',
      entidad: 'Usuario',
      entidadId: persona._id,
      cambios: obtenerCamposCreados(persona)
    });
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

router.post('/:id', requiereSesion, async (req, res, next) => {
  try {
    const anterior = await personalRepository.obtenerPorId(req.params.id);
    if (!anterior) return res.status(404).render('404');

    const persona = await personalRepository.actualizar(
      req.params.id,
      req.body
    );

    if (!persona) {
      return res.status(404).render('404');
    }

    await registrarActividad(req, {
      accion: 'PERSONAL_ACTUALIZADO',
      entidad: 'Usuario',
      entidadId: persona._id,
      cambios: obtenerCambios(anterior, persona)
    });

    res.redirect('/personal');
  } catch (error) {
    next(error);
  }
});

router.post('/:id/desactivar', requiereSesion, async (req, res, next) => {
  try {
    const anterior = await personalRepository.obtenerPorId(req.params.id);
    if (!anterior) return res.status(404).render('404');

    const actualizado = await personalRepository.cambiarEstado(
      req.params.id,
      'inactivo'
    );

    if (!actualizado) {
      return res.status(404).render('404');
    }

    await registrarActividad(req, {
      accion: 'PERSONAL_ESTADO_CAMBIADO',
      entidad: 'Usuario',
      entidadId: actualizado._id,
      cambios: obtenerCambios(anterior, actualizado)
    });

    res.redirect('/personal');
  } catch (error) {
    next(error);
  }
});

router.post('/:id/activar', requiereSesion, async (req, res, next) => {
  try {
    const anterior = await personalRepository.obtenerPorId(req.params.id);
    if (!anterior) return res.status(404).render('404');

    const actualizado = await personalRepository.cambiarEstado(
      req.params.id,
      'activo'
    );

    if (!actualizado) {
      return res.status(404).render('404');
    }

    await registrarActividad(req, {
      accion: 'PERSONAL_ESTADO_CAMBIADO',
      entidad: 'Usuario',
      entidadId: actualizado._id,
      cambios: obtenerCambios(anterior, actualizado)
    });

    res.redirect('/personal');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
