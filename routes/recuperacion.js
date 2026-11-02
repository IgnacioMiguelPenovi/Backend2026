const express = require('express');
const router = express.Router();
const Usuario = require('../models/UsuarioModel'); // Tu modelo de usuarios

// 1. GET: Muestra la pantalla con el formulario (recuperacion.pug)
router.get('/', (req, res) => {
  // views/passwords/recuperacion.pug
  res.render('passwords/recuperacion');
});

// 2. POST: Procesa el cambio de contraseña
router.post('/', async (req, res, next) => {
  const {user, newPassword, repeatPassword} = req.body;

   // 1. Validaciones previas
  if (!user || !newPassword || !repeatPassword) {
    return res.render('passwords/recuperacion', {
      error: 'Todos los campos son obligatorios.'
    });
  }

  //  Verificación de contraseñas iguales
  if (newPassword !== repeatPassword) {
    return res.render('passwords/recuperacion', {
      error: 'Las contraseñas ingresadas no coinciden.'
    });
  }

  // Validación de longitud y carácter especial (igual que en el login)
  const regexEspecial = /[@$!%*?&#._\-]/;
  if (newPassword.length < 6 || !regexEspecial.test(newPassword)) {
    return res.render('passwords/recuperacion', {
      error: 'La contraseña debe tener al menos 6 caracteres e incluir un símbolo especial.'
    });
  }

  try {
     const identificador = user.trim().toLowerCase();
    // 2. Buscamos al usuario en MongoDB por su nombre de usuario o email
    const usuarioDB = await Usuario.findOne({
      $or: [
        { usuario: identificador },
        { email: identificador }
      ]
    });
    if (!usuarioDB || usuarioDB.estado !== 'activo') {
      return res.render('passwords/recuperacion', {
        error: 'No se encontró un usuario activo con esos datos.'
      });
    }
    // 3. ¡AQUÍ SE GUARDA EN MONGO!
    // Actualizamos solo el campo de la contraseña en la base de datos
    await Usuario.updateOne(
      { _id: usuarioDB._id },
      { $set: { contrasena: newPassword } }
    );
    console.log(`Contraseña actualizada en Mongo para el usuario: ${usuarioDB.usuario}`);

    // Redirige al login con mensaje de éxito
    res.redirect('/login?mensaje=Contraseña actualizada con éxito');
  } catch (error) {
    next(error);
  }
});

module.exports = router;