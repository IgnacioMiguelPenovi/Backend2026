function logger(req, res, next) {
  const fecha = new Date().toLocaleString();
  console.log(`[${fecha}] ${req.method} ${req.originalUrl}`);
  next();
}

module.exports = logger;
