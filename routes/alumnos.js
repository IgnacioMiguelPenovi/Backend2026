const express = require('express');
const router = express.Router();
const AlumnoRepository = require('../models/AlumnoRepository');
const { obtenerNombresSucursalesActivas } = require('../utils/sucursales');
const {
  registrarActividad,
  obtenerCambios,
  obtenerCamposCreados
} = require('../utils/auditoria');

const alumnoRepository = new AlumnoRepository();
const { requiereRoles, permiteInvitadoORoles } = require('../middlewares/autorizacion');

router.get('/', requiereRoles('empleado', 'administrador', 'gerencia'), async (req, res, next) => {
  try {
    const alumnos = await alumnoRepository.obtenerTodos();
    res.render('alumnos/lista', {
      alumnos,
      puedeEditar: req.session.usuario.rol === 'administrador',
      puedeInscribir: ['empleado', 'administrador'].includes(req.session.usuario.rol)
    });
  } catch (error) {
    next(error);
  }
});

router.get('/nuevo', permiteInvitadoORoles('empleado', 'administrador'), async (req, res, next) => {
  try {
    const sucursales = await obtenerNombresSucursalesActivas();
    res.render('alumnos/formulario', { alumno: null, sucursales });
  } catch (error) {
    next(error);
  }
});

router.post('/', permiteInvitadoORoles('empleado', 'administrador'), async (req, res, next) => {
  try {
    const alumno = await alumnoRepository.crear(req.body);
    await registrarActividad(req, {
      accion: 'ALUMNO_CREADO',
      entidad: 'Usuario',
      entidadId: alumno._id,
      cambios: obtenerCamposCreados(alumno),
      ...(req.session?.usuario ? {} : {
        actorAlternativo: {
          id: alumno._id,
          usuario: alumno.usuario,
          nombre: alumno.nombre,
          rol: alumno.rol
        }
      })
    });
    res.redirect(req.session?.usuario ? '/alumnos' : '/login?registrado=1');
  } catch (error) {
    next(error);
  }
});

router.get('/:id', requiereRoles('empleado', 'administrador', 'gerencia'), async (req, res, next) => {
  try {
    const alumno = await alumnoRepository.obtenerPorId(req.params.id);
    if (!alumno) {
      return res.status(404).render('404');
    }
    res.render('alumnos/detalle', {
      alumno,
      puedeEditar: req.session.usuario.rol === 'administrador',
      mensaje: req.query.mensaje === 'editado'
        ? 'Alumno editado exitosamente.'
        : null
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/editar', requiereRoles('administrador'), async (req, res, next) => {
  try {
    const alumno = await alumnoRepository.obtenerPorId(req.params.id);
    if (!alumno) {
      return res.status(404).render('404');
    }
    const sucursales = await obtenerNombresSucursalesActivas();
    res.render('alumnos/formulario', { alumno, sucursales });
  } catch (error) {
    next(error);
  }
});

router.post('/:id', requiereRoles('administrador'), async (req, res, next) => {
  try {
    const anterior = await alumnoRepository.obtenerPorId(req.params.id);
    if (!anterior) return res.status(404).render('404');

    const alumno = await alumnoRepository.actualizar(req.params.id, req.body);
    if (!alumno) return res.status(404).render('404');

    await registrarActividad(req, {
      accion: 'ALUMNO_ACTUALIZADO',
      entidad: 'Usuario',
      entidadId: alumno._id,
      cambios: obtenerCambios(anterior, alumno)
    });
    res.redirect(`/alumnos/${req.params.id}?mensaje=editado`);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/desactivar', requiereRoles('administrador'), async (req, res, next) => {
  try {
    const anterior = await alumnoRepository.obtenerPorId(req.params.id);
    if (!anterior) return res.status(404).render('404');

    const alumno = await alumnoRepository.cambiarEstado(req.params.id, 'inactivo');
    if (!alumno) return res.status(404).render('404');

    await registrarActividad(req, {
      accion: 'ALUMNO_ESTADO_CAMBIADO',
      entidad: 'Usuario',
      entidadId: alumno._id,
      cambios: obtenerCambios(anterior, alumno)
    });
    res.redirect('/alumnos');
  } catch (error) {
    next(error);
  }
});

router.post('/:id/activar', requiereRoles('administrador'), async (req, res, next) => {
  try {
    const anterior = await alumnoRepository.obtenerPorId(req.params.id);
    if (!anterior) return res.status(404).render('404');

    const alumno = await alumnoRepository.cambiarEstado(req.params.id, 'activo');
    if (!alumno) return res.status(404).render('404');

    await registrarActividad(req, {
      accion: 'ALUMNO_ESTADO_CAMBIADO',
      entidad: 'Usuario',
      entidadId: alumno._id,
      cambios: obtenerCambios(anterior, alumno)
    });
    res.redirect('/alumnos');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
