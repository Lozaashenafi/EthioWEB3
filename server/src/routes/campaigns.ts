import { Router, Request, Response } from 'express';
import { CampaignModel } from '../models/campaign.js';
import { ParticipantModel } from '../models/participant.js';
import { SubmissionModel } from '../models/submission.js';
import { CreatorModel } from '../models/creator.js';
import { NotificationModel } from '../models/notification.js';
import { xProvider } from '../services/social/xProvider.js';
import { campaignScoringService } from '../services/scoring.js';
import { authenticate, requireRole, optionalAuth } from '../middleware/auth.js';
import { requireFields, validateSlug, validateStatus, sanitizeString } from '../middleware/validate.js';

const router = Router();

const VALID_CAMPAIGN_STATUSES = ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED'];

// GET /api/campaigns - Public
router.get('/', async (req: Request, res: Response) => {
  try {
    const campaigns = await CampaignModel.findAll();
    return res.json({ campaigns });
  } catch (err) {
    console.error('Get campaigns error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/campaigns/:identifier - Public
router.get('/:identifier', async (req: Request, res: Response) => {
  try {
    const { identifier } = req.params;
    if (!identifier || identifier.trim().length === 0 || identifier.length > 200) {
      return res.status(400).json({ error: 'Invalid campaign identifier' });
    }
    const campaign = await CampaignModel.findByIdOrSlug(identifier.trim());
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }
    return res.json({ campaign });
  } catch (err) {
    console.error('Get campaign error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/campaigns - Authenticated (Project or Admin)
router.post('/', authenticate, requireRole('PROJECT', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const data = req.body;

    const fieldError = requireFields(data, 'title', 'slug', 'projectId');
    if (fieldError) {
      return res.status(400).json({ error: fieldError });
    }

    const slugError = validateSlug(data.slug);
    if (slugError) {
      return res.status(400).json({ error: slugError });
    }

    data.title = sanitizeString(data.title, 200) || data.title;
    data.shortDescription = sanitizeString(data.shortDescription, 500) || '';
    data.description = sanitizeString(data.description, 10000) || '';
    data.coverImage = sanitizeString(data.coverImage, 2000) || '';
    data.projectName = sanitizeString(data.projectName, 100) || '';
    data.projectLogo = sanitizeString(data.projectLogo, 2000) || '';

    const campaign = await CampaignModel.create(data);

    await NotificationModel.create({
      userId: 'user-admin',
      title: 'New Campaign Pending Review',
      message: `"${campaign.title}" by ${campaign.projectName} was submitted for review.`,
      type: 'campaign',
      link: 'admin-campaigns',
    });

    return res.status(201).json({ campaign });
  } catch (err) {
    console.error('Create campaign error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/campaigns/:id/status - Admin only
router.patch('/:id/status', authenticate, requireRole('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    const statusError = validateStatus(status, VALID_CAMPAIGN_STATUSES);
    if (statusError) {
      return res.status(400).json({ error: statusError });
    }

    await CampaignModel.updateStatus(req.params.id, status);
    const updated = await CampaignModel.findById(req.params.id);
    return res.json({ campaign: updated });
  } catch (err) {
    console.error('Update campaign status error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/campaigns/:id/join - Authenticated (Creator only)
router.post('/:id/join', authenticate, requireRole('CREATOR'), async (req: Request, res: Response) => {
  try {
    const { creatorId } = req.body;
    if (!creatorId || typeof creatorId !== 'string' || !creatorId.trim()) {
      return res.status(400).json({ error: 'creatorId is required' });
    }

    const creator = await CreatorModel.findById(creatorId.trim());
    if (!creator) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    if (creator.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You can only join campaigns with your own creator profile.' });
    }

    const campaign = await CampaignModel.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const existing = await ParticipantModel.findByCampaignAndCreator(req.params.id, creatorId.trim());
    if (existing) {
      return res.json({ participant: existing });
    }

    const participant = await ParticipantModel.create({
      campaignId: req.params.id,
      creatorId: creator.id,
      creatorName: creator.displayName,
      creatorUsername: creator.username,
    });

    return res.status(201).json({ participant });
  } catch (err) {
    console.error('Join campaign error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/campaigns/:id/participants - Public
router.get('/:id/participants', async (req: Request, res: Response) => {
  try {
    const participants = await ParticipantModel.findAll(req.params.id);
    return res.json({ participants });
  } catch (err) {
    console.error('Get participants error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/campaigns/:id/submissions - Public
router.get('/:id/submissions', async (req: Request, res: Response) => {
  try {
    const submissions = await SubmissionModel.findAll(req.params.id);
    return res.json({ submissions });
  } catch (err) {
    console.error('Get submissions error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/campaigns/:id/submit - Authenticated (Creator only)
router.post('/:id/submit', authenticate, requireRole('CREATOR'), async (req: Request, res: Response) => {
  try {
    const { creatorId, postUrl } = req.body;
    if (!creatorId || typeof creatorId !== 'string' || !creatorId.trim()) {
      return res.status(400).json({ error: 'creatorId is required' });
    }
    if (!postUrl || typeof postUrl !== 'string' || !postUrl.trim()) {
      return res.status(400).json({ error: 'postUrl is required' });
    }

    if (postUrl.trim().length > 2000) {
      return res.status(400).json({ error: 'postUrl is too long' });
    }

    const creator = await CreatorModel.findById(creatorId.trim());
    if (!creator) {
      return res.status(404).json({ error: 'Creator not found' });
    }

    if (creator.userId !== req.user!.userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'You can only submit posts with your own creator profile.' });
    }

    const campaign = await CampaignModel.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    const validation = xProvider.validateUrl(postUrl.trim());
    if (!validation.valid || !validation.postId) {
      return res.status(400).json({ error: validation.error || 'Invalid X post URL format.' });
    }

    const existing = await SubmissionModel.findByExternalPostId(validation.postId, req.params.id);
    if (existing) {
      return res.status(409).json({ error: 'This X post has already been submitted to this campaign.' });
    }

    let participant = await ParticipantModel.findByCampaignAndCreator(req.params.id, creatorId.trim());
    if (!participant) {
      participant = await ParticipantModel.create({
        campaignId: req.params.id,
        creatorId: creator.id,
        creatorName: creator.displayName,
        creatorUsername: creator.username,
      });
    }

    const postData = await xProvider.fetchPostData(validation.postId, validation.username || creator.username);
    const score = campaignScoringService.calculatePostScore(postData.metrics);
    const engagementRate = campaignScoringService.calculateEngagementRate(postData.metrics);

    const initialSnapshot = {
      id: `snap-${Date.now()}`,
      submissionId: `sub-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...postData.metrics,
    };

    const submission = await SubmissionModel.create({
      campaignId: req.params.id,
      campaignTitle: campaign.title,
      creatorId: creator.id,
      creatorUsername: creator.username,
      creatorDisplayName: creator.displayName,
      platform: 'X' as const,
      externalPostId: validation.postId,
      url: postUrl.trim(),
      contentText: postData.contentText,
      submittedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
      status: 'VERIFIED' as const,
      metrics: {
        ...postData.metrics,
        engagementRate,
      },
      snapshots: [initialSnapshot as any],
      score,
    });

    await recalculateParticipantStats(req.params.id, creatorId.trim());

    return res.status(201).json({ submission });
  } catch (err) {
    console.error('Submit post error:', err);
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
});

// POST /api/campaigns/submissions/:submissionId/sync - Authenticated (Creator only)
router.post('/submissions/:submissionId/sync', authenticate, requireRole('CREATOR', 'ADMIN'), async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params;
    if (!submissionId || submissionId.trim().length === 0) {
      return res.status(400).json({ error: 'Invalid submission ID' });
    }

    const sub = await SubmissionModel.findById(submissionId.trim());
    if (!sub) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    if (req.user!.role !== 'ADMIN') {
      const creator = await CreatorModel.findById(sub.creatorId);
      if (!creator || creator.userId !== req.user!.userId) {
        return res.status(403).json({ error: 'You can only sync your own submissions.' });
      }
    }

    const newMetrics = await xProvider.refreshMetrics(sub.externalPostId);
    const score = campaignScoringService.calculatePostScore(newMetrics);
    const engagementRate = campaignScoringService.calculateEngagementRate(newMetrics);

    const newSnapshot = {
      id: `snap-${Date.now()}`,
      submissionId: sub.id,
      timestamp: new Date().toISOString(),
      ...newMetrics,
    };

    const updatedMetrics = {
      ...newMetrics,
      engagementRate,
    };

    const updatedSnapshots = [...sub.snapshots, newSnapshot];

    await SubmissionModel.update(sub.id, {
      lastSyncedAt: new Date().toISOString(),
      metrics: updatedMetrics as any,
      snapshots: updatedSnapshots as any,
      score,
    });

    await recalculateParticipantStats(sub.campaignId, sub.creatorId);

    const updated = await SubmissionModel.findById(sub.id);
    return res.json({ submission: updated });
  } catch (err) {
    console.error('Sync metrics error:', err);
    return res.status(500).json({ error: err instanceof Error ? err.message : 'Internal server error' });
  }
});

async function recalculateParticipantStats(campaignId: string, creatorId: string): Promise<void> {
  const creatorSubmissions = (await SubmissionModel.findAll(campaignId, creatorId))
    .filter((s) => s.status === 'VERIFIED');

  const totalPosts = creatorSubmissions.length;
  const totalImpressions = creatorSubmissions.reduce((sum, s) => sum + s.metrics.impressions, 0);
  const totalEngagements = creatorSubmissions.reduce(
    (sum, s) => sum + s.metrics.likes + s.metrics.reposts + s.metrics.replies + s.metrics.bookmarks,
    0
  );
  const score = creatorSubmissions.reduce((sum, s) => sum + s.score, 0);

  const participant = await ParticipantModel.findByCampaignAndCreator(campaignId, creatorId);
  if (participant) {
    await ParticipantModel.updateStats(participant.id, {
      totalPosts,
      totalImpressions,
      totalEngagements,
      score,
    });
  }

  const campaignParts = (await ParticipantModel.findAll(campaignId))
    .sort((a, b) => b.score - a.score);

  for (const [idx, p] of campaignParts.entries()) {
    await ParticipantModel.updateRank(p.id, idx + 1);
  }
}

export default router;
