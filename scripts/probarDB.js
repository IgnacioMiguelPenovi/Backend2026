require('dotenv').config();
const mongoose = require('mongoose');
const Alumno = require('../models/AlumnoModel');

async function probar() {
  await mongoose.connect(process.env.MONGODB_URI);

  const nuevoAlumno = new Alumno({
    nombre: 'María',
    apellido: 'Fernández',
    sucursal: 'Caballito',
    turnoDia: 'Lunes',
    turnoHorario: '10.00'
  });

  const guardado = await nuevoAlumno.save();
  console.log('Guardado:', guardado);

  await mongoose.disconnect();
}

probar().catch(console.error);