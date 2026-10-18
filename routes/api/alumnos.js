const express = require('express');
const router = express.Router();
const AlumnoRepository = require('../../models/AlumnoRepository');
const validarAlumno = require('../../middlewares/validarAlumno');
const { requiereRoles } = require('../../middlewares/autorizacion');

const alumnoRepository = new AlumnoRepository();

router.get('/', requiereRoles('empleado', 'administrador', 'gerencia'), async (req, res, next) => {
  try {
    res.json(await alumnoRepository.obtenerTodos());
  } catch (error) {
    next(error);
  }
});

router.get('/:id', requiereRoles('empleado', 'administrador', 'gerencia'), async (req, res, next) => {
  try {
    const alumno = await alumnoRepository.obtenerPorId(req.params.id);
    if (!alumno) return res.status(404).json({ error: 'Alumno no encontrado' });
    res.json(alumno);
  } catch (error) {
    next(error);
  }
});

router.post('/', requiereRoles('empleado', 'administrador'), validarAlumno, async (req, res, next) => {
  try {
    const nuevoAlumno = await alumnoRepository.crear(req.body);
    res.status(201).json(nuevoAlumno);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', requiereRoles('administrador'), validarAlumno, async (req, res, next) => {
  try {
    const alumnoActualizado = await alumnoRepository.actualizar(req.params.id, req.body);
    if (!alumnoActualizado) return res.status(404).json({ error: 'Alumno no encontrado' });
    res.json(alumnoActualizado);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', requiereRoles('administrador'), async (req, res, next) => {
  try {
    const desactivado = await alumnoRepository.cambiarEstado(req.params.id, false);
    if (!desactivado) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
