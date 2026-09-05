import { Router, Request, Response } from 'express';
import { RewardModel } from '../models/reward.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateStatus, sanitizeString } from '../middleware/validate.js';

const router = Router();

const VALID_REWARD_STATUSES = ['PENDING', 'APPROVED', 'PAID', 'CANCELLED'];

// GET /api/rewards - Authenticated (own rewards or admin)
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { creatorId } = req.query;

    if (req.user!.role === 'ADMIN') {
      const rewards = await RewardModel.findAll(creatorId as string | undefined);
      return res.json({ rewards });
    }

    const rewards = await RewardModel.findAll(req.user!.userId);
    return res.json({ rewards });
  } catch (err) {
    console.error('Get rewards error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/rewards/:id - Authenticated
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || id.trim().length === 0 || id.length > 100) {
      return res.status(400).json({ error: 'Invalid reward ID' });
    }
    const reward = await RewardModel.findById(id.trim());
    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }
    return res.json({ reward });
  } catch (err) {
    console.error('Get reward error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/rewards/:id/status - Admin only
router.patch('/:id/status', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { status, txReference } = req.body;

    const statusError = validateStatus(status, VALID_REWARD_STATUSES);
    if (statusError) {
      return res.status(400).json({ error: statusError });
    }

    const sanitizedTxRef = sanitizeString(txReference, 500);

    await RewardModel.updateStatus(req.params.id, status, sanitizedTxRef);
    const updated = await RewardModel.findById(req.params.id);
    return res.json({ reward: updated });
  } catch (err) {
    console.error('Update reward status error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
