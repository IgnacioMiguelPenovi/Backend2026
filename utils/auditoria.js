const RegistroActividad = require('../models/RegistroActividad');

const CAMPOS_AUDITABLES = [
  'nombre',
  'apellido',
  'dni',
  'email',
  'telefono',
  'fechaNacimiento',
  'usuario',
  'rol',
  'estado',
  'sucursal',
  'dias',
  'horarios'
];

function valorDe(registro, campo) {
  const valor = registro?.[campo] ?? null;
  return valor instanceof Date ? valor.toISOString() : valor;
}

function obtenerCambios(anterior, actual) {
  const cambios = {};

  for (const campo of CAMPOS_AUDITABLES) {
    const valorAnterior = valorDe(anterior, campo);
    const valorNuevo = valorDe(actual, campo);

    if (JSON.stringify(valorAnterior) !== JSON.stringify(valorNuevo)) {
      cambios[campo] = { anterior: valorAnterior, nuevo: valorNuevo };
    }
  }

  return cambios;
}

function obtenerCamposCreados(registro) {
  const cambios = {};

  for (const campo of CAMPOS_AUDITABLES) {
    const valor = valorDe(registro, campo);
    if (valor !== null) cambios[campo] = { anterior: null, nuevo: valor };
  }

  return cambios;
}

async function registrarActividad(req, { accion, entidad, entidadId, cambios, actorAlternativo }) {
  const actor = req.session?.usuario || actorAlternativo;

  if (!actor?.id) {
    const error = new Error('Debés iniciar sesión para registrar esta actividad');
    error.status = 401;
    throw error;
  }

  if (!Object.keys(cambios).length) return null;

  return RegistroActividad.create({
    actorId: actor.id,
    actorUsuario: actor.usuario || actor.nombre,
    actorRol: actor.rol,
    accion,
    entidad,
    entidadId,
    cambios
  });
}

module.exports = {
  registrarActividad,
  obtenerCambios,
  obtenerCamposCreados
};
