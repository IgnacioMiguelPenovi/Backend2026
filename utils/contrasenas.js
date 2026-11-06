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

/**
 * Nueva funcion: compara la nueva contraseña contra la contraseña actual y el historial
 * @param {string} nuevaContrasena - La clave tipeada en texto plano
 * @param {string} contrasenaActual - El hash actual del usuario
 * @param {Array} historial - Arreglo de hashes anteriores del usuario
 * @returns {Promise<boolean>} - Devuelve true si la contraseña ya fue usada
 */
async function esContrasenaReutilizada(nuevaContrasena, contrasenaActual, historial = []) {
  // 1.Verificar contra la contraseña actual
  if (contrasenaActual && await verificarContrasena(nuevaContrasena, contrasenaActual)) {
     return true; 
    }
  
  // 2. Verificar contra cada clave registrada en el historial 
  for (const entradaHistorial of historial) { 
    if (entradaHistorial && await verificarContrasena(nuevaContrasena, entradaHistorial)) { 
      return true; 
    } 
  }

  return false; 
}

module.exports = { hashearContrasena, verificarContrasena, estaHasheada, esContrasenaReutilizada };