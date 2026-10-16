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

  async cambiarEstado(id, estado) {
    if (!mongoose.isValidObjectId(id)) return false;
    if (typeof estado === 'boolean') estado = estado ? 'activo' : 'inactivo';
    return Usuario.findOneAndUpdate(
      { _id: id, rol: 'alumno' },
      { $set: { estado } },
      { new: true, runValidators: true }
    );
  }
}

module.exports = AlumnoRepository;
