import { Router } from 'express';
import {
  getRoles,
  getPermissions,
  createRole,
  updateRole,
  deleteRole,
} from '../controllers/roleController.js';
import { protect, requirePermission } from '../middleware/authMiddleware.js';

const router = Router();

router.use(protect);

router.get('/', getRoles);
router.get('/permissions', getPermissions);
router.post('/', requirePermission('roles:manage'), createRole);
router.put('/:id', requirePermission('roles:manage'), updateRole);
router.delete('/:id', requirePermission('roles:manage'), deleteRole);

export default router;
