function validarProfesor(req, res, next) {
  const { nombre, apellido, sucursal, dias, horarios } = req.body;

  if (!nombre || !apellido || !sucursal || !dias || !horarios) {
    return res.status(400).json({
      error: 'Faltan datos requeridos: nombre, apellido, sucursal, dias y horarios son obligatorios'
    });
  }

  next();
}

module.exports = validarProfesor;
