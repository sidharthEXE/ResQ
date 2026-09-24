import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import placesRouter from './routes/places.js';
import usersRouter from './routes/users.js';
import contactsRouter from './routes/contacts.js';
import donorsRouter from './routes/donors.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { connectDB } from './config/db.js';
import { 
  securityHeaders, 
  noSqlSanitizer, 
  readLimiter, 
  mutationLimiter, 
  optionalApiKeyGuard 
} from './middleware/security.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';

// Disable default Express fingerprint
app.disable('x-powered-by');

// ─── Request logging ──────────────────────────────────────────────────────────
// 'dev' format: colourised one-liner per request (only in development)
// 'combined' Apache format: full details for production log aggregators
app.use(morgan(isDev ? 'dev' : 'combined'));

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(securityHeaders);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow mobile apps, curl, and server-to-server (no Origin header)
      if (!origin) return callback(null, true);

      // Check allowed list or Vercel preview domains
      const isAllowed = allowedOrigins.includes(origin) || origin.endsWith('.vercel.app');
      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin "${origin}" not allowed`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-requested-with']
  })
);

// ─── Body parsing & Sanitization ───────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // reject suspiciously large bodies
app.use(express.urlencoded({ extended: false }));
app.use(noSqlSanitizer);

// ─── Optional API Key Guard (Active when RESQ_API_KEY is set in .env) ─────────
app.use(optionalApiKeyGuard);

// ─── Rate Limiting (Tiered Protection) ─────────────────────────────────────────
// Generous discovery limiter for read endpoints
app.use('/api/places', readLimiter);

// Strict limiter for mutation endpoints to prevent bot spam
app.use('/api/donors', mutationLimiter);
app.use('/api/users', mutationLimiter);
app.use('/api/contacts', mutationLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health-check — useful for uptime monitors and CI readiness probes
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'ResQ — Emergency Response & Service Locator API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Places endpoints
app.use('/api/places', placesRouter);

// Database endpoints
app.use('/api/users', usersRouter);
app.use('/api/contacts', contactsRouter);
app.use('/api/donors', donorsRouter);

// ─── Error handling (must be last) ────────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('');
    console.log('  🚑  ResQ — Emergency Response & Service Locator API');
    console.log(`  ➜  http://localhost:${PORT}`);
    console.log(`  ➜  Health: http://localhost:${PORT}/api/health`);
    console.log(`  ➜  Nearby: http://localhost:${PORT}/api/places/nearby`);
    console.log(`  ➜  Env:    ${process.env.NODE_ENV || 'development'}`);
    console.log('');
  });
}

export default app;
