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

// Protected routes with granular permissions
router.get('/', protect, getPartners);
router.post('/', protect, requirePermission('partners:manage'), createPartner);
router.put('/:id', protect, requirePermission('partners:manage'), updatePartner);

export default router;
