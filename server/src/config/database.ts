import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : false,
});

export async function query<T = any>(text: string, params?: unknown[]): Promise<T[]> {
  const result = await pool.query(text, params);
  return result.rows as T[];
}

export async function queryOne<T = any>(text: string, params?: unknown[]): Promise<T | null> {
  const result = await pool.query(text, params);
  return (result.rows[0] as T) || null;
}

export async function initializeDatabase(): Promise<void> {
  await pool.query(`
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'USER' CHECK(role IN ('USER', 'CREATOR', 'PROJECT', 'ADMIN')),
      category TEXT NOT NULL,
      avatar_url TEXT,
      created_at TEXT NOT NULL,
      is_email_verified INTEGER NOT NULL DEFAULT 0
    );

    -- Creator profiles table
    CREATE TABLE IF NOT EXISTS creator_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      display_name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      bio TEXT NOT NULL DEFAULT '',
      country TEXT NOT NULL DEFAULT '',
      city TEXT NOT NULL DEFAULT '',
      languages TEXT NOT NULL DEFAULT '[]',
      platforms TEXT NOT NULL DEFAULT '{}',
      audience TEXT NOT NULL DEFAULT '{}',
      categories TEXT NOT NULL DEFAULT '[]',
      experience TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),
      applied_at TEXT NOT NULL,
      reviewed_at TEXT,
      review_notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Projects table
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      logo_url TEXT NOT NULL DEFAULT '',
      website TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      ecosystem TEXT NOT NULL DEFAULT '',
      contact_email TEXT NOT NULL DEFAULT '',
      social_links TEXT NOT NULL DEFAULT '{}',
      representative_name TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED')),
      applied_at TEXT NOT NULL,
      reviewed_at TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Campaigns table
    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      short_description TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      cover_image TEXT NOT NULL DEFAULT '',
      project_id TEXT NOT NULL,
      project_name TEXT NOT NULL DEFAULT '',
      project_logo TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED')),
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      reward_pool TEXT NOT NULL DEFAULT '{}',
      max_participants INTEGER NOT NULL DEFAULT 50,
      target_platforms TEXT NOT NULL DEFAULT '[]',
      content_requirements TEXT NOT NULL DEFAULT '[]',
      required_hashtags TEXT NOT NULL DEFAULT '[]',
      required_mentions TEXT NOT NULL DEFAULT '[]',
      campaign_rules TEXT NOT NULL DEFAULT '[]',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Campaign participants table
    CREATE TABLE IF NOT EXISTS campaign_participants (
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL,
      creator_id TEXT NOT NULL,
      creator_name TEXT NOT NULL DEFAULT '',
      creator_username TEXT NOT NULL DEFAULT '',
      creator_avatar TEXT,
      joined_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK(status IN ('JOINED', 'ACTIVE', 'COMPLETED', 'DISQUALIFIED')),
      total_posts INTEGER NOT NULL DEFAULT 0,
      total_impressions INTEGER NOT NULL DEFAULT 0,
      total_engagements INTEGER NOT NULL DEFAULT 0,
      score REAL NOT NULL DEFAULT 0,
      rank INTEGER,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
      FOREIGN KEY (creator_id) REFERENCES creator_profiles(id) ON DELETE CASCADE,
      UNIQUE(campaign_id, creator_id)
    );

    -- Submissions table
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL,
      campaign_title TEXT NOT NULL DEFAULT '',
      creator_id TEXT NOT NULL,
      creator_username TEXT NOT NULL DEFAULT '',
      creator_display_name TEXT NOT NULL DEFAULT '',
      creator_avatar TEXT,
      platform TEXT NOT NULL DEFAULT 'X',
      external_post_id TEXT NOT NULL,
      url TEXT NOT NULL,
      content_text TEXT,
      submitted_at TEXT NOT NULL,
      last_synced_at TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'VERIFIED', 'REJECTED')),
      metrics TEXT NOT NULL DEFAULT '{}',
      snapshots TEXT NOT NULL DEFAULT '[]',
      score REAL NOT NULL DEFAULT 0,
      notes TEXT,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
      FOREIGN KEY (creator_id) REFERENCES creator_profiles(id) ON DELETE CASCADE
    );

    -- Rewards table
    CREATE TABLE IF NOT EXISTS rewards (
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL,
      campaign_title TEXT NOT NULL DEFAULT '',
      creator_id TEXT NOT NULL,
      creator_name TEXT NOT NULL DEFAULT '',
      creator_username TEXT NOT NULL DEFAULT '',
      amount REAL NOT NULL DEFAULT 0,
      currency TEXT NOT NULL DEFAULT 'USDC',
      rank INTEGER,
      status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'APPROVED', 'PAID', 'CANCELLED')),
      created_at TEXT NOT NULL,
      paid_at TEXT,
      tx_reference TEXT,
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
      FOREIGN KEY (creator_id) REFERENCES creator_profiles(id) ON DELETE CASCADE
    );

    -- Notifications table
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info' CHECK(type IN ('info', 'success', 'warning', 'campaign', 'reward')),
      read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      link TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_creator_profiles_user_id ON creator_profiles(user_id);
    CREATE INDEX IF NOT EXISTS idx_creator_profiles_username ON creator_profiles(username);
    CREATE INDEX IF NOT EXISTS idx_creator_profiles_status ON creator_profiles(status);
    CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
    CREATE INDEX IF NOT EXISTS idx_campaigns_slug ON campaigns(slug);
    CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
    CREATE INDEX IF NOT EXISTS idx_campaign_participants_campaign_id ON campaign_participants(campaign_id);
    CREATE INDEX IF NOT EXISTS idx_campaign_participants_creator_id ON campaign_participants(creator_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_campaign_id ON submissions(campaign_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_creator_id ON submissions(creator_id);
    CREATE INDEX IF NOT EXISTS idx_submissions_external_post_id ON submissions(external_post_id);
    CREATE INDEX IF NOT EXISTS idx_rewards_creator_id ON rewards(creator_id);
    CREATE INDEX IF NOT EXISTS idx_rewards_campaign_id ON rewards(campaign_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
  `);
}

export default pool;
