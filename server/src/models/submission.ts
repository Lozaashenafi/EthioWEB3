import { query, queryOne } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export interface MetricSnapshot {
  id: string;
  submissionId: string;
  timestamp: string;
  impressions: number;
  likes: number;
  replies: number;
  reposts: number;
  bookmarks: number;
}

export interface Submission {
  id: string;
  campaignId: string;
  campaignTitle: string;
  creatorId: string;
  creatorUsername: string;
  creatorDisplayName: string;
  creatorAvatar?: string;
  platform: 'X' | 'TELEGRAM' | 'YOUTUBE';
  externalPostId: string;
  url: string;
  contentText?: string;
  submittedAt: string;
  lastSyncedAt: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  metrics: {
    impressions: number;
    likes: number;
    replies: number;
    reposts: number;
    bookmarks: number;
    engagementRate: number;
  };
  snapshots: MetricSnapshot[];
  score: number;
  notes?: string;
}

interface SubmissionRow {
  id: string;
  campaign_id: string;
  campaign_title: string;
  creator_id: string;
  creator_username: string;
  creator_display_name: string;
  creator_avatar: string | null;
  platform: string;
  external_post_id: string;
  url: string;
  content_text: string | null;
  submitted_at: string;
  last_synced_at: string;
  status: string;
  metrics: string;
  snapshots: string;
  score: number;
  notes: string | null;
}

function rowToSubmission(row: SubmissionRow): Submission {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    campaignTitle: row.campaign_title,
    creatorId: row.creator_id,
    creatorUsername: row.creator_username,
    creatorDisplayName: row.creator_display_name,
    creatorAvatar: row.creator_avatar || undefined,
    platform: row.platform as Submission['platform'],
    externalPostId: row.external_post_id,
    url: row.url,
    contentText: row.content_text || undefined,
    submittedAt: row.submitted_at,
    lastSyncedAt: row.last_synced_at,
    status: row.status as Submission['status'],
    metrics: JSON.parse(row.metrics),
    snapshots: JSON.parse(row.snapshots),
    score: row.score,
    notes: row.notes || undefined,
  };
}

export const SubmissionModel = {
  async findAll(campaignId?: string, creatorId?: string): Promise<Submission[]> {
    let queryStr = 'SELECT * FROM submissions WHERE 1=1';
    const params: string[] = [];

    if (campaignId) {
      queryStr += ' AND campaign_id = $' + (params.length + 1);
      params.push(campaignId);
    }
    if (creatorId) {
      queryStr += ' AND creator_id = $' + (params.length + 1);
      params.push(creatorId);
    }

    const rows = await query(queryStr, params) as SubmissionRow[];
    return rows.map(rowToSubmission);
  },

  async findById(id: string): Promise<Submission | null> {
    const row = await queryOne('SELECT * FROM submissions WHERE id = $1', [id]) as SubmissionRow | null;
    return row ? rowToSubmission(row) : null;
  },

  async findByExternalPostId(externalPostId: string, campaignId?: string): Promise<Submission | null> {
    let queryStr = 'SELECT * FROM submissions WHERE external_post_id = $1';
    const params: string[] = [externalPostId];

    if (campaignId) {
      queryStr += ' AND campaign_id = $2';
      params.push(campaignId);
    }

    const row = await queryOne(queryStr, params) as SubmissionRow | null;
    return row ? rowToSubmission(row) : null;
  },

  async create(data: Omit<Submission, 'id'>): Promise<Submission> {
    const id = `sub-${Date.now()}-${uuidv4().slice(0, 8)}`;

    await query(
      `INSERT INTO submissions (
        id, campaign_id, campaign_title, creator_id, creator_username,
        creator_display_name, creator_avatar, platform, external_post_id,
        url, content_text, submitted_at, last_synced_at, status, metrics,
        snapshots, score, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)`,
      [
        id, data.campaignId, data.campaignTitle, data.creatorId, data.creatorUsername,
        data.creatorDisplayName, data.creatorAvatar || null, data.platform,
        data.externalPostId, data.url, data.contentText || null, data.submittedAt,
        data.lastSyncedAt, data.status, JSON.stringify(data.metrics),
        JSON.stringify(data.snapshots), data.score, data.notes || null
      ]
    );

    return (await this.findById(id))!;
  },

  async update(id: string, data: Partial<Submission>): Promise<void> {
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.status !== undefined) { fields.push(`status = $${fields.length + 1}`); values.push(data.status); }
    if (data.metrics !== undefined) { fields.push(`metrics = $${fields.length + 1}`); values.push(JSON.stringify(data.metrics)); }
    if (data.snapshots !== undefined) { fields.push(`snapshots = $${fields.length + 1}`); values.push(JSON.stringify(data.snapshots)); }
    if (data.score !== undefined) { fields.push(`score = $${fields.length + 1}`); values.push(data.score); }
    if (data.lastSyncedAt !== undefined) { fields.push(`last_synced_at = $${fields.length + 1}`); values.push(data.lastSyncedAt); }

    if (fields.length > 0) {
      values.push(id);
      await query(`UPDATE submissions SET ${fields.join(', ')} WHERE id = $${values.length}`, values);
    }
  },

  async deleteAll(): Promise<void> {
    await query('DELETE FROM submissions');
  },
};
