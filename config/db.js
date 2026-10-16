const mongoose = require('mongoose');

async function conectarDB() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/turnoflex");
    console.log('MongoDB conectado:', mongoose.connection.name);
  } catch (error) {
    console.error('Error al conectar con MongoDB:', error.message);
    process.exit(1);
  }
}

module.exports = conectarDB;