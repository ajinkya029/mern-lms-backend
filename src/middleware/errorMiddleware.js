function notFound(req, res, _next) { res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` }); }
function errorHandler(err, _req, res, _next) {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map(e => e.message).join(', '); }
  if (err.name === 'CastError') { status = 400; message = 'Invalid resource ID'; }
  if (err.code === 11000) { status = 409; message = `Duplicate value for ${Object.keys(err.keyValue || {}).join(', ')}`; }
  if (process.env.NODE_ENV !== 'production') console.error(err);
  res.status(status).json({ message, ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}) });
}
module.exports = { notFound, errorHandler };
