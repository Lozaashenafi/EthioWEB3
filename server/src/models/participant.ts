import { query, queryOne } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export interface CampaignParticipant {
  id: string;
  campaignId: string;
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar?: string;
  joinedAt: string;
  status: 'JOINED' | 'ACTIVE' | 'COMPLETED' | 'DISQUALIFIED';
  totalPosts: number;
  totalImpressions: number;
  totalEngagements: number;
  score: number;
  rank?: number;
}

interface ParticipantRow {
  id: string;
  campaign_id: string;
  creator_id: string;
  creator_name: string;
  creator_username: string;
  creator_avatar: string | null;
  joined_at: string;
  status: string;
  total_posts: number;
  total_impressions: number;
  total_engagements: number;
  score: number;
  rank: number | null;
}

function rowToParticipant(row: ParticipantRow): CampaignParticipant {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    creatorId: row.creator_id,
    creatorName: row.creator_name,
    creatorUsername: row.creator_username,
    creatorAvatar: row.creator_avatar || undefined,
    joinedAt: row.joined_at,
    status: row.status as CampaignParticipant['status'],
    totalPosts: row.total_posts,
    totalImpressions: row.total_impressions,
    totalEngagements: row.total_engagements,
    score: row.score,
    rank: row.rank || undefined,
  };
}

export const ParticipantModel = {
  async findAll(campaignId?: string): Promise<CampaignParticipant[]> {
    let rows: ParticipantRow[];
    if (campaignId) {
      rows = await query('SELECT * FROM campaign_participants WHERE campaign_id = $1', [campaignId]) as ParticipantRow[];
    } else {
      rows = await query<ParticipantRow>('SELECT * FROM campaign_participants');
    }
    return rows.map(rowToParticipant);
  },

  async findById(id: string): Promise<CampaignParticipant | null> {
    const row = await queryOne('SELECT * FROM campaign_participants WHERE id = $1', [id]) as ParticipantRow | null;
    return row ? rowToParticipant(row) : null;
  },

  async findByCampaignAndCreator(campaignId: string, creatorId: string): Promise<CampaignParticipant | null> {
    const row = await queryOne(
      'SELECT * FROM campaign_participants WHERE campaign_id = $1 AND creator_id = $2',
      [campaignId, creatorId]
    ) as ParticipantRow | null;
    return row ? rowToParticipant(row) : null;
  },

  async create(data: {
    campaignId: string;
    creatorId: string;
    creatorName: string;
    creatorUsername: string;
    creatorAvatar?: string;
  }): Promise<CampaignParticipant> {
    const id = `part-${Date.now()}-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();

    const countResult = await queryOne(
      'SELECT COUNT(*)::int as cnt FROM campaign_participants WHERE campaign_id = $1',
      [data.campaignId]
    ) as { cnt: number } | null;

    await query(
      `INSERT INTO campaign_participants (
        id, campaign_id, creator_id, creator_name, creator_username,
        creator_avatar, joined_at, status, total_posts, total_impressions,
        total_engagements, score, rank
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE', 0, 0, 0, 0, $8)`,
      [
        id, data.campaignId, data.creatorId, data.creatorName, data.creatorUsername,
        data.creatorAvatar || null, now, (countResult?.cnt || 0) + 1
      ]
    );

    return (await this.findById(id))!;
  },

  async updateStats(id: string, stats: {
    totalPosts: number;
    totalImpressions: number;
    totalEngagements: number;
    score: number;
  }): Promise<void> {
    await query(
      `UPDATE campaign_participants
       SET total_posts = $1, total_impressions = $2, total_engagements = $3, score = $4
       WHERE id = $5`,
      [stats.totalPosts, stats.totalImpressions, stats.totalEngagements, stats.score, id]
    );
  },

  async updateRank(id: string, rank: number): Promise<void> {
    await query('UPDATE campaign_participants SET rank = $1 WHERE id = $2', [rank, id]);
  },

  async deleteAll(): Promise<void> {
    await query('DELETE FROM campaign_participants');
  },
};
