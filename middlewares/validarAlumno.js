function validarAlumno(req, res, next) {
  const { nombre, apellido, sucursal, turnoDia, turnoHorario } = req.body;

  if (!nombre || !apellido || !sucursal || !turnoDia || !turnoHorario) {
    return res.status(400).json({
      error: 'Faltan datos requeridos: nombre, apellido, sucursal, turnoDia y turnoHorario son obligatorios'
    });
  }

  next();
}

module.exports = validarAlumno;
