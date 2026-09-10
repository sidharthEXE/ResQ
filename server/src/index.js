import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import placesRouter from './routes/places.js';
import usersRouter from './routes/users.js';
import contactsRouter from './routes/contacts.js';
import donorsRouter from './routes/donors.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { connectDB } from './config/db.js';

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const isDev = process.env.NODE_ENV !== 'production';

// ─── Request logging ──────────────────────────────────────────────────────────
// 'dev' format: colourised one-liner per request (only in development)
// 'combined' Apache format: full details for production log aggregators
app.use(morgan(isDev ? 'dev' : 'combined'));

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server requests (no Origin header) and known frontends
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin "${origin}" not allowed`));
      }
    },
    credentials: true
  })
);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // reject suspiciously large bodies
app.use(express.urlencoded({ extended: false }));

// ─── Rate limiting ────────────────────────────────────────────────────────────
// Protects both our server and the upstream Overpass API from abuse
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,  // 1 minute window
  max: 60,              // max 60 requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests. Please wait a moment and try again.'
  }
});

app.use('/api/', apiLimiter);

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
app.listen(PORT, () => {
  console.log('');
  console.log('  🚑  ResQ — Emergency Response & Service Locator API');
  console.log(`  ➜  http://localhost:${PORT}`);
  console.log(`  ➜  Health: http://localhost:${PORT}/api/health`);
  console.log(`  ➜  Nearby: http://localhost:${PORT}/api/places/nearby`);
  console.log(`  ➜  Env:    ${process.env.NODE_ENV || 'development'}`);
  console.log('');
});
