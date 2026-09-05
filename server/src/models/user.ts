import { query, queryOne } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 10;

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'CREATOR' | 'PROJECT' | 'ADMIN';
  category: string;
  avatarUrl?: string;
  createdAt: string;
  isEmailVerified: boolean;
}

interface UserRow {
  id: string;
  email: string;
  name: string;
  password_hash: string;
  role: string;
  category: string;
  avatar_url: string | null;
  created_at: string;
  is_email_verified: number;
}

function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role as User['role'],
    category: row.category as User['category'],
    avatarUrl: row.avatar_url || undefined,
    createdAt: row.created_at,
    isEmailVerified: !!row.is_email_verified,
  };
}

export const UserModel = {
  async findAll(): Promise<User[]> {
    const rows = await query<UserRow>('SELECT * FROM users');
    return rows.map(rowToUser);
  },

  async findById(id: string): Promise<User | null> {
    const row = await queryOne<UserRow>('SELECT * FROM users WHERE id = $1', [id]);
    return row ? rowToUser(row) : null;
  },

  async findByEmail(email: string): Promise<User | null> {
    const row = await queryOne<UserRow>('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    return row ? rowToUser(row) : null;
  },

  async verifyCredentials(email: string, password: string): Promise<User | null> {
    const row = await queryOne<UserRow>('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
    if (!row) return null;

    const isValid = bcrypt.compareSync(password, row.password_hash);
    if (!isValid) return null;

    return rowToUser(row);
  },

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  },

  async create(data: { name: string; email: string; category: string; role?: string; avatarUrl?: string; password?: string }): Promise<User> {
    const id = `user-${Date.now()}-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();

    const password = data.password || 'demo-password';
    const passwordHash = bcrypt.hashSync(password, BCRYPT_ROUNDS);

    await query(
      `INSERT INTO users (id, email, name, password_hash, role, category, avatar_url, created_at, is_email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1)`,
      [id, data.email.toLowerCase(), data.name, passwordHash, data.role || 'USER', data.category, data.avatarUrl || null, now]
    );

    return (await this.findById(id))!;
  },

  async updateRole(id: string, role: string): Promise<void> {
    await query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
  },

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const hash = await this.hashPassword(newPassword);
    await query('UPDATE users SET password_hash = $1 WHERE id = $2', [hash, id]);
  },

  async deleteAll(): Promise<void> {
    await query('DELETE FROM users');
  },
};
