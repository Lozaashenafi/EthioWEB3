import { Router, Request, Response } from 'express';
import { UserModel } from '../models/user.js';
import { authenticate, requireRole, requireSelfOrAdmin } from '../middleware/auth.js';
import { validateStatus } from '../middleware/validate.js';

const router = Router();

const VALID_USER_ROLES = ['USER', 'CREATOR', 'PROJECT', 'ADMIN'];

// GET /api/users - Admin only
router.get('/', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    const users = await UserModel.findAll();
    return res.json({ users });
  } catch (err) {
    console.error('Get users error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/users/:id - Self or admin
router.get('/:id', authenticate, requireSelfOrAdmin, async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ user });
  } catch (err) {
    console.error('Get user error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/users/:id/role - Admin only
router.patch('/:id/role', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { role } = req.body;

    const statusError = validateStatus(role, VALID_USER_ROLES);
    if (statusError) {
      return res.status(400).json({ error: `Invalid role. Allowed: ${VALID_USER_ROLES.join(', ')}` });
    }

    await UserModel.updateRole(req.params.id, role);
    const user = await UserModel.findById(req.params.id);
    return res.json({ user });
  } catch (err) {
    console.error('Update user role error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
