const express = require('express');
const router = express.Router();
const LibroRepository = require('../models/LibroRepository');

const libroRepository = new LibroRepository();

router.get('/', (req, res) => {
  const { categoria } = req.query;
  const libros = categoria
    ? libroRepository.obtenerPorCategoria(categoria)
    : libroRepository.obtenerTodos();

  res.render('index', { libros, categoria: categoria || '' });
});

router.get('/nuevo', (req, res) => {
  res.render('formulario', { libro: null });
});

router.post('/', (req, res) => {
  libroRepository.crear(req.body);
  res.redirect('/libros');
});

router.get('/:id', (req, res) => {
  const libro = libroRepository.obtenerPorId(req.params.id);
  if (!libro) {
    return res.status(404).render('404');
  }
  res.render('detalle', { libro });
});

router.get('/:id/editar', (req, res) => {
  const libro = libroRepository.obtenerPorId(req.params.id);
  if (!libro) {
    return res.status(404).render('404');
  }
  res.render('formulario', { libro });
});

router.post('/:id', (req, res) => {
  libroRepository.actualizar(req.params.id, req.body);
  res.redirect(`/libros/${req.params.id}`);
});

router.post('/:id/eliminar', (req, res) => {
  libroRepository.eliminar(req.params.id);
  res.redirect('/libros');
});

module.exports = router;
