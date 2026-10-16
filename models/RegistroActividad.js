const mongoose = require('mongoose');

const registroActividadSchema = new mongoose.Schema({
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  actorUsuario: { type: String, required: true },
  actorRol: { type: String, required: true },
  accion: { type: String, required: true },
  entidad: { type: String, required: true },
  entidadId: { type: mongoose.Schema.Types.ObjectId, default: null },
  cambios: { type: mongoose.Schema.Types.Mixed, default: {} },
  fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model(
  'RegistroActividad',
  registroActividadSchema,
  'registroactividades'
);
