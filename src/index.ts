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

const app = express();

app.use(express.json());

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

app.use(errorHandler);

export { app };

if (require.main === module) {
  app.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
}
