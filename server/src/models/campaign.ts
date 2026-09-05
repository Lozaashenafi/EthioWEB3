import { query, queryOne } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  coverImage: string;
  projectId: string;
  projectName: string;
  projectLogo: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  rewardPool: {
    total: number;
    currency: string;
    rewardStructure: string;
  };
  maxParticipants: number;
  targetPlatforms: ('X' | 'TELEGRAM' | 'YOUTUBE' | 'TIKTOK')[];
  contentRequirements: string[];
  requiredHashtags: string[];
  requiredMentions: string[];
  campaignRules: string[];
  createdAt: string;
  updatedAt: string;
}

interface CampaignRow {
  id: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  cover_image: string;
  project_id: string;
  project_name: string;
  project_logo: string;
  status: string;
  start_date: string;
  end_date: string;
  reward_pool: string;
  max_participants: number;
  target_platforms: string;
  content_requirements: string;
  required_hashtags: string;
  required_mentions: string;
  campaign_rules: string;
  created_at: string;
  updated_at: string;
}

function rowToCampaign(row: CampaignRow): Campaign {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    shortDescription: row.short_description,
    description: row.description,
    coverImage: row.cover_image,
    projectId: row.project_id,
    projectName: row.project_name,
    projectLogo: row.project_logo,
    status: row.status as Campaign['status'],
    startDate: row.start_date,
    endDate: row.end_date,
    rewardPool: JSON.parse(row.reward_pool),
    maxParticipants: row.max_participants,
    targetPlatforms: JSON.parse(row.target_platforms),
    contentRequirements: JSON.parse(row.content_requirements),
    requiredHashtags: JSON.parse(row.required_hashtags),
    requiredMentions: JSON.parse(row.required_mentions),
    campaignRules: JSON.parse(row.campaign_rules),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const CampaignModel = {
  async findAll(): Promise<Campaign[]> {
    const rows = await query<CampaignRow>('SELECT * FROM campaigns');
    return rows.map(rowToCampaign);
  },

  async findById(id: string): Promise<Campaign | null> {
    const row = await queryOne('SELECT * FROM campaigns WHERE id = $1', [id]) as CampaignRow | null;
    return row ? rowToCampaign(row) : null;
  },

  async findBySlug(slug: string): Promise<Campaign | null> {
    const row = await queryOne('SELECT * FROM campaigns WHERE slug = $1', [slug]) as CampaignRow | null;
    return row ? rowToCampaign(row) : null;
  },

  async findByIdOrSlug(identifier: string): Promise<Campaign | null> {
    const row = await queryOne('SELECT * FROM campaigns WHERE id = $1 OR slug = $1', [identifier]) as CampaignRow | null;
    return row ? rowToCampaign(row) : null;
  },

  async create(data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'> & { status?: string }): Promise<Campaign> {
    const id = `campaign-${Date.now()}-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();

    await query(
      `INSERT INTO campaigns (
        id, title, slug, short_description, description, cover_image,
        project_id, project_name, project_logo, status, start_date, end_date,
        reward_pool, max_participants, target_platforms, content_requirements,
        required_hashtags, required_mentions, campaign_rules, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
      [
        id, data.title, data.slug, data.shortDescription, data.description,
        data.coverImage, data.projectId, data.projectName, data.projectLogo,
        data.status || 'PENDING_REVIEW', data.startDate, data.endDate,
        JSON.stringify(data.rewardPool), data.maxParticipants,
        JSON.stringify(data.targetPlatforms), JSON.stringify(data.contentRequirements),
        JSON.stringify(data.requiredHashtags), JSON.stringify(data.requiredMentions),
        JSON.stringify(data.campaignRules), now, now
      ]
    );

    return (await this.findById(id))!;
  },

  async updateStatus(id: string, status: string): Promise<void> {
    const now = new Date().toISOString();
    await query('UPDATE campaigns SET status = $1, updated_at = $2 WHERE id = $3', [status, now, id]);
  },

  async deleteAll(): Promise<void> {
    await query('DELETE FROM campaigns');
  },
};
