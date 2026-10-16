const mongoose = require('mongoose');
const Usuario = require('./UsuarioModel');

class AlumnoRepository {
  obtenerTodos() {
    return Usuario.find({ rol: 'alumno'}).lean();
  }

  obtenerPorId(id) {
    if (!mongoose.isValidObjectId(id)) return null;  
    return Usuario.findOne({ _id: id, rol: 'alumno'}).lean();
  }

  crear(datos) {
    const usuario = String(datos.usuario || '').trim().toLowerCase();
    const contrasena = String(datos.contrasena || '');

    if (!usuario || !contrasena) {
      throw new Error('El usuario y la contraseña son obligatorios');
    }

    return Usuario.create( {
      ...datos,
      usuario,
      contrasena,
      rol: 'alumno'
    });
  }

  async actualizar(id, datos) {
    if (!mongoose.isValidObjectId(id)) return null;
    const alumno = await Usuario.findOne({ _id: id, rol: 'alumno' });
    if (!alumno) return null;
    alumno.set(datos);
    await alumno.save();
    return alumno.toObject();
  }

  async cambiarEstado(id, activo) {
    if (!mongoose.isValidObjectId(id)) return false;
    const resultado = await Usuario.findOneAndUpdate(
      { _id: id, rol: 'alumno' },
      { activo }
    );
    return resultado !== null;
  }
}

module.exports = AlumnoRepository;