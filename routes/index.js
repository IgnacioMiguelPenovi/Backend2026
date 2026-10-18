const express = require('express');
const router = express.Router();

// Ruta raíz (/) - Se ejecuta al presionar TurnoFlex si no se cambia la URL
router.get('/', (req, res) => {
  // Evaluamos si el usuario tiene una sesión activa en Express-Session
  if (req.session && req.session.usuario) {
    // Si está logueado, lo enviamos directo a la intranet principal
    return res.redirect('/index');
  }
  // Si no está logueado, lo mandamos al formulario de login tradicional
  res.redirect('/login');
});

// Ruta de la pantalla principal (/index)
router.get('/index', (req, res) => {
  // Control preventivo de seguridad: Si intentan forzar la URL /index sin loguearse, los rebota
  if (!req.session || !req.session.usuario) {
    return res.redirect('/login');
  }
  if (!['alumno', 'profesor', 'empleado', 'administrador', 'gerencia'].includes(req.session.usuario.rol)) {
    return res.status(403).send('Tu rol todavía no tiene permisos asignados.');
  }
  res.render('index', { exito: req.query.exito === '1' });
});

module.exports = router;
