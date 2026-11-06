const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Turno = require('../models/TurnoModel');
const Usuario = require('../models/UsuarioModel');
const QRCode = require('qrcode');
const { DIAS, HORARIOS } = require('../config/opciones');
const { obtenerNombresSucursalesActivas, validarSucursalActiva } = require('../utils/sucursales');
const { requiereRoles } = require('../middlewares/autorizacion');
const {
  registrarActividad,
  obtenerCambios,
  obtenerCamposCreados
} = require('../utils/auditoria');

const rolesQueAgendan = ['alumno', 'empleado', 'administrador'];
const rolesQueConsultan = ['empleado', 'administrador', 'gerencia'];
const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const metodosPago = ['transferencia', 'mercadopago'];
const precioClase = 8500;
const descuentoTransferencia = 0.10;

function fechaActualTexto() {
  const hoy = new Date();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${hoy.getFullYear()}-${mes}-${dia}`;
}

function obtenerFechaYDia(fechaTexto) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaTexto || '')) return null;
  const fecha = new Date(`${fechaTexto}T00:00:00.000Z`);
  if (Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== fechaTexto) return null;
  const dia = nombresDias[fecha.getUTCDay()];
  if (!DIAS.includes(dia)) return null;
  return { fecha, dia };
}

function esEquipo(rol) {
  return ['empleado', 'administrador'].includes(rol);
}

async function renderFormulario(req, res, opciones = {}) {
  const equipo = esEquipo(req.session.usuario.rol);
  const sucursalesActivas = equipo ? await obtenerNombresSucursalesActivas() : [];
  const sucursalSeleccionada = opciones.valores?.sucursal
    || opciones.turno?.sucursal
    || (req.session.usuario.rol === 'empleado' ? req.session.usuario.sucursal : '')
    || '';
  const sucursales = equipo ? sucursalesActivas : [];
  const alumnos = equipo && sucursales.length
    ? await Usuario.find({
        rol: 'alumno',
        estado: 'activo',
        sucursal: { $in: sucursales }
      }).sort({ apellido: 1, nombre: 1 }).lean()
    : [];
  const usuarioAlumno = equipo
    ? null
    : await Usuario.findOne({ _id: req.session.usuario.id, rol: 'alumno' }).lean();

  res.status(opciones.status || 200).render('turnos/nuevoTurno', {
    titulo: 'Agendar turno',
    horarios: HORARIOS,
    alumnos,
    sucursales,
    sucursalSeleccionada,
    usuarioAlumno,
    equipo,
    turno: opciones.turno || null,
    error: opciones.error || null,
    valores: opciones.valores || {},
    fechaMinima: fechaActualTexto()
  });
}

router.get('/nuevoTurno', requiereRoles(...rolesQueAgendan), async (req, res, next) => {
  try {
    await renderFormulario(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/nuevoTurno', requiereRoles(...rolesQueAgendan), async (req, res, next) => {
  try {
    const equipo = esEquipo(req.session.usuario.rol);
    const sucursalSolicitada = equipo
      ? req.body.sucursal
      : null;
    const alumnoId = equipo ? req.body.alumno : req.session.usuario.id;
    const alumno = mongoose.isValidObjectId(alumnoId)
      ? await Usuario.findOne({
          _id: alumnoId,
          rol: 'alumno',
          estado: 'activo',
          ...(equipo ? { sucursal: sucursalSolicitada } : {})
        })
      : null;

    if (!alumno) {
      return await renderFormulario(req, res, {
        status: 400,
        error: 'Buscá y seleccioná un alumno activo de la sucursal elegida.',
        valores: req.body
      });
    }

    const fechaYDia = obtenerFechaYDia(req.body.fecha);
    const horario = req.body.horario;
    const hoy = fechaActualTexto();

    if (!fechaYDia || req.body.fecha < hoy || !HORARIOS.includes(horario)) {
      return await renderFormulario(req, res, {
        status: 400,
        error: 'Seleccioná una fecha válida (de lunes a sábado) y un horario disponible.',
        valores: req.body
      });
    }

    try {
      if (equipo) await validarSucursalActiva(sucursalSolicitada);
      await validarSucursalActiva(alumno.sucursal);
    } catch (error) {
      return await renderFormulario(req, res, {
        status: 400,
        error: 'El alumno no tiene una sucursal activa asignada. Actualizá su sucursal antes de agendar.',
        valores: req.body
      });
    }

    const turnoExistente = await Turno.findOne({
      usuario: alumno._id,
      fecha: fechaYDia.fecha,
      horario,
      estado: 'confirmado'
    });

    if (turnoExistente) {
      return renderFormulario(req, res, {
        status: 400,
        error: `El alumno ya tiene un turno confirmado el ${req.body.fecha} a las ${horario} hs.`,
        valores: req.body
      });
    }

    req.session.turnoPendiente = {
      alumnoId: String(alumno._id),
      sucursal: equipo ? sucursalSolicitada : alumno.sucursal,
      fecha: req.body.fecha,
      horario,
      motivo: req.body.motivo ? req.body.motivo.trim() : ''
    };

    res.redirect('/pagarTurno');

   /* res.redirect(req.session.usuario.rol === 'administrador' ? '/turnos' : equipo ? '/index?exito=1' : '/misTurnos');*/
  } catch (error) {
    next(error);
  }
});

router.get('/turnos', requiereRoles(...rolesQueConsultan), async (req, res, next) => {
  try {
    const esEmpleado = req.session.usuario.rol === 'empleado';
    const sucursal = req.session.usuario.sucursal;
    if (esEmpleado && !sucursal) {
      return res.status(403).send('El empleado no tiene una sucursal asignada.');
    }

    const filtro = esEmpleado ? { sucursal } : {};
    const turnos = await Turno.find(filtro)
      .populate('usuario', 'nombre apellido usuario sucursal')
      .sort({ fecha: 1, horario: 1 })
      .lean();
    res.render('turnos/lista', {
      titulo: 'Turnos agendados',
      turnos,
      puedeCancelar: req.session.usuario.rol === 'administrador',
      puedeEditar: req.session.usuario.rol === 'administrador',
     /* puedePagar: ['empleado', 'administrador'].includes(req.session.usuario.rol)*/
    });
  } catch (error) {
    next(error);
  }
});

router.get('/turnos/:id/editar', requiereRoles('administrador'), async (req, res, next) => {
  try {
    const turno = await Turno.findById(req.params.id).lean();
    if (!turno) return res.status(404).render('404');
    await renderFormulario(req, res, {
      turno,
      valores: {
        alumno: String(turno.usuario),
        sucursal: turno.sucursal,
        fecha: turno.fecha ? new Date(turno.fecha).toISOString().slice(0, 10) : '',
        horario: turno.horario,
        motivo: turno.motivo || ''
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/turnos/:id/editar', requiereRoles('administrador'), async (req, res, next) => {
  try {
    const turno = await Turno.findById(req.params.id);
    if (!turno) return res.status(404).render('404');

    const alumno = mongoose.isValidObjectId(req.body.alumno)
      ? await Usuario.findOne({
          _id: req.body.alumno,
          rol: 'alumno',
          estado: 'activo',
          sucursal: req.body.sucursal
        })
      : null;
    const fechaYDia = obtenerFechaYDia(req.body.fecha);
    const horario = req.body.horario;
    if (!alumno || !fechaYDia || req.body.fecha < fechaActualTexto() || !HORARIOS.includes(horario)) {
      return renderFormulario(req, res, {
        status: 400,
        turno,
        error: 'Seleccioná un alumno activo, una fecha válida (de lunes a sábado) y un horario disponible.',
        valores: req.body
      });
    }

    try {
      await validarSucursalActiva(alumno.sucursal);
    } catch (error) {
      return renderFormulario(req, res, {
        status: 400,
        turno,
        error: 'El alumno no tiene una sucursal activa asignada.',
        valores: req.body
      });
    }

    const duplicado = await Turno.findOne({
      _id: { $ne: turno._id },
      usuario: alumno._id,
      fecha: fechaYDia.fecha,
      horario,
      estado: 'confirmado'
    });
    if (duplicado) {
      return renderFormulario(req, res, {
        status: 400,
        turno,
        error: 'El alumno ya tiene otro turno confirmado en esa fecha y horario.',
        valores: req.body
      });
    }

    const anterior = turno.toObject();
    turno.set({
      usuario: alumno._id,
      sucursal: req.body.sucursal,
      fecha: fechaYDia.fecha,
      dia: fechaYDia.dia,
      horario,
      motivo: req.body.motivo ? req.body.motivo.trim() : ''
    });
    await turno.save();

    await registrarActividad(req, {
      accion: 'TURNO_ACTUALIZADO',
      entidad: 'Turno',
      entidadId: turno._id,
      cambios: obtenerCambios(anterior, turno.toObject())
    });

    res.redirect('/turnos');
  } catch (error) {
    next(error);
  }
});

router.get('/misTurnos', requiereRoles('alumno'), async (req, res, next) => {
  try {
    const turnos = await Turno.find({ usuario: req.session.usuario.id })
      .sort({ fecha: 1, horario: 1 })
      .lean();
    res.render('turnos/misTurnos', { titulo: 'Mis turnos', turnos });
  } catch (error) {
    next(error);
  }
});

router.post('/turnos/:id/cancelar', requiereRoles('administrador'), async (req, res, next) => {
  try {
    const anterior = await Turno.findById(req.params.id);
    if (!anterior) return res.status(404).render('404');

    const turno = await Turno.findByIdAndUpdate(
      req.params.id,
      { estado: 'cancelado' },
      { new: true, runValidators: true }
    );

    await registrarActividad(req, {
      accion: 'TURNO_CANCELADO',
      entidad: 'Turno',
      entidadId: turno._id,
      cambios: obtenerCambios(anterior.toObject(), turno.toObject())
    });

    res.redirect('/turnos');
  } catch (error) {
    next(error);
  }
});

router.get('/agenda', requiereRoles('profesor', 'administrador', 'gerencia'), async (req, res, next) => {
  try {
    const profesor = await Usuario.findById(req.session.usuario.id).lean();
    if (!profesor) return res.status(404).render('404');

    let fechaTexto = req.query.fecha || fechaActualTexto();
    let fechaYDia = obtenerFechaYDia(fechaTexto);

    if (!fechaYDia && /^\d{4}-\d{2}-\d{2}$/.test(fechaTexto)) {
      const fechaObj = new Date(`${fechaTexto}T00:00:00.000Z`);
      if (!Number.isNaN(fechaObj.getTime())) {
        fechaYDia = {
          fecha: fechaObj,
          dia: nombresDias[fechaObj.getUTCDay()]
        };
      }
    }

    if (!fechaYDia) {
      fechaTexto = fechaActualTexto();
      const fechaObj = new Date(`${fechaTexto}T00:00:00.000Z`);
      fechaYDia = {
        fecha: fechaObj,
        dia: nombresDias[fechaObj.getUTCDay()]
      };
    }

    const trabajaEseDia = profesor.dias && profesor.dias.length ? profesor.dias.includes(fechaYDia.dia) : true;

    const filtro = {
      fecha: fechaYDia.fecha,
      estado: 'confirmado'
    };

    if (profesor.sucursal) {
      filtro.sucursal = profesor.sucursal;
    }

    if (profesor.horarios && profesor.horarios.length > 0) {
      filtro.horario = { $in: profesor.horarios };
    }

    const turnos = await Turno.find(filtro)
      .populate('usuario', 'nombre apellido dni telefono email')
      .sort({ horario: 1 })
      .lean();

    res.render('turnos/agendaProfesor', {
      titulo: 'Agenda de clases',
      profesor,
      turnos,
      fechaTexto,
      diaSemana: fechaYDia.dia,
      trabajaEseDia
    });
  } catch (error) {
    next(error);
  }
});

async function obtenerPendiente(req) {
  const p = req.session.turnoPendiente;
  if (!p || !mongoose.isValidObjectId(p.alumnoId)) return null;

  const alumno = await Usuario.findOne({
    _id: p.alumnoId,
    rol: 'alumno',
    estado: 'activo'
  }).lean();
  const fechaYDia = obtenerFechaYDia(p.fecha);
  if (!alumno || !fechaYDia) return null;

  return { ...p, alumno, dia: fechaYDia.dia };
}

router.get('/pagarTurno', requiereRoles(...rolesQueAgendan), async (req, res, next) => {
  try {
    const pendiente = await obtenerPendiente(req);
    if (!pendiente) return res.redirect('/nuevoTurno');

    res.render('turnos/pago', { 
      titulo: 'Pagar turno', 
      turno: pendiente,
      precio: precioClase,
      precioTransferencia: Math.round(precioClase * (1 - descuentoTransferencia))
    });
  } catch (error) {
    next(error);
  }
});

router.post('/pagarTurno', requiereRoles(...rolesQueAgendan), async (req, res, next) => {
  try {
    const metodo = req.body.metodo;
    if (!metodosPago.includes(metodo)) {
      return res.status(400).send('Método de pago inválido.');
    }

    const pendiente = await obtenerPendiente(req);
    if (!pendiente) return res.redirect('/nuevoTurno');

    const fechaYDia = obtenerFechaYDia(pendiente.fecha);

    const duplicado = await Turno.findOne({
      usuario: pendiente.alumno._id,
      fecha: fechaYDia.fecha,
      horario: pendiente.horario,
      estado: 'confirmado'
    });
    if (duplicado || pendiente.fecha < fechaActualTexto()) {
      delete req.session.turnoPendiente;
      return await renderFormulario(req, res, {
        status: 400,
        error: 'El turno ya no está disponible. Elegí otra fecha u horario.',
        valores: {
          sucursal: pendiente.sucursal,
          alumno: pendiente.alumno,
          fecha: pendiente.fecha,
          horario: pendiente.horario,
          motivo: pendiente.motivo
        }
      });
    }

    const nuevoTurno = await Turno.create({
      usuario: pendiente.alumno._id,
      sucursal: pendiente.sucursal,
      fecha: fechaYDia.fecha,
      dia: fechaYDia.dia,
      horario: pendiente.horario,
      motivo: pendiente.motivo,
      metodoPago: metodo,
      pagado: true
    });

    await registrarActividad(req, {
      accion: 'TURNO_CREADO',
      entidad: 'Turno',
      entidadId: nuevoTurno._id,
      cambios: obtenerCamposCreados(nuevoTurno)
    });

    delete req.session.turnoPendiente;
    res.redirect(`/turnos/${nuevoTurno._id}/comprobante`);
  } catch (error) {
    next(error);
  }
});

router.get('/turnos/:id/comprobante', requiereRoles(...rolesQueAgendan), async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).render('404');

    const rol = req.session.usuario.rol;
    const filtro = { _id: req.params.id, estado: 'confirmado' };
    if (rol === 'alumno') filtro.usuario = req.session.usuario.id;
    if (rol === 'empleado') filtro.sucursal = req.session.usuario.sucursal;

    const turno = await Turno.findOne(filtro)
      .populate('usuario', 'nombre apellido')
      .lean();
    if (!turno) return res.status(404).render('404');

    const fechaTexto = new Date(turno.fecha).toISOString().slice(0, 10);

    const contenido = [
      'TurnoFlex - Comprobante',
      `Turno: ${turno._id}`,
      `Alumno: ${turno.usuario.apellido}, ${turno.usuario.nombre}`,
      `Sucursal: ${turno.sucursal}`,
      `Fecha: ${fechaTexto} (${turno.dia})`,
      `Horario: ${turno.horario} hs`
    ].join('\n');

    const qr = await QRCode.toDataURL(contenido, { margin: 2, width: 280 });

    res.render('turnos/comprobante', {
      titulo: 'Comprobante de turno',
      turno,
      fechaTexto,
      qr,
      urlVolver: rol === 'alumno' ? '/misTurnos' : '/turnos'
    });
  } catch (error) {
    next(error);
  }
});

/*router.get('/turnos/:id/pagar/:metodo', requiereRoles('alumno', 'empleado', 'administrador'), async (req, res, next) => {
  try {
    const { id, metodo } = req.params;
    if (!['transferencia', 'mercadopago'].includes(metodo)) {
      return res.status(404).render('404');
    }
    if (!mongoose.isValidObjectId(id)) return res.status(404).render('404');

    const rol = req.session.usuario.rol;

    const filtro = { _id: id, estado: 'confirmado' };
    if (rol === 'alumno') filtro.usuario = req.session.usuario.id;
    if (rol === 'empleado') filtro.sucursal = req.session.usuario.sucursal;

    const turno = await Turno.findOne(filtro)
      .populate('usuario', 'nombre apellido')
      .lean();
    if (!turno) return res.status(404).render('404');

    const fechaTexto = new Date(turno.fecha).toISOString().slice(0, 10);

    const contenido = [
      'TurnoFlex - Comprobante',
      `Turno: ${turno._id}`,
      `Alumno: ${turno.usuario.apellido}, ${turno.usuario.nombre}`,
      `Sucursal: ${turno.sucursal}`,
      `Fecha: ${fechaTexto} (${turno.dia})`,
      `Horario: ${turno.horario} hs`
    ].join('\n');

    const qr = await QRCode.toDataURL(contenido, { margin: 2, width: 280 });

    res.render('turnos/pago', {
      titulo: 'Comprobante de turno',
      turno,
      fechaTexto,
      metodo,
      qr,
      urlVolver: rol === 'alumno' ? '/misTurnos' : '/turnos'
    });
  } catch (error) {
    next(error);
  }
});*/

module.exports = router;
