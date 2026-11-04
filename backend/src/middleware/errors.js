function asyncHandler(handler) {
  return (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
}

function notFound(req, res) {
  res.status(404).json({ error: 'Route not found.' });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ error: 'A record with these unique values already exists.' });
  }
  if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ error: error.message });
  }
  if (error.name === 'SequelizeDatabaseError') {
    console.error(error);
    return res.status(400).json({ error: 'The request could not be processed by the database.' });
  }
  console.error(error);
  res.status(500).json({ error: 'An unexpected server error occurred.' });
}

module.exports = { asyncHandler, notFound, errorHandler };
