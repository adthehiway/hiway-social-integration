console.log('[BOOT] Starting hiway-social-integration...');
console.log(`[BOOT] Node.js ${process.version} | PID ${process.pid}`);

import express from 'express';
import { env } from './config/env';
import { internalOnlyMiddleware } from './middleware/auth.middleware';
import { errorHandler } from './middleware/error.middleware';
import postsRoutes from './routes/posts.routes';
import profilesRoutes from './routes/profiles.routes';
import accountsRoutes from './routes/accounts.routes';
import webhooksRoutes from './routes/webhooks.routes';
import aiRoutes from './routes/ai.routes';
import schedulesRoutes from './routes/schedules.routes';
import analyticsRoutes from './routes/analytics.routes';

// Catch unhandled errors so they show in Railway logs
process.on('uncaughtException', (err) => {
  console.error(`[FATAL] Uncaught exception: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error(`[FATAL] Unhandled rejection: ${reason}`);
  if (reason instanceof Error) console.error(reason.stack);
});
process.on('SIGTERM', () => {
  console.log('[SHUTDOWN] SIGTERM received, shutting down...');
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('[SHUTDOWN] SIGINT received, shutting down...');
  process.exit(0);
});

console.log('[BOOT] Setting up Express app...');
const app = express();

app.use(express.json());

// Request/response logger
app.use((req, res, next) => {
  if (req.path !== '/health') {
    const start = Date.now();
    console.log(`[REQ] ${req.method} ${req.path} company=${req.headers['x-company-id'] || 'none'} host=${req.headers.host || 'unknown'} ip=${req.ip}`);
    res.on('finish', () => {
      const duration = Date.now() - start;
      const level = res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO';
      console.log(`[RES] [${level}] ${req.method} ${req.path} status=${res.statusCode} ${duration}ms`);
    });
  }
  next();
});

// Health check (no auth)
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Webhooks (no auth — Ayrshare calls this)
app.use('/webhooks', webhooksRoutes);

// Internal-only routes (localhost + *.railway.internal)
app.use('/social/posts', internalOnlyMiddleware, postsRoutes);
app.use('/social/profiles', internalOnlyMiddleware, profilesRoutes);
app.use('/social/accounts', internalOnlyMiddleware, accountsRoutes);
app.use('/social/ai', internalOnlyMiddleware, aiRoutes);
app.use('/social/schedules', internalOnlyMiddleware, schedulesRoutes);
app.use('/social/analytics', internalOnlyMiddleware, analyticsRoutes);

app.use(errorHandler);

console.log('[BOOT] Routes registered');

export { app };

if (require.main === module) {
  const port = env.PORT;
  app.listen(port, () => {
    console.log('='.repeat(60));
    console.log(`[START] Server running on port ${port}`);
    console.log(`[START] NODE_ENV=${env.NODE_ENV}`);
    console.log(`[START] AYRSHARE_BASE_URL=${env.AYRSHARE_BASE_URL}`);
    console.log(`[START] AYRSHARE_API_KEY=${env.AYRSHARE_API_KEY ? '***set***' : 'MISSING'}`);
    console.log(`[START] AYRSHARE_PRIVATE_KEY=${env.AYRSHARE_PRIVATE_KEY ? `***set*** (${env.AYRSHARE_PRIVATE_KEY.length} chars)` : 'MISSING'}`);
    console.log(`[START] DATABASE_URL=${env.DATABASE_URL ? '***set***' : 'MISSING'}`);
    console.log('='.repeat(60));
    console.log('[START] Ready to accept requests');
  });
}
