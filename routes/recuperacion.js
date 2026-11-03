const express = require('express');
const router = express.Router();
const Usuario = require('../models/UsuarioModel');
const nodemailer = require('nodemailer');

// Configuración del servicio de correo con Gmail
function crearTransportador() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

// 1. GET /recuperacion -> Muestra la pantalla para pedir el email
router.get('/', (req, res) => {
  res.render('passwords/recuperacion');
});

// 2. POST /recuperacion -> Recibe el mail y envía el correo con las instrucciones
router.post('/', async (req, res, next) => {
  const { email } = req.body;
  
  if (!email) {
    return res.render('passwords/recuperacion', {
      error: 'Por favor, ingresá un correo electrónico.'
    });
  }

  try {
    const emailLimpio = email.trim();

    // Verificamos si existe un usuario activo con ese email (sin importar mayúsculas/minúsculas)
    const usuarioDB = await Usuario.findOne({ 
      email: { $regex: new RegExp(`^${emailLimpio}$`, 'i') }, 
      estado: 'activo' 
    });

    if (!usuarioDB) {
      return res.render('passwords/recuperacion', {
        error: 'No se encontró un usuario activo con ese correo electrónico.'
      });
    }

    // Arma la URL hacia cambioPassword (detecta automáticamente localhost o dominio)
    const host = req.get('host');
    const enlaceCambio = `${req.protocol}://${host}/recuperacion/cambio-password`;
    
    // Paso a paso redactado para el correo
    const cuerpoEmail = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h2 style="color: #2c3e50;">Recuperación de contraseña - TurnoFlex</h2>
        <p>Hola <strong>${usuarioDB.nombre}</strong>,</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta asociada a este correo.</p>
        
        <h3 style="color: #2c3e50;">Paso a paso para cambiar tu contraseña:</h3>
        <ol style="line-height: 1.8;">
          <li>Hacé clic en el siguiente enlace para ir al formulario de cambio de clave:
            <br>
            <a href="${enlaceCambio}" style="display:inline-block; margin: 10px 0; padding: 10px 20px; background-color: #2c3e50; color: #fff; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Restablecer mi contraseña
            </a>
          </li>
          <li>Ingresá tu nombre de usuario: <strong>${usuarioDB.usuario}</strong></li>
          <li>Ingresá tu nueva contraseña (mínimo 6 caracteres y al menos un símbolo especial como @, $, !, %, *, #, etc.).</li>
          <li>Volvé a escribir la nueva contraseña para confirmarla.</li>
          <li>Hacé clic en <strong>"Guardar contraseña"</strong>.</li>
        </ol>
        <p>Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br><a href="${enlaceCambio}">${enlaceCambio}</a></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p><small style="color: #777;">Si no solicitaste este cambio, podés ignorar este correo de forma segura.</small></p>
      </div>
    `;

    const transporter = crearTransportador();
    await transporter.sendMail({
      from: `"TurnoFlex" <${process.env.EMAIL_USER}>`,
      to: usuarioDB.email,
      subject: 'Instrucciones para recuperar tu contraseña - TurnoFlex',
      html: cuerpoEmail
    });

    console.log(`✅ Correo enviado con éxito a: ${usuarioDB.email}`);
       
    return res.render('passwords/recuperacion', {
      mensaje: 'Te enviamos un correo con las instrucciones y el enlace para restablecer tu contraseña.'
    });

  } catch (error) {
    console.error('Error al enviar el correo:', error);
    next(error);
  }
});

// 3. GET /recuperacion/cambio-password -> Muestra la pantalla con el formulario
router.get('/cambio-password', (req, res) => {
  res.render('passwords/cambioPassword');
});

// 4. POST /recuperacion/cambio-password -> Procesa el cambio de contraseña
router.post('/cambio-password', async (req, res, next) => {
  const { user, newPassword, repeatPassword } = req.body;

  // 1. Validaciones previas
  if (!user || !newPassword || !repeatPassword) {
    return res.render('passwords/cambioPassword', {
      error: 'Todos los campos son obligatorios.'
    });
  }

  // Verificación de contraseñas iguales
  if (newPassword !== repeatPassword) {
    return res.render('passwords/cambioPassword', {
      error: 'Las contraseñas ingresadas no coinciden.'
    });
  }

  // Validación de longitud y carácter especial
  const regexEspecial = /[@$!%*?&#._\-]/;
  if (newPassword.length < 6 || !regexEspecial.test(newPassword)) {
    return res.render('passwords/cambioPassword', {
      error: 'La contraseña debe tener al menos 6 caracteres e incluir un símbolo especial.'
    });
  }

  try {
    const identificador = user.trim().toLowerCase();

    // 2. Busca al usuario en MongoDB por su nombre de usuario
    const usuarioDB = await Usuario.findOne({
      usuario: identificador,
      estado: 'activo'
    });

    if (!usuarioDB) {
      return res.render('passwords/cambioPassword', {
        error: 'No se encontró un usuario activo con ese nombre de usuario.'
      });
    }
    
    // 3. Actualiza el campo de la contraseña en MongoDB
    await Usuario.updateOne(
      { _id: usuarioDB._id },
      { $set: { contrasena: newPassword } }
    );

    console.log(`✅ Contraseña actualizada exitosamente para el usuario: ${usuarioDB.usuario}`);

    // Redirige al login con mensaje de éxito
    res.redirect('/login?mensaje=Contraseña actualizada con éxito');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
