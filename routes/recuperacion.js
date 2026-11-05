const express = require('express');
const router = express.Router();
const Usuario = require('../models/UsuarioModel');
const { hashearContrasena } = require('../utils/contrasenas');
const nodemailer = require('nodemailer');
const path = require('path');

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
    
    // Plantilla del correo en HTML
    const cuerpoEmail = `
      <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e1e8ed; border-radius: 8px; overflow: hidden;">
        
        <!-- Encabezado con Logo y Nombre al lado -->
        <div style="background-color: #2c3e50; padding: 20px; text-align: center;">
          <img src="cid:logo.png" alt="Logo TurnoFlex" style="height: 48px; width: auto; vertical-align: middle; margin-right: 12px; border-radius: 6px;">
          <span style="color: #ffffff; font-size: 26px; font-weight: bold; vertical-align: middle; letter-spacing: 1px;">TurnoFlex</span>
        </div>

        <!-- Contenido principal -->
        <div style="padding: 30px 25px; color: #333333; line-height: 1.6;">
          <h2 style="color: #2c3e50; margin-top: 0;">Recuperación de contraseña</h2>
          <p>Hola <strong>${usuarioDB.nombre}</strong>,</p>
          <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta de PilatesFlow Studios asociada a este correo.</p>
          
          <div style="background-color: #f8f9fa; border-left: 4px solid #2c3e50; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin: 0; font-weight: bold; color: #2c3e50;">Paso a paso para cambiar tu contraseña:</p>
            <ol style="margin: 10px 0 0 0; padding-left: 20px; line-height: 1.8;">
              <li>Tu nombre de usuario es: <strong>${usuarioDB.usuario}</strong></li>
              <li>Hacé clic en el siguiente botón para ir al formulario de cambio de clave:</li>
            </ol>
            
            <ol start="3" style="margin: 0; padding-left: 20px; line-height: 1.8;">
              <li>Ingresá tu nombre de usuario (<strong>${usuarioDB.usuario}</strong>).</li>
              <li>Ingresá tu nueva contraseña (mínimo 6 caracteres y al menos un símbolo especial como @, $, !, %, *, #, etc.).</li>
              <li>Volvé a escribir la nueva contraseña para confirmarla.</li>
              <li>Hacé clic en <strong>"Guardar contraseña"</strong>.</li>
            </ol>
          </div>

          <div style="text-align: center; margin: 15px 0 10px 0;">
              <a href="${enlaceCambio}" style="background-color: #2c3e50; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 5px; font-weight: bold; display: inline-block;">
                Recuperar mi contraseña
              </a>
            </div>

          <p style="font-size: 13px; color: #666; margin-top: 2rem">
            Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br>
            <a href="${enlaceCambio}" style="color: #3498db; word-break: break-all;">${enlaceCambio}</a>
          </p>
        </div>

        <!-- Pie de página con aviso de mensaje automático -->
        <div style="background-color: #f4f6f7; padding: 15px 20px; text-align: center; font-size: 12px; color: #7f8c8d; border-top: 1px solid #e1e8ed;">
          <p style="margin: 0 0 6px 0; font-weight: bold; color: #c0392b;">
            ⚠️ Este es un correo automático, por favor no respondas a este mensaje.
          </p>
          <p style="margin: 0 0 6px 0;">
            Si no solicitaste este cambio de contraseña contactanos al 11 2345-6789.
          </p>
          <p style="margin: 0; color: #bdc3c7;">
            © 2026 TurnoFlex. Todos los derechos reservados.
          </p>
        </div>

      </div>
    `;

    const transporter = crearTransportador();
    await transporter.sendMail({
      from: `"TurnoFlex" <${process.env.EMAIL_USER}>`,
      to: usuarioDB.email,
      subject: 'Instrucciones para recuperar tu contraseña - TurnoFlex',
      html: cuerpoEmail,
      attachments: [
        {
          filename: 'logo.png',
          path: path.join(__dirname, '../public/img/logo.png'),
          cid: 'logo.png' // Identificador para <img src="cid:logo.png">
        }
      ]
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
      { $set: { contrasena: await hashearContrasena(newPassword) } }
    );

    console.log(`✅ Contraseña actualizada exitosamente para el usuario: ${usuarioDB.usuario}`);

    // Redirige al login con mensaje de éxito
    res.redirect('/login?mensaje=Contraseña actualizada con éxito');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
