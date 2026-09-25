import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import placesRouter from './routes/places.js';
import usersRouter from './routes/users.js';
import contactsRouter from './routes/contacts.js';
import donorsRouter from './routes/donors.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { connectDB } from './config/db.js';
import { 
  securityHeaders, 
  noSqlSanitizer, 
  optionalApiKeyGuard 
} from './middleware/security.js';

// Ensure .env is reliably loaded whether started from workspace root, server dir, or Vercel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config(); // fallback to current working directory

// Initiate MongoDB connection (non-blocking, cached for serverless)
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';

// Trust reverse proxies (Vercel, Nginx, Cloudflare) for accurate client IP rate limiting
app.set('trust proxy', 1);

// Disable Express fingerprint
app.disable('x-powered-by');

// ─── Request logging ──────────────────────────────────────────────────────────
app.use(morgan(isDev ? 'dev' : 'combined'));

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(securityHeaders);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const baseOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'https://resq-services.vercel.app',
  process.env.FRONTEND_URL
];

// Normalize origins by trimming whitespace and trailing slashes
const allowedOrigins = baseOrigins
  .filter(Boolean)
  .map((origin) => origin.trim().replace(/\/+$/, ''));

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser agents (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.trim().replace(/\/+$/, '');
      const isExplicitlyAllowed = allowedOrigins.includes(normalizedOrigin);
      const isResQPreviewDomain = /^https:\/\/(resq|emergencyfinder)(-[a-z0-9-]+)?\.vercel\.app$/.test(normalizedOrigin);

      if (isExplicitlyAllowed || isResQPreviewDomain) {
        callback(null, true);
      } else {
        // Standard CORS rejection without triggering unhandled Express 500 error
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-requested-with']
  })
);

// ─── Body parsing & Sanitization ───────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // reject suspiciously large payloads
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(noSqlSanitizer);

// ─── Optional API Key Guard (Active when RESQ_API_KEY is configured in .env) ──
app.use(optionalApiKeyGuard);

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health-check route (mounted at both /api/health and /health)
const healthHandler = (_req, res) => {
  res.json({
    status: 'online',
    service: 'ResQ — Emergency Response & Service Locator API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

// Mount routers at both /api/* and /* to guarantee 100% compatibility with
// serverless rewrites and direct client reverse proxies
app.use('/api/places', placesRouter);
app.use('/places', placesRouter);

app.use('/api/users', usersRouter);
app.use('/users', usersRouter);

app.use('/api/contacts', contactsRouter);
app.use('/contacts', contactsRouter);

app.use('/api/donors', donorsRouter);
app.use('/donors', donorsRouter);

// ─── Error handling (must be last) ────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Server Startup & Graceful Shutdown ───────────────────────────────────────
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  const server = app.listen(PORT, () => {
    console.log('');
    console.log('  🚑  ResQ — Emergency Response & Service Locator API');
    console.log(`  ➜  http://localhost:${PORT}`);
    console.log(`  ➜  Health: http://localhost:${PORT}/api/health`);
    console.log(`  ➜  Nearby: http://localhost:${PORT}/api/places/nearby`);
    console.log(`  ➜  Env:    ${process.env.NODE_ENV || 'development'}`);
    console.log('');
  });

  const shutdown = () => {
    console.log('Shutting down server gracefully...');
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

export default app;

