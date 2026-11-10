require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('OK, conectado a:', mongoose.connection.name);
    return mongoose.disconnect();
  })
  .catch(err => console.error('Falló:', err.message));