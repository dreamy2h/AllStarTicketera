import { Router } from 'express';
import {
  getPartners,
  checkReferralCode,
  createPartner,
  updatePartner,
} from '../controllers/userController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

// Public referral check for registration landing
router.get('/referral/:code', checkReferralCode);

// Protected routes
router.get('/', protect, getPartners);
router.post('/', protect, requirePermission('manage_partners'), createPartner);
router.put('/:id', protect, requirePermission('manage_partners'), updatePartner);

export default router;
