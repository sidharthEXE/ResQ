/**
 * Centralized error-handling middleware.
 * Express identifies this as an error handler because it has 4 arguments.
 */

// Known error types that map to specific HTTP status codes
const ERROR_STATUS_MAP = {
  ValidationError: 400,
  ZodError: 400,
  SyntaxError: 400,
  CastError: 400,
  NotFoundError: 404,
  RateLimitError: 429
};

export function errorHandler(err, req, res, next) {
  // If response headers have already been transmitted, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  const isDev = process.env.NODE_ENV !== 'production';

  // Determine status code safely
  let status = err.status || err.statusCode || ERROR_STATUS_MAP[err.name] || 500;

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    status = 409;
  }

  // Ensure status is a valid 3-digit HTTP code to prevent Express RangeError
  if (typeof status !== 'number' || status < 100 || status > 599) {
    status = 500;
  }

  // Safe client message
  let message = err.message || 'An unexpected error occurred';
  if (!isDev && status === 500) {
    message = 'An internal server error occurred. Please try again later.';
  }

  // Always log error server-side
  if (isDev) {
    console.error(`[ERROR] ${req.method} ${req.originalUrl}`, {
      status,
      message: err.message,
      stack: err.stack
    });
  } else {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} → ${status}: ${err.message}`);
  }

  // Extract structured validation issues if present
  let errors = undefined;
  if (err.name === 'ZodError' && err.errors) {
    errors = typeof err.flatten === 'function' ? err.flatten().fieldErrors : err.errors;
  }

  res.status(status).json({
    status: 'error',
    message,
    ...(errors && { errors }),
    // Never leak stack traces to clients in production
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

