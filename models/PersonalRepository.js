const mongoose = require('mongoose');
const Usuario = require('./UsuarioModel');

const ROLES_PERSONAL = ['profesor', 'empleado', 'gerencia'];

function normalizarLista(valor) {
  if (Array.isArray(valor)) return valor;
  if (!valor) return [];
  return [valor];
}

function prepararDatos(datos) {
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

  if (rol === 'profesor') {
    persona.sucursal = datos.sucursal;
    persona.dias = normalizarLista(datos.dias);
    persona.horarios = normalizarLista(datos.horarios);
  } else {
    persona.sucursal = undefined;
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

  crear(datos) {
  const usuario = String(datos.usuario || '').trim().toLowerCase();
  const contrasena = String(datos.contrasena || '');

  if (!usuario || !contrasena) {
    throw new Error('El usuario y la contraseña son obligatorios');
  }

  return Usuario.create({
    ...prepararDatos(datos),
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

    persona.set(prepararDatos(datos));
    await persona.save();

    return persona.toObject();
  }

  async cambiarEstado(id, activo) {
    if (!mongoose.isValidObjectId(id)) return false;

    const persona = await Usuario.findOneAndUpdate(
      { _id: id, rol: { $in: ROLES_PERSONAL } },
      { $set: { activo } }
    );

    return persona !== null;
  }
}

module.exports = PersonalRepository;