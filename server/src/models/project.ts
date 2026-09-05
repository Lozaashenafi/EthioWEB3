import { query, queryOne } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export interface Project {
  id: string;
  userId: string;
  name: string;
  logoUrl: string;
  website: string;
  description: string;
  category: string;
  ecosystem: string;
  contactEmail: string;
  socialLinks: {
    x?: string;
    telegram?: string;
    discord?: string;
    github?: string;
  };
  representativeName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  appliedAt: string;
  reviewedAt?: string;
}

interface ProjectRow {
  id: string;
  user_id: string;
  name: string;
  logo_url: string;
  website: string;
  description: string;
  category: string;
  ecosystem: string;
  contact_email: string;
  social_links: string;
  representative_name: string;
  status: string;
  applied_at: string;
  reviewed_at: string | null;
}

function rowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    logoUrl: row.logo_url,
    website: row.website,
    description: row.description,
    category: row.category,
    ecosystem: row.ecosystem,
    contactEmail: row.contact_email,
    socialLinks: JSON.parse(row.social_links),
    representativeName: row.representative_name,
    status: row.status as Project['status'],
    appliedAt: row.applied_at,
    reviewedAt: row.reviewed_at || undefined,
  };
}

export const ProjectModel = {
  async findAll(): Promise<Project[]> {
    const rows = await query<ProjectRow>('SELECT * FROM projects');
    return rows.map(rowToProject);
  },

  async findById(id: string): Promise<Project | null> {
    const row = await queryOne('SELECT * FROM projects WHERE id = $1', [id]) as ProjectRow | null;
    return row ? rowToProject(row) : null;
  },

  async findByUserId(userId: string): Promise<Project | null> {
    const row = await queryOne('SELECT * FROM projects WHERE user_id = $1', [userId]) as ProjectRow | null;
    return row ? rowToProject(row) : null;
  },

  async create(data: Omit<Project, 'id' | 'status' | 'appliedAt'>): Promise<Project> {
    const id = `project-${Date.now()}-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();

    await query(
      `INSERT INTO projects (
        id, user_id, name, logo_url, website, description, category,
        ecosystem, contact_email, social_links, representative_name,
        status, applied_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'PENDING', $12)`,
      [
        id, data.userId, data.name, data.logoUrl, data.website,
        data.description, data.category, data.ecosystem, data.contactEmail,
        JSON.stringify(data.socialLinks), data.representativeName, now
      ]
    );

    return (await this.findById(id))!;
  },

  async updateStatus(id: string, status: string): Promise<void> {
    const now = new Date().toISOString();
    await query('UPDATE projects SET status = $1, reviewed_at = $2 WHERE id = $3', [status, now, id]);
  },

  async deleteAll(): Promise<void> {
    await query('DELETE FROM projects');
  },
};
