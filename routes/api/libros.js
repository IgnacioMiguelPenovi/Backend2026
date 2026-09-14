const express = require('express');
const router = express.Router();
const LibroRepository = require('../../models/LibroRepository');
const validarLibro = require('../../middlewares/validarLibro');

const libroRepository = new LibroRepository();

router.get('/', (req, res) => {
  const { categoria } = req.query;
  const libros = categoria
    ? libroRepository.obtenerPorCategoria(categoria)
    : libroRepository.obtenerTodos();

  res.json(libros);
});

router.get('/:id', (req, res) => {
  const libro = libroRepository.obtenerPorId(req.params.id);
  if (!libro) {
    return res.status(404).json({ error: 'Libro no encontrado' });
  }
  res.json(libro);
});

router.post('/', validarLibro, (req, res) => {
  const nuevoLibro = libroRepository.crear(req.body);
  res.status(201).json(nuevoLibro);
});

router.put('/:id', validarLibro, (req, res) => {
  const libroActualizado = libroRepository.actualizar(req.params.id, req.body);
  if (!libroActualizado) {
    return res.status(404).json({ error: 'Libro no encontrado' });
  }
  res.json(libroActualizado);
});

router.delete('/:id', (req, res) => {
  const eliminado = libroRepository.eliminar(req.params.id);
  if (!eliminado) {
    return res.status(404).json({ error: 'Libro no encontrado' });
  }
  res.status(204).send();
});

module.exports = router;
