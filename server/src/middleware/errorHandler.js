/**
 * Centralized error-handling middleware.
 * Express identifies this as an error handler because it has 4 arguments.
 */

// Known error types that map to specific HTTP status codes
const ERROR_STATUS_MAP = {
  ValidationError: 400,
  SyntaxError: 400,
  NotFoundError: 404,
  RateLimitError: 429
};

export function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV !== 'production';

  // Determine status code
  const status = err.status || ERROR_STATUS_MAP[err.name] || 500;
  const message = err.message || 'An unexpected error occurred';

  // Always log the full error in dev; log just the essentials in prod
  if (isDev) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}`, {
      status,
      message,
      stack: err.stack
    });
  } else {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} → ${status}: ${message}`);
  }

  res.status(status).json({
    status: 'error',
    message,
    // Never leak stack traces or internal details to clients in production
    ...(isDev && { detail: err.stack })
  });
}

/**
 * 404 catch-all for routes that do not exist.
 * Mount this AFTER all real routes.
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
}
