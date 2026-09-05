import { Router, Request, Response } from 'express';
import { UserModel } from '../models/user.js';
import { CreatorModel } from '../models/creator.js';
import { ProjectModel } from '../models/project.js';
import { NotificationModel } from '../models/notification.js';
import { generateToken } from '../config/jwt.js';
import { authenticate } from '../middleware/auth.js';
import { validateEmail, validateName, validatePassword, validateUsername, validateSlug } from '../middleware/validate.js';
import pool from '../config/database.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ error: emailError });
    }

    const pwError = validatePassword(password);
    if (pwError) {
      return res.status(400).json({ error: pwError });
    }

    // If password provided, verify credentials. Otherwise, demo login by email only.
    let user;
    if (password) {
      user = await UserModel.verifyCredentials(email.trim(), password);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }
    } else {
      // Demo mode: login by email only (no password check)
      user = await UserModel.findByEmail(email.trim());
      if (!user) {
        return res.status(404).json({ error: 'User not found. Try one of our demo accounts or register.' });
      }
    }

    const token = generateToken(user);

    return res.json({ user, token });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, category, role, password } = req.body;

    const nameError = validateName(name);
    if (nameError) {
      return res.status(400).json({ error: nameError });
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ error: emailError });
    }

    if (!category || typeof category !== 'string') {
      return res.status(400).json({ error: 'Category is required' });
    }

    const pwError = validatePassword(password);
    if (pwError) {
      return res.status(400).json({ error: pwError });
    }

    const existing = await UserModel.findByEmail(email.trim());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists.' });
    }

    const user = await UserModel.create({
      name: name.trim(),
      email: email.trim(),
      category,
      role,
      password,
    });
    const token = generateToken(user);

    return res.status(201).json({ user, token });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/apply-creator
router.post('/apply-creator', authenticate, async (req: Request, res: Response) => {
  try {
    const creatorData = req.body;

    if (!creatorData.displayName || typeof creatorData.displayName !== 'string' || !creatorData.displayName.trim()) {
      return res.status(400).json({ error: 'displayName is required' });
    }

    const usernameError = validateUsername(creatorData.username);
    if (usernameError) {
      return res.status(400).json({ error: usernameError });
    }

    creatorData.userId = req.user!.userId;

    const existing = await CreatorModel.findByUsername(creatorData.username.replace('@', '').trim());
    if (existing) {
      return res.status(409).json({ error: 'This username is already taken.' });
    }

    creatorData.displayName = creatorData.displayName.trim().slice(0, 100);
    creatorData.username = creatorData.username.replace('@', '').trim().toLowerCase();
    creatorData.bio = typeof creatorData.bio === 'string' ? creatorData.bio.trim().slice(0, 2000) : '';
    creatorData.country = typeof creatorData.country === 'string' ? creatorData.country.trim().slice(0, 100) : 'Ethiopia';
    creatorData.city = typeof creatorData.city === 'string' ? creatorData.city.trim().slice(0, 100) : '';

    const creator = await CreatorModel.create(creatorData);

    await NotificationModel.create({
      userId: 'user-admin',
      title: 'New Creator Application',
      message: `${creator.displayName} (@${creator.username}) submitted an application for review.`,
      type: 'warning',
      link: 'admin-creators',
    });

    return res.status(201).json({ creator });
  } catch (err) {
    console.error('Apply creator error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/apply-project
router.post('/apply-project', authenticate, async (req: Request, res: Response) => {
  try {
    const projectData = req.body;

    if (!projectData.name || typeof projectData.name !== 'string' || !projectData.name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }

    projectData.userId = req.user!.userId;

    projectData.name = projectData.name.trim().slice(0, 100);
    projectData.description = typeof projectData.description === 'string' ? projectData.description.trim().slice(0, 5000) : '';
    projectData.website = typeof projectData.website === 'string' ? projectData.website.trim().slice(0, 500) : '';
    projectData.ecosystem = typeof projectData.ecosystem === 'string' ? projectData.ecosystem.trim().slice(0, 100) : '';
    projectData.contactEmail = typeof projectData.contactEmail === 'string' ? projectData.contactEmail.trim().slice(0, 255) : '';
    projectData.representativeName = typeof projectData.representativeName === 'string' ? projectData.representativeName.trim().slice(0, 100) : '';

    const project = await ProjectModel.create(projectData);

    await NotificationModel.create({
      userId: 'user-admin',
      title: 'New Project Partner Request',
      message: `${project.name} (${project.category}) submitted an onboarding application.`,
      type: 'info',
      link: 'admin-projects',
    });

    return res.status(201).json({ project });
  } catch (err) {
    console.error('Apply project error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/auth/me - Get current user from token
router.get('/me', authenticate, async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({ user });
  } catch (err) {
    console.error('Get me error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || typeof currentPassword !== 'string') {
      return res.status(400).json({ error: 'Current password is required' });
    }

    const pwError = validatePassword(newPassword);
    if (pwError) {
      return res.status(400).json({ error: `New password: ${pwError}` });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await UserModel.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.user!.userId]);
    const row = result.rows[0];
    if (row && row.password_hash) {
      const bcrypt = await import('bcryptjs');
      const isValid = bcrypt.default.compareSync(currentPassword, row.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
    }

    await UserModel.updatePassword(req.user!.userId, newPassword);

    return res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
