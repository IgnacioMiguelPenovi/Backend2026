function accesoDenegado(req, res, codigo = 403) {
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(codigo).json({ error: codigo === 401 ? 'Autenticación requerida' : 'No tenés permisos para esta acción' });
  }

  if (codigo === 401) return res.redirect('/login');
  return res.status(codigo).send('No tenés permisos para acceder a esta pantalla.');
}

function requiereSesion(req, res, next) {
  if (!req.session?.usuario) return accesoDenegado(req, res, 401);
  next();
}

function requiereRoles(...roles) {
  return (req, res, next) => {
    if (!req.session?.usuario) return accesoDenegado(req, res, 401);
    if (!roles.includes(req.session.usuario.rol)) return accesoDenegado(req, res);
    next();
  };
}

function permiteInvitadoORoles(...roles) {
  return (req, res, next) => {
    if (!req.session?.usuario) return next();
    if (!roles.includes(req.session.usuario.rol)) return accesoDenegado(req, res);
    next();
  };
}

module.exports = { requiereSesion, requiereRoles, permiteInvitadoORoles, accesoDenegado };
