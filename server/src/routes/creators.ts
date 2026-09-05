import { Router, Request, Response } from 'express';
import { CreatorModel } from '../models/creator.js';
import { UserModel } from '../models/user.js';
import { NotificationModel } from '../models/notification.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateStatus, sanitizeString } from '../middleware/validate.js';

const router = Router();

const VALID_CREATOR_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];

// GET /api/creators - Public
router.get('/', async (req: Request, res: Response) => {
  try {
    const { approved } = req.query;
    const creators = approved === 'true' ? await CreatorModel.findApproved() : await CreatorModel.findAll();
    return res.json({ creators });
  } catch (err) {
    console.error('Get creators error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/creators/:id - Public
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || id.trim().length === 0 || id.length > 100) {
      return res.status(400).json({ error: 'Invalid creator ID' });
    }
    const creator = await CreatorModel.findById(id.trim());
    if (!creator) {
      return res.status(404).json({ error: 'Creator not found' });
    }
    return res.json({ creator });
  } catch (err) {
    console.error('Get creator error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/creators/:id/status - Admin only
router.patch('/:id/status', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { status, reviewNotes } = req.body;

    const statusError = validateStatus(status, VALID_CREATOR_STATUSES);
    if (statusError) {
      return res.status(400).json({ error: statusError });
    }

    const creator = await CreatorModel.findById(req.params.id);
    if (!creator) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    const sanitizedNotes = sanitizeString(reviewNotes, 2000);

    await CreatorModel.updateStatus(req.params.id, status, sanitizedNotes);

    if (status === 'APPROVED') {
      await UserModel.updateRole(creator.userId, 'CREATOR');
    }

    await NotificationModel.create({
      userId: creator.userId,
      title: status === 'APPROVED' ? 'Creator Application Approved! 🎉' : 'Creator Application Status Update',
      message:
        status === 'APPROVED'
          ? 'Congratulations! You are now a verified EthioWeb3 creator. You can browse and join campaigns.'
          : `Your creator application status has been updated to ${status}.`,
      type: status === 'APPROVED' ? 'success' : 'info',
      link: 'dashboard',
    });

    const updated = await CreatorModel.findById(req.params.id);
    return res.json({ creator: updated });
  } catch (err) {
    console.error('Update creator status error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
