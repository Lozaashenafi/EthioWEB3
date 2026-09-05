import { Router, Request, Response } from 'express';
import { NotificationModel } from '../models/notification.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/notifications/:userId - Authenticated (own notifications or admin)
router.get('/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const targetUserId = req.params.userId;

    if (!targetUserId || targetUserId.trim().length === 0 || targetUserId.length > 100) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    if (req.user!.userId !== targetUserId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You can only view your own notifications.' });
    }

    const notifications = await NotificationModel.findByUserId(targetUserId);
    return res.json({ notifications });
  } catch (err) {
    console.error('Get notifications error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/notifications/:id/read - Authenticated (own notification)
router.patch('/:id/read', authenticate, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || id.trim().length === 0 || id.length > 100) {
      return res.status(400).json({ error: 'Invalid notification ID' });
    }

    const notification = await NotificationModel.findById(id.trim());
    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (notification.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You can only mark your own notifications as read.' });
    }

    await NotificationModel.markRead(id.trim());
    return res.json({ success: true });
  } catch (err) {
    console.error('Mark notification read error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
