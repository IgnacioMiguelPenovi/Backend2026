function validarLibro(req, res, next) {
  const { titulo, autor, categoria, anio } = req.body;

  if (!titulo || !autor || !categoria || !anio) {
    return res.status(400).json({
      error: 'Faltan datos requeridos: titulo, autor, categoria y año son obligatorios'
    });
  }

  next();
}

module.exports = validarLibro;
