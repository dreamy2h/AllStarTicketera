import { Router } from 'express';
import {
  getAllEvents,
  getEventBySlug,
  createEvent,
  getEventStats,
  exportEventAttendeesCsv,
} from '../controllers/eventController.js';
import { getEventAttendees } from '../controllers/ticketController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

// Public routes
router.get('/', getAllEvents);
router.get('/:slug', getEventBySlug);

// Protected routes
router.post('/', protect, requirePermission('create_events'), createEvent);
router.get('/:id/stats', protect, getEventStats);
router.get('/:id/export', protect, requirePermission('view_metrics'), exportEventAttendeesCsv);
router.get('/:eventId/attendees', protect, getEventAttendees);

export default router;
