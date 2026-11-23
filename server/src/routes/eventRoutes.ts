import { Router } from 'express';
import {
  getAllEvents,
  getEventBySlug,
  createEvent,
  getEventStats,
  exportEventAttendeesCsv,
  cancelEvent,
  reactivateEvent,
} from '../controllers/eventController.js';
import { getEventAttendees } from '../controllers/ticketController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.get('/', getAllEvents);
router.get('/:slug', getEventBySlug);

// Protected routes with dynamic permissions
router.post('/', protect, requirePermission('events:create'), createEvent);
router.post('/:id/cancel', protect, requirePermission('events:create'), cancelEvent);
router.post('/:id/reactivate', protect, requirePermission('events:create'), reactivateEvent);
router.get('/:id/stats', protect, getEventStats);
router.get('/:id/export', protect, requirePermission('metrics:export'), exportEventAttendeesCsv);
router.get('/:eventId/attendees', protect, getEventAttendees);

export default router;
