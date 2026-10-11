function errorHandler(err, req, res, next) {
  console.error('[Server Error Handler]', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = (process.env.NODE_ENV === 'production')
    ? 'An unexpected error occurred while processing your request. Please try again.'
    : err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message
  });
}

function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
}

module.exports = {
  errorHandler,
  notFoundHandler
};
