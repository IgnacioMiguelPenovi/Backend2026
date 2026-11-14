const mongoose = require('mongoose');
const { DIAS, HORARIOS } = require('../config/opciones');

const turnoSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: [true, 'El usuario es obligatorio']
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  sucursal: {
    type: String,
    required: [true, 'La sucursal es obligatoria']
  },
  dia: {
    type: String,
    enum: DIAS,
    required: [true, 'El día es obligatorio']
  },
  fecha: {
    type: Date,
    required: [true, 'La fecha del turno es obligatoria']
  },
  horario: {
    type: String,
    enum: HORARIOS,
    required: [true, 'El horario es obligatorio']
  },
  motivo: {
    type: String,
    trim: true,
    maxlength: [200, 'El motivo no puede superar los 200 caracteres']
  },
  estado: {
    type: String,
    enum: ['confirmado', 'cancelado', 'pendiente'],
    default: 'confirmado'
  },
  creadoEn: {
    type: Date,
    default: Date.now
  },
  metodoPago: {
    type: String,
    enum: ['transferencia', 'mercadopago']
  },
  pagado: {
    type: Boolean,
    default: false
  },
});

module.exports = mongoose.model('Turno', turnoSchema);
