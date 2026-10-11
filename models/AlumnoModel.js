const mongoose = require('mongoose');

const alumnoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
  sucursal: { type: String, required: true },
  turnoDia: { type: String, required: true },
  turnoHorario: { type: String, required: true }
});

module.exports = mongoose.model('Alumno', alumnoSchema);