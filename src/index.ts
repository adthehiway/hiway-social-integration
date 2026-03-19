import express from 'express';
import { env } from './config/env';
import { authMiddleware } from './middleware/auth.middleware';
import { errorHandler } from './middleware/error.middleware';
import postsRoutes from './routes/posts.routes';
import profilesRoutes from './routes/profiles.routes';
import accountsRoutes from './routes/accounts.routes';
import webhooksRoutes from './routes/webhooks.routes';
import aiRoutes from './routes/ai.routes';
import schedulesRoutes from './routes/schedules.routes';
import analyticsRoutes from './routes/analytics.routes';

const app = express();

app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  if (req.path !== '/health') {
    console.log(`[REQ] ${req.method} ${req.path} company=${req.headers['x-company-id'] || 'none'}`);
  }
  next();
});

// Health check (no auth)
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Webhooks (no auth — Ayrshare calls this)
app.use('/webhooks', webhooksRoutes);

// Authenticated routes
app.use('/social/posts', authMiddleware, postsRoutes);
app.use('/social/profiles', authMiddleware, profilesRoutes);
app.use('/social/accounts', authMiddleware, accountsRoutes);
app.use('/social/ai', authMiddleware, aiRoutes);
app.use('/social/schedules', authMiddleware, schedulesRoutes);
app.use('/social/analytics', authMiddleware, analyticsRoutes);

app.use(errorHandler);

export { app };

if (require.main === module) {
  app.listen(env.PORT, () => {
    console.log(`[START] Server running on port ${env.PORT}`);
    console.log(`[START] NODE_ENV=${env.NODE_ENV}`);
    console.log(`[START] AYRSHARE_BASE_URL=${env.AYRSHARE_BASE_URL}`);
    console.log(`[START] AYRSHARE_API_KEY=${env.AYRSHARE_API_KEY ? '***set***' : 'MISSING'}`);
    console.log(`[START] AYRSHARE_PRIVATE_KEY=${env.AYRSHARE_PRIVATE_KEY ? `***set*** (${env.AYRSHARE_PRIVATE_KEY.length} chars)` : 'MISSING'}`);
    console.log(`[START] HIWAY_API_KEY=${env.HIWAY_API_KEY ? '***set***' : 'MISSING'}`);
    console.log(`[START] DATABASE_URL=${env.DATABASE_URL ? '***set***' : 'MISSING'}`);
  });
}
