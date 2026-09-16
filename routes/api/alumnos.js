const express = require('express');
const router = express.Router();
const AlumnoRepository = require('../../models/AlumnoRepository');
const validarAlumno = require('../../middlewares/validarAlumno');

const alumnoRepository = new AlumnoRepository();

router.get('/', (req, res) => {
  res.json(alumnoRepository.obtenerTodos());
});

router.get('/:id', (req, res) => {
  const alumno = alumnoRepository.obtenerPorId(req.params.id);
  if (!alumno) {
    return res.status(404).json({ error: 'Alumno no encontrado' });
  }
  res.json(alumno);
});

router.post('/', validarAlumno, (req, res) => {
  const nuevoAlumno = alumnoRepository.crear(req.body);
  res.status(201).json(nuevoAlumno);
});

router.put('/:id', validarAlumno, (req, res) => {
  const alumnoActualizado = alumnoRepository.actualizar(req.params.id, req.body);
  if (!alumnoActualizado) {
    return res.status(404).json({ error: 'Alumno no encontrado' });
  }
  res.json(alumnoActualizado);
});

router.delete('/:id', (req, res) => {
  const eliminado = alumnoRepository.eliminar(req.params.id);
  if (!eliminado) {
    return res.status(404).json({ error: 'Alumno no encontrado' });
  }
  res.status(204).send();
});

module.exports = router;
