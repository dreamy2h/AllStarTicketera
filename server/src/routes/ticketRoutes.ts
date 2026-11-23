import { Router } from 'express';
import {
  registerTicket,
  checkInTicket,
  getTicketByCode,
  resendTicketEmail,
  getTicketQrImage,
} from '../controllers/ticketController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', registerTicket);
router.post('/check-in', protect, requirePermission('scanner:access'), checkInTicket);
router.post('/:id/send-email', resendTicketEmail);
router.get('/:code/qr.png', getTicketQrImage);
router.get('/:code/qr', getTicketQrImage);
router.get('/:code', getTicketByCode);

export default router;
