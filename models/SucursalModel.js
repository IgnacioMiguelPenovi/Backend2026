const mongoose = require('mongoose');

const sucursalSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre de la sucursal es obligatorio'],
    trim: true
  },
  direccion: {
    type: String,
    required: [true, 'La dirección es obligatoria'],
    trim: true
  },
  telefono: {
    type: String,
    required: [true, 'El teléfono es obligatorio'],
    trim: true
  },
  estado: { 
    type: String, 
    default: 'activo', 
    enum: ['activo', 'inactivo'] 
  }
});

// ÚNICA DECLARACIÓN DE ÍNDICE: Aplica la unicidad junto con la regla Case-Insensitive 
sucursalSchema.index({ nombre: 1 }, { 
  unique: true, 
  collation: { locale: 'es', strength: 2 } 
});

module.exports = mongoose.model('Sucursal', sucursalSchema, 'sucursales');
