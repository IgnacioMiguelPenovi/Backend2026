const mongoose = require('mongoose');
const Usuario = require('./UsuarioModel');
const { validarSucursalActiva } = require('../utils/sucursales');

const ROLES_PERSONAL = ['profesor', 'empleado', 'administrador', 'gerencia'];

function normalizarLista(valor) {
  if (Array.isArray(valor)) return valor;
  if (!valor) return [];
  return [valor];
}

async function prepararDatos(datos) {
  const rol = String(datos.rol || '').trim();

  if (!ROLES_PERSONAL.includes(rol)) {
    throw new Error('El rol seleccionado no es válido');
  }

  const persona = {
    nombre: datos.nombre,
    apellido: datos.apellido,
    dni: datos.dni,
    email: datos.email,
    telefono: datos.telefono,
    fechaNacimiento: datos.fechaNacimiento || undefined,
    rol
  };

  persona.sucursal = await validarSucursalActiva(datos.sucursal);

  if (rol === 'profesor') {
    persona.dias = normalizarLista(datos.dias);
    persona.horarios = normalizarLista(datos.horarios);
  } else {
    persona.dias = [];
    persona.horarios = [];
  }

  return persona;
}

class PersonalRepository {
  obtenerTodos() {
    return Usuario.find({ rol: { $in: ROLES_PERSONAL } })
      .sort({ apellido: 1, nombre: 1 })
      .lean();
  }

  obtenerPorId(id) {
    if (!mongoose.isValidObjectId(id)) return null;

    return Usuario.findOne({
      _id: id,
      rol: { $in: ROLES_PERSONAL }
    }).lean();
  }

  async crear(datos) {
  const usuario = String(datos.usuario || '').trim().toLowerCase();
  const contrasena = String(datos.contrasena || '');

  if (!usuario || !contrasena) {
    throw new Error('El usuario y la contraseña son obligatorios');
  }

  return Usuario.create({
    ...(await prepararDatos(datos)),
    usuario,
    contrasena
  });
}

  async actualizar(id, datos) {
    if (!mongoose.isValidObjectId(id)) return null;

    const persona = await Usuario.findOne({
      _id: id,
      rol: { $in: ROLES_PERSONAL }
    });

    if (!persona) return null;

    persona.set(await prepararDatos(datos));
    await persona.save();

    return persona.toObject();
  }

  async cambiarEstado(id, estado) {
    if (!mongoose.isValidObjectId(id)) return false;
    if (typeof estado === 'boolean') estado = estado ? 'activo' : 'inactivo';

    return Usuario.findOneAndUpdate(
      { _id: id, rol: { $in: ROLES_PERSONAL } },
      { $set: { estado } },
      { new: true, runValidators: true }
    );
  }
}

module.exports = PersonalRepository;
