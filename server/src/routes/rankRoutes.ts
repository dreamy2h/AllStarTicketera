import { Router } from 'express';
import { getRanks, createRank, updateRank, deleteRank } from '../controllers/rankController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

// List ranks - Available to all authenticated users
router.get('/', protect, getRanks);

// Create, update, delete ranks - Restricted to users with 'ranks:manage' permission (or admin)
router.post('/', protect, requirePermission('ranks:manage'), createRank);
router.put('/:id', protect, requirePermission('ranks:manage'), updateRank);
router.delete('/:id', protect, requirePermission('ranks:manage'), deleteRank);

export default router;
