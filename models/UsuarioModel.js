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
  activo: { type: Boolean, default: true },
  sucursal: { type: String, enum: SUCURSALES, required: tieneSucursal },

    // --- NUEVOS CAMPOS GLOBALES ---
    dni: { 
    type: String, 
    required: [true, 'El DNI es obligatorio'],
    match: [/^\d+$/, 'El DNI debe contener solo números'] // Comprueba que sean solo dígitos
  },

  email: { type: String, required: [true, 'El Email es obligatorio'], trim: true },

  telefono: { 
    type: String, 
    required: [true, 'El teléfono es obligatorio'],
    trim: true,
    minlength: [10, 'El teléfono debe tener un mínimo de 10 caracteres'],
    maxlength: [12, 'El teléfono no puede superar los 12 caracteres'],
    match: [/^\d+$/, 'El teléfono debe contener solo números']
  },

  //Fecha de Nacimiento: Mayor de 18 años al día de inscripción
  fechaNacimiento: { 
    type: Date,
    validate: {
      validator: function(valor) {
        // Si no cargan la fecha y no es requerida, pasa la validación
        if (!valor) return true; 
        
        const hoy = new Date();
        const fechaMinima = new Date(hoy.getFullYear() - 18, hoy.getMonth(), hoy.getDate());
        
        // El valor ingresado debe ser anterior o igual a la fecha de hace 18 años
        return valor <= fechaMinima;
      },
      message: 'El alumno debe ser mayor de 18 años para inscribirse.'
    }
  },

  // solo alumnos
  /*turnoDia: { type: String, enum: DIAS, required: esAlumno },
  turnoHorario: { type: String, enum: HORARIOS, required: esAlumno },*/

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