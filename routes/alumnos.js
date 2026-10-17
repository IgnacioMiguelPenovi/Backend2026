const express = require('express');
const router = express.Router();
const AlumnoRepository = require('../models/AlumnoRepository');
const { SUCURSALES } = require('../config/opciones');
const {
  registrarActividad,
  obtenerCambios,
  obtenerCamposCreados
} = require('../utils/auditoria');

const alumnoRepository = new AlumnoRepository();

function requiereSesion(req, res, next) {
  if (!req.session?.usuario) return res.redirect('/login');
  next();
}

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
    sucursales: SUCURSALES
  });
});

router.post('/', async (req, res, next) => {
  try {
    const alumno = await alumnoRepository.crear(req.body);
    await registrarActividad(req, {
      accion: 'ALUMNO_CREADO',
      entidad: 'Usuario',
      entidadId: alumno._id,
      cambios: obtenerCamposCreados(alumno),
      // El alta desde "Registrarse" es pública; en ese caso el actor es la cuenta creada.
      actorAlternativo: {
        id: alumno._id,
        usuario: alumno.usuario,
        nombre: alumno.nombre,
        rol: alumno.rol
      }
    });

    // Si el alta es desde el registro público (sin sesión o rol alumno), va a /login sin iniciar sesión
    if (!req.session?.usuario || req.session.usuario.rol === 'alumno') {
      return res.redirect('/login?registrado=1');
    }

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
    res.render('alumnos/detalle', {
      alumno,
      mensaje: req.query.mensaje === 'editado'
        ? 'Alumno editado exitosamente.'
        : null
    });
  } catch (error) {
    next(error);
  }
});

router.get('/:id/editar', requiereSesion, async (req, res, next) => {
  try {
    const alumno = await alumnoRepository.obtenerPorId(req.params.id);
    if (!alumno) {
      return res.status(404).render('404');
    }
    res.render('alumnos/formulario', {
      alumno,
      sucursales: SUCURSALES
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id', requiereSesion, async (req, res, next) => {
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

router.post('/:id/desactivar', requiereSesion, async (req, res, next) => {
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

router.post('/:id/activar', requiereSesion, async (req, res, next) => {
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
