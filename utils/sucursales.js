const Sucursal = require('../models/SucursalModel');

async function obtenerNombresSucursalesActivas() {
  const sucursales = await Sucursal.find({ estado: 'activo' })
    .select('nombre')
    .sort({ nombre: 1 })
    .lean();
  return sucursales.map((sucursal) => sucursal.nombre);
}

async function validarSucursalActiva(nombre) {
  if (!nombre) throw new Error('La sucursal es obligatoria');
  const existe = await Sucursal.exists({ nombre, estado: 'activo' });
  if (!existe) throw new Error('Seleccioná una sucursal activa registrada.');
  return nombre;
}

module.exports = { obtenerNombresSucursalesActivas, validarSucursalActiva };
