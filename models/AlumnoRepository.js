const mongoose = require('mongoose');
const Usuario = require('./UsuarioModel');
const { validarSucursalActiva } = require('../utils/sucursales');
const { hashearContrasena } = require('../utils/contrasenas');

class AlumnoRepository {
  obtenerTodos() {
    return Usuario.find({ rol: 'alumno'}).lean();
  }

  obtenerPorId(id) {
    if (!mongoose.isValidObjectId(id)) return null;  
    return Usuario.findOne({ _id: id, rol: 'alumno'}).lean();
  }

  async crear(datos) {
    const usuario = String(datos.usuario || '').trim().toLowerCase();
    const contrasena = String(datos.contrasena || '');

    if (!usuario || !contrasena) {
      throw new Error('El usuario y la contraseña son obligatorios');
    }

    if (contrasena.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    const sucursal = await validarSucursalActiva(datos.sucursal);

    return Usuario.create({
      nombre: datos.nombre,
      apellido: datos.apellido,
      dni: datos.dni,
      email: datos.email,
      telefono: datos.telefono,
      fechaNacimiento: datos.fechaNacimiento || undefined,
      sucursal,
      usuario,
      contrasena: await hashearContrasena(contrasena),
      rol: 'alumno',
      estado: 'activo'
    });
  }

  async actualizar(id, datos) {
    if (!mongoose.isValidObjectId(id)) return null;
    const alumno = await Usuario.findOne({ _id: id, rol: 'alumno' });
    if (!alumno) return null;
    const sucursal = await validarSucursalActiva(datos.sucursal);
    alumno.set({
      nombre: datos.nombre,
      apellido: datos.apellido,
      dni: datos.dni,
      email: datos.email,
      telefono: datos.telefono,
      fechaNacimiento: datos.fechaNacimiento || undefined,
      sucursal
    });
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
