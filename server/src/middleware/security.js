import rateLimit from 'express-rate-limit';

/**
 * Standard Security Headers
 * Protects against MIME-type sniffing, clickjacking, legacy browser XSS vulnerabilities,
 * and enforces strict transport security in production.
 */
export function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(self)');

  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  res.removeHeader('X-Powered-By');
  next();
}

/**
 * Recursively sanitizes objects to block NoSQL query injection ($ne, $gt, $where, etc.)
 * and prototype pollution vectors (__proto__, constructor, prototype).
 */
function sanitizeInput(target, depth = 0) {
  if (depth > 10) return target; // prevent stack overflow from deeply nested payloads
  if (!target || typeof target !== 'object') return target;
  if (target instanceof Date || target instanceof RegExp) return target;

  if (Array.isArray(target)) {
    return target.map((item) => sanitizeInput(item, depth + 1));
  }

  const clean = {};
  for (const [key, value] of Object.entries(target)) {
    // Strip keys starting with $ or containing . (MongoDB operator injection vectors)
    // and prototype pollution vectors
    if (
      key.startsWith('$') ||
      key.includes('.') ||
      key === '__proto__' ||
      key === 'constructor' ||
      key === 'prototype'
    ) {
      continue;
    }
    clean[key] = sanitizeInput(value, depth + 1);
  }
  return clean;
}

export function noSqlSanitizer(req, res, next) {
  if (req.body && typeof req.body === 'object') req.body = sanitizeInput(req.body);
  if (req.query && typeof req.query === 'object') req.query = sanitizeInput(req.query);
  next();
}

/**
 * Strict Rate Limiter for Mutation / Registration Endpoints
 * Prevents bots from flooding user registration, emergency contact storage, and donor signups.
 */
export const mutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 20,                  // max 20 mutations per IP per 15 mins
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: {
    status: 'error',
    message: 'Too many submissions from this IP. Please try again after 15 minutes.'
  }
});

/**
 * Read / Discovery Rate Limiter
 * Generous threshold for fast browsing without false-positive 429 lockouts
 */
export const readLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 150,            // max 150 read requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: {
    status: 'error',
    message: 'Request rate limit reached. Please wait a moment and try again.'
  }
});

/**
 * Optional API Key Authenticator
 * If RESQ_API_KEY environment variable is configured, verifies incoming requests.
 * Allows OPTIONS preflight requests and health checks through unhindered.
 */
export function optionalApiKeyGuard(req, res, next) {
  // Always allow CORS preflights and health monitoring probes
  if (
    req.method === 'OPTIONS' ||
    req.path === '/api/health' ||
    req.path === '/health'
  ) {
    return next();
  }

  const configuredKey = process.env.RESQ_API_KEY;
  if (!configuredKey) {
    // No API key requirement set in environment; allow request through
    return next();
  }

  const providedKey = req.headers['x-api-key'] || req.query.apiKey;
  if (providedKey === configuredKey) {
    return next();
  }

  return res.status(401).json({
    status: 'error',
    message: 'Unauthorized: Invalid or missing x-api-key header.'
  });
}

