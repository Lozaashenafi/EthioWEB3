import { query, queryOne } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export interface CreatorProfile {
  id: string;
  userId: string;
  displayName: string;
  username: string;
  bio: string;
  country: string;
  city: string;
  languages: string[];
  platforms: {
    x?: string;
    telegram?: string;
    youtube?: string;
    tiktok?: string;
    linkedin?: string;
    facebook?: string;
  };
  audience: {
    followerCount: number;
    avgViews: number;
    engagementRate: number;
    topLocations: string[];
  };
  categories: string[];
  experience: {
    yearsInWeb3: number;
    previousCampaigns: string;
    portfolioLinks: string[];
    sampleContentUrl?: string;
  };
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  appliedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

interface CreatorRow {
  id: string;
  user_id: string;
  display_name: string;
  username: string;
  bio: string;
  country: string;
  city: string;
  languages: string;
  platforms: string;
  audience: string;
  categories: string;
  experience: string;
  status: string;
  applied_at: string;
  reviewed_at: string | null;
  review_notes: string | null;
}

function rowToCreator(row: CreatorRow): CreatorProfile {
  return {
    id: row.id,
    userId: row.user_id,
    displayName: row.display_name,
    username: row.username,
    bio: row.bio,
    country: row.country,
    city: row.city,
    languages: JSON.parse(row.languages),
    platforms: JSON.parse(row.platforms),
    audience: JSON.parse(row.audience),
    categories: JSON.parse(row.categories),
    experience: JSON.parse(row.experience),
    status: row.status as CreatorProfile['status'],
    appliedAt: row.applied_at,
    reviewedAt: row.reviewed_at || undefined,
    reviewNotes: row.review_notes || undefined,
  };
}

export const CreatorModel = {
  async findAll(): Promise<CreatorProfile[]> {
    const rows = await query<CreatorRow>('SELECT * FROM creator_profiles');
    return rows.map(rowToCreator);
  },

  async findApproved(): Promise<CreatorProfile[]> {
    const rows = await query('SELECT * FROM creator_profiles WHERE status = $1', ['APPROVED']) as CreatorRow[];
    return rows.map(rowToCreator);
  },

  async findById(id: string): Promise<CreatorProfile | null> {
    const row = await queryOne('SELECT * FROM creator_profiles WHERE id = $1', [id]) as CreatorRow | null;
    return row ? rowToCreator(row) : null;
  },

  async findByUserId(userId: string): Promise<CreatorProfile | null> {
    const row = await queryOne('SELECT * FROM creator_profiles WHERE user_id = $1', [userId]) as CreatorRow | null;
    return row ? rowToCreator(row) : null;
  },

  async findByUsername(username: string): Promise<CreatorProfile | null> {
    const row = await queryOne('SELECT * FROM creator_profiles WHERE LOWER(username) = LOWER($1)', [username]) as CreatorRow | null;
    return row ? rowToCreator(row) : null;
  },

  async create(data: Omit<CreatorProfile, 'id' | 'status' | 'appliedAt'>): Promise<CreatorProfile> {
    const id = `creator-${Date.now()}-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();

    await query(
      `INSERT INTO creator_profiles (
        id, user_id, display_name, username, bio, country, city,
        languages, platforms, audience, categories, experience,
        status, applied_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'PENDING', $13)`,
      [
        id, data.userId, data.displayName, data.username, data.bio,
        data.country, data.city, JSON.stringify(data.languages),
        JSON.stringify(data.platforms), JSON.stringify(data.audience),
        JSON.stringify(data.categories), JSON.stringify(data.experience), now
      ]
    );

    return (await this.findById(id))!;
  },

  async updateStatus(id: string, status: string, reviewNotes?: string): Promise<void> {
    const now = new Date().toISOString();
    await query(
      `UPDATE creator_profiles SET status = $1, reviewed_at = $2, review_notes = $3 WHERE id = $4`,
      [status, now, reviewNotes || null, id]
    );
  },

  async deleteAll(): Promise<void> {
    await query('DELETE FROM creator_profiles');
  },
};
