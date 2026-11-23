import { Router } from 'express';
import {
  getAllTicketTypes,
  getTicketTypesByEvent,
  createTicketType,
  updateTicketType,
  deleteTicketType,
} from '../controllers/ticketTypeController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

// Routes to list ticket types
router.get('/', getAllTicketTypes);
router.get('/event/:eventId', getTicketTypesByEvent);

// Protected routes to manage ticket types
router.post('/', protect, requirePermission('ticket_types:manage'), createTicketType);
router.put('/:id', protect, requirePermission('ticket_types:manage'), updateTicketType);
router.delete('/:id', protect, requirePermission('ticket_types:manage'), deleteTicketType);

export default router;

