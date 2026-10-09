// Error handler 4 parameter (err, req, res, next) sesuai kriteria penilaian UTS
function errorHandler(err, req, res, next) {
  console.error('❌ Server Error:', err.stack || err.message);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Terjadi kesalahan internal pada server';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

// 404 Not Found Handler
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};
