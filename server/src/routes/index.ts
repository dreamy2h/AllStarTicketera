import { Router } from 'express';
import eventRoutes from './eventRoutes.js';
import ticketRoutes from './ticketRoutes.js';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';
import roleRoutes from './roleRoutes.js';
import rankRoutes from './rankRoutes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/events', eventRoutes);
apiRouter.use('/tickets', ticketRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/roles', roleRoutes);
apiRouter.use('/ranks', rankRoutes);

apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AllStar Ticket API',
  });
});

export default apiRouter;
