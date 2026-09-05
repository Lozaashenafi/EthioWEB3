import { Router, Request, Response } from 'express';
import { ProjectModel } from '../models/project.js';
import { UserModel } from '../models/user.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateStatus } from '../middleware/validate.js';

const router = Router();

const VALID_PROJECT_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];

// GET /api/projects - Public
router.get('/', async (req: Request, res: Response) => {
  try {
    const projects = await ProjectModel.findAll();
    return res.json({ projects });
  } catch (err) {
    console.error('Get projects error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/projects/:id - Public
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || id.trim().length === 0 || id.length > 100) {
      return res.status(400).json({ error: 'Invalid project ID' });
    }
    const project = await ProjectModel.findById(id.trim());
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    return res.json({ project });
  } catch (err) {
    console.error('Get project error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/projects/:id/status - Admin only
router.patch('/:id/status', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    const statusError = validateStatus(status, VALID_PROJECT_STATUSES);
    if (statusError) {
      return res.status(400).json({ error: statusError });
    }

    const project = await ProjectModel.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await ProjectModel.updateStatus(req.params.id, status);

    if (status === 'APPROVED') {
      await UserModel.updateRole(project.userId, 'PROJECT');
    }

    const updated = await ProjectModel.findById(req.params.id);
    return res.json({ project: updated });
  } catch (err) {
    console.error('Update project status error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
