import { query, queryOne } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'campaign' | 'reward';
  read: boolean;
  createdAt: string;
  link?: string;
}

interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: number;
  created_at: string;
  link: string | null;
}

function rowToNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type as Notification['type'],
    read: !!row.read,
    createdAt: row.created_at,
    link: row.link || undefined,
  };
}

export const NotificationModel = {
  async findByUserId(userId: string): Promise<Notification[]> {
    const rows = await query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [userId]) as NotificationRow[];
    return rows.map(rowToNotification);
  },

  async findById(id: string): Promise<Notification | null> {
    const row = await queryOne('SELECT * FROM notifications WHERE id = $1', [id]) as NotificationRow | null;
    return row ? rowToNotification(row) : null;
  },

  async create(data: { userId: string; title: string; message: string; type: string; link?: string }): Promise<Notification> {
    const id = `notif-${Date.now()}-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();

    await query(
      `INSERT INTO notifications (id, user_id, title, message, type, read, created_at, link)
       VALUES ($1, $2, $3, $4, $5, 0, $6, $7)`,
      [id, data.userId, data.title, data.message, data.type, now, data.link || null]
    );

    return (await this.findById(id))!;
  },

  async markRead(id: string): Promise<void> {
    await query('UPDATE notifications SET read = 1 WHERE id = $1', [id]);
  },

  async deleteAll(): Promise<void> {
    await query('DELETE FROM notifications');
  },
};
