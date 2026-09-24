import rateLimit from 'express-rate-limit';

/**
 * Standard Security Headers
 * Protects against MIME-type sniffing, clickjacking, and legacy browser XSS vulnerabilities.
 */
export function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Powered-By');
  next();
}

/**
 * Recursively sanitizes objects to block NoSQL query injection ($ne, $gt, $where, etc.)
 */
function sanitizeInput(target) {
  if (!target || typeof target !== 'object') return target;

  if (Array.isArray(target)) {
    return target.map(sanitizeInput);
  }

  const clean = {};
  for (const [key, value] of Object.entries(target)) {
    // Strip keys starting with $ or containing . (MongoDB operator injection vectors)
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    clean[key] = sanitizeInput(value);
  }
  return clean;
}

export function noSqlSanitizer(req, res, next) {
  if (req.body) req.body = sanitizeInput(req.body);
  if (req.query) req.query = sanitizeInput(req.query);
  if (req.params) req.params = sanitizeInput(req.params);
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
  message: {
    status: 'error',
    message: 'Request rate limit reached. Please wait a moment and try again.'
  }
});

/**
 * Optional API Key Authenticator
 * If RESQ_API_KEY environment variable is configured, verifies incoming requests.
 */
export function optionalApiKeyGuard(req, res, next) {
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
