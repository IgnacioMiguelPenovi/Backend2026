const express = require('express');
const router = express.Router();
const ProfesorRepository = require('../../models/ProfesorRepository');
const validarProfesor = require('../../middlewares/validarProfesor');

const profesorRepository = new ProfesorRepository();

router.get('/', (req, res) => {
  res.json(profesorRepository.obtenerTodos());
});

router.get('/:id', (req, res) => {
  const profesor = profesorRepository.obtenerPorId(req.params.id);
  if (!profesor) {
    return res.status(404).json({ error: 'Profesor no encontrado' });
  }
  res.json(profesor);
});

router.post('/', validarProfesor, (req, res) => {
  const nuevoProfesor = profesorRepository.crear(req.body);
  res.status(201).json(nuevoProfesor);
});

router.put('/:id', validarProfesor, (req, res) => {
  const profesorActualizado = profesorRepository.actualizar(req.params.id, req.body);
  if (!profesorActualizado) {
    return res.status(404).json({ error: 'Profesor no encontrado' });
  }
  res.json(profesorActualizado);
});

router.delete('/:id', (req, res) => {
  const eliminado = profesorRepository.eliminar(req.params.id);
  if (!eliminado) {
    return res.status(404).json({ error: 'Profesor no encontrado' });
  }
  res.status(204).send();
});

module.exports = router;
