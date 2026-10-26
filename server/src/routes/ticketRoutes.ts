import { Router } from 'express';
import {
  registerTicket,
  checkInTicket,
  getTicketByCode,
} from '../controllers/ticketController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', registerTicket);
router.post('/check-in', protect, requirePermission('scanner:access'), checkInTicket);
router.get('/:code', getTicketByCode);

export default router;
