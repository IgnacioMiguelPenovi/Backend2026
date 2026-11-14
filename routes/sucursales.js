const express = require('express');
const router = express.Router();
const SucursalRepository = require('../models/SucursalRepository');
const sucursalRepository = new SucursalRepository(); 
const { requiereRoles } = require('../middlewares/autorizacion');
const { registrarActividad, obtenerCambios, obtenerCamposCreados } = require('../utils/auditoria');

const rolesLectura = ['empleado', 'administrador', 'gerencia'];

// GET /sucursales - Listado general
router.get('/', requiereRoles(...rolesLectura), async (req, res, next) => {
  try {
    const sucursales = await sucursalRepository.obtenerTodos();
    res.render('sucursales/lista', {
      titulo: 'Listado de Sucursales',
      sucursales,
      puedeEditar: req.session.usuario.rol === 'administrador'
    });
  } catch (error) {
    next(error); 
  }
});

// GET /sucursales/nuevo - Formulario de alta (Limpio)
router.get('/nuevo', requiereRoles('administrador'), (req, res) => {
  res.render('sucursales/formulario', {
    titulo: 'Registrar Sucursal',
    sucursal: null,
    esEdicion: false,
    error: null
  });
});

// GET /sucursales/:id - Ver el detalle de una sucursal específica
router.get('/:id', requiereRoles(...rolesLectura), async (req, res, next) => {
  try {
    const sucursal = await sucursalRepository.obtenerPorId(req.params.id);
    if (!sucursal) {
      return res.status(404).render('404');
    }
    res.render('sucursales/detalle', {
      titulo: `Detalle de Sucursal - ${sucursal.nombre}`,
      sucursal: sucursal,
      puedeEditar: req.session.usuario.rol === 'administrador'
    });
  } catch (error) {
    next(error); 
  }
});


// POST /sucursales - Guardar sucursal nueva manteniendo los datos si hay error
router.post('/', requiereRoles('administrador'), async (req, res, next) => {
  try {
    const sucursal = await sucursalRepository.crear(req.body);
    await registrarActividad(req, {
      accion: 'SUCURSAL_CREADA',
      entidad: 'Sucursal',
      entidadId: sucursal._id,
      cambios: obtenerCamposCreados(sucursal)
    });
    res.redirect('/sucursales');
  } catch (error) {
    if (error.code === 11000) {
      return res.render('sucursales/formulario', {
        titulo: 'Registrar Sucursal',
        sucursal: req.body, // Conserva lo tipeado
        esEdicion: false,   //  Mantiene oculto el desplegable de estado
        error: `La sucursal con el nombre "${req.body.nombre}" ya se encuentra registrada.`
      });
    }
    next(error);
  }
});

// GET /sucursales/:id/editar - Obtener los datos y renderizar en modo edición
router.get('/:id/editar', requiereRoles('administrador'), async (req, res, next) => {
  try {
    const sucursal = await sucursalRepository.obtenerPorId(req.params.id);
    if (!sucursal) {
      return res.status(404).render('404');
    }
    res.render('sucursales/formulario', {
      titulo: 'Editar Sucursal',
      sucursal: sucursal,
      esEdicion: true, //  Habilita la visualización del desplegable de estado
      error: null
    });
  } catch (error) {
    next(error); 
  }
});

// POST /sucursales/:id - Procesar la actualización manteniendo los datos si hay error
router.post('/:id', requiereRoles('administrador'), async (req, res, next) => {
  try {
    const id = req.params.id;
    const anterior = await sucursalRepository.obtenerPorId(id);
    if (!anterior) return res.status(404).render('404');

    const sucursal = await sucursalRepository.actualizar(id, req.body);
    if (!sucursal) return res.status(404).render('404');

    await registrarActividad(req, {
      accion: 'SUCURSAL_ACTUALIZADA',
      entidad: 'Sucursal',
      entidadId: sucursal._id,
      cambios: obtenerCambios(anterior, sucursal)
    });
    res.redirect('/sucursales');
  } catch (error) {
    if (error.code === 11000) {
      const sucursalClon = { _id: req.params.id, ...req.body };
      return res.render('sucursales/formulario', {
        titulo: 'Editar Sucursal',
        sucursal: sucursalClon,
        esEdicion: true, //  Mantiene visible el desplegable al fallar la edición
        error: `No se pueden guardar los cambios. Ya existe otra sucursal llamada "${req.body.nombre}".`
      });
    }
    next(error);
  }
});

router.post('/:id/desactivar', requiereRoles('administrador'), async (req, res, next) => {
  try {
    const anterior = await sucursalRepository.obtenerPorId(req.params.id);
    if (!anterior) return res.status(404).render('404');

    const sucursal = await sucursalRepository.actualizar(req.params.id, { estado: 'inactivo' });
    if (!sucursal) return res.status(404).render('404');
    await registrarActividad(req, {
      accion: 'SUCURSAL_ESTADO_CAMBIADO',
      entidad: 'Sucursal',
      entidadId: sucursal._id,
      cambios: obtenerCambios(anterior, sucursal)
    });
    res.redirect('/sucursales');
  } catch (error) {
    next(error);
  }
});

router.post('/:id/activar', requiereRoles('administrador'), async (req, res, next) => {
  try {
    const anterior = await sucursalRepository.obtenerPorId(req.params.id);
    if (!anterior) return res.status(404).render('404');

    const sucursal = await sucursalRepository.actualizar(req.params.id, { estado: 'activo' });
    if (!sucursal) return res.status(404).render('404');
    await registrarActividad(req, {
      accion: 'SUCURSAL_ESTADO_CAMBIADO',
      entidad: 'Sucursal',
      entidadId: sucursal._id,
      cambios: obtenerCambios(anterior, sucursal)
    });
    res.redirect('/sucursales');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
