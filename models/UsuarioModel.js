const mongoose = require('mongoose');
const { SUCURSALES, DIAS, HORARIOS } = require('../config/opciones');

const ROLES = ['alumno', 'profesor', 'administrador', 'gerencia'];

const esAlumno = function () { return this.rol === 'alumno'; };
const esProfesor = function () { return this.rol === 'profesor'; };
const tieneSucursal = function () { return ['alumno', 'profesor'].includes(this.rol); };

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
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