const mongoose = require('mongoose');

const registroActividadSchema = new mongoose.Schema({
  actor: { type: String, required: true },
  accion: { type: String, required: true },
  entidad: { type: String, required: true },
  entidadId: { type: mongoose.Schema.Types.ObjectId, default: null },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('RegistroActividad', registroActividadSchema);