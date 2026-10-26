import { Router } from 'express';
import {
  registerTicket,
  checkInTicket,
  getTicketByCode,
} from '../controllers/ticketController.js';

const router = Router();

router.post('/register', registerTicket);
router.post('/check-in', checkInTicket);
router.get('/:code', getTicketByCode);

export default router;
