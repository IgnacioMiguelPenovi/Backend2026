const crypto = require('crypto');

const PREFIJO = 'scrypt';
const LONGITUD_CLAVE = 64;

function derivar(contrasena, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(contrasena, salt, LONGITUD_CLAVE, (error, clave) => {
      if (error) return reject(error);
      resolve(clave);
    });
  });
}

// Devuelve "scrypt$<salt hex>$<hash hex>"
async function hashearContrasena(contrasena) {
  const salt = crypto.randomBytes(16);
  const clave = await derivar(contrasena, salt);
  return `${PREFIJO}$${salt.toString('hex')}$${clave.toString('hex')}`;
}

function estaHasheada(almacenada) {
  return typeof almacenada === 'string' && almacenada.startsWith(`${PREFIJO}$`);
}

// Para las contraseñas antiguas que están guardadas planas sin encriptar
async function verificarContrasena(ingresada, almacenada) {
  if (typeof ingresada !== 'string' || typeof almacenada !== 'string') return false;

  if (!estaHasheada(almacenada)) {
    return ingresada === almacenada;
  }

  const [, saltHex, hashHex] = almacenada.split('$');
  if (!saltHex || !hashHex) return false;

  const esperado = Buffer.from(hashHex, 'hex');
  const obtenido = await derivar(ingresada, Buffer.from(saltHex, 'hex'));
  return esperado.length === obtenido.length && crypto.timingSafeEqual(esperado, obtenido);
}

module.exports = { hashearContrasena, verificarContrasena, estaHasheada };
