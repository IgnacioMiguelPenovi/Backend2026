const express = require('express');
const router = express.Router();
const SucursalRepository = require('../models/SucursalRepository');
const sucursalRepository = new SucursalRepository(); 

// GET /sucursales - Listado general
router.get('/', async (req, res, next) => {
  try {
    const sucursales = await sucursalRepository.obtenerTodos();
    res.render('sucursales/lista', {
      titulo: 'Listado de Sucursales',
      sucursales
    });
  } catch (error) {
    next(error); 
  }
});

// GET /sucursales/:id - Ver el detalle de una sucursal específica
router.get('/:id', async (req, res, next) => {
  try {
    const sucursal = await sucursalRepository.obtenerPorId(req.params.id);
    if (!sucursal) {
      return res.status(404).render('404');
    }
    res.render('sucursales/detalle', {
      titulo: `Detalle de Sucursal - ${sucursal.nombre}`,
      sucursal: sucursal
    });
  } catch (error) {
    next(error); 
  }
});


// GET /sucursales/nuevo - Formulario de alta (Limpio)
router.get('/nuevo', (req, res) => {
  res.render('sucursales/formulario', {
    titulo: 'Registrar Sucursal',
    sucursal: null,
    esEdicion: false, //  Flag para controlar la vista del formulario
    error: null
  });
});

// POST /sucursales - Guardar sucursal nueva manteniendo los datos si hay error
router.post('/', async (req, res, next) => {
  try {
    await sucursalRepository.crear(req.body);
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
router.get('/:id/editar', async (req, res, next) => {
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
router.post('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    await sucursalRepository.actualizar(id, req.body);
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

module.exports = router;
