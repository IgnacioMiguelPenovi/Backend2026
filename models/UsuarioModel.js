const mongoose = require('mongoose');
const { SUCURSALES, DIAS, HORARIOS } = require('../config/opciones');

const ROLES = ['alumno', 'profesor', 'administrador', 'gerencia'];

const esAlumno = function () { return this.rol === 'alumno'; };
const esProfesor = function () { return this.rol === 'profesor'; };
const tieneSucursal = function () { return ['alumno', 'profesor'].includes(this.rol); };

const usuarioSchema = new mongoose.Schema({
    nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true,
    minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
    maxlength: [50, 'El nombre no puede exceder los 50 caracteres']
  },
  apellido: {
    type: String,
    required: [true, 'El apellido es obligatorio'],
    trim: true,
    minlength: [2, 'El apellido debe tener al menos 2 caracteres'],
    maxlength: [50, 'El apellido no puede exceder los 50 caracteres']
  },
  
  rol: { type: String, required: true, enum: ROLES },
  sucursal: { type: String, enum: SUCURSALES, required: tieneSucursal },

  // solo alumnos
  turnoDia: { type: String, enum: DIAS, required: esAlumno },
  turnoHorario: { type: String, enum: HORARIOS, required: esAlumno },

  // solo profesores
  dias: {
    type: [{ type: String, enum: DIAS }],
    validate: {
      validator: function (valor) { return !esProfesor.call(this) || valor.length > 0; },
      message: 'El profesor necesita al menos un día'
    }
  },
  horarios: {
    type: [{ type: String, enum: HORARIOS }],
    validate: {
      validator: function (valor) { return !esProfesor.call(this) || valor.length > 0; },
      message: 'El profesor necesita al menos un horario'
    }
  }
});

module.exports = mongoose.model('Usuario', usuarioSchema);