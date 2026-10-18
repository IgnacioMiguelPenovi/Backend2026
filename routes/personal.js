const express = require('express');
const router = express.Router();

const PersonalRepository = require('../models/PersonalRepository');
const Usuario = require('../models/UsuarioModel');
const { DIAS, HORARIOS } = require('../config/opciones');
const { obtenerNombresSucursalesActivas } = require('../utils/sucursales');
const {
  registrarActividad,
  obtenerCambios,
  obtenerCamposCreados
} = require('../utils/auditoria');

const personalRepository = new PersonalRepository();
const { requiereRoles } = require('../middlewares/autorizacion');

router.get('/', requiereRoles('administrador', 'gerencia'), async (req, res, next) => {
  try {
    const personas = await personalRepository.obtenerTodos();
    res.render('personal/lista', {
      personas,
      puedeEditar: req.session.usuario.rol === 'administrador',
      titulo: 'Personal registrado'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/profesores', requiereRoles('empleado', 'administrador', 'gerencia'), async (req, res, next) => {
  try {
    const personas = await Usuario.find({ rol: 'profesor' }).sort({ apellido: 1, nombre: 1 }).lean();
    res.render('personal/lista', {
      personas,
      puedeEditar: req.session.usuario.rol === 'administrador',
      titulo: 'Profesores registrados'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/nuevo', requiereRoles('administrador'), async (req, res, next) => {
  try {
    const sucursales = await obtenerNombresSucursalesActivas();
    res.render('personal/formulario', { persona: null, sucursales, dias: DIAS, horarios: HORARIOS });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', requiereRoles('empleado', 'administrador', 'gerencia'), async (req, res, next) => {
  try {
    const persona = await personalRepository.obtenerPorId(req.params.id);

    if (!persona) {
      return res.status(404).send('Personal no encontrado');
    }

    if (req.session.usuario.rol === 'empleado' && persona.rol !== 'profesor') {
      return res.status(403).send('No tenés permisos para consultar este perfil.');
    }

    res.render('personal/detalle', {
      persona,
      puedeEditar: req.session.usuario.rol === 'administrador'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', requiereRoles('administrador'), async (req, res, next) => {
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

router.get('/:id/editar', requiereRoles('administrador'), async (req, res, next) => {
  try {
    const persona = await personalRepository.obtenerPorId(req.params.id);

    if (!persona) {
      return res.status(404).render('404');
    }

    const sucursales = await obtenerNombresSucursalesActivas();
    res.render('personal/formulario', { persona, sucursales, dias: DIAS, horarios: HORARIOS });
  } catch (error) {
    next(error);
  }
});

router.post('/:id', requiereRoles('administrador'), async (req, res, next) => {
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

router.post('/:id/desactivar', requiereRoles('administrador'), async (req, res, next) => {
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

router.post('/:id/activar', requiereRoles('administrador'), async (req, res, next) => {
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
