// Centralized error handler — put as the LAST middleware in server.js
function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'A record with that value already exists.' });
  }
  if (err.code && err.code.startsWith('ER_NO_REFERENCED_ROW')) {
    return res.status(400).json({ message: 'Referenced record does not exist.' });
  }

  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong on the server.',
  });
}

module.exports = errorHandler;
