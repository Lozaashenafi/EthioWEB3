import { query, queryOne } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export interface Reward {
  id: string;
  campaignId: string;
  campaignTitle: string;
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  amount: number;
  currency: string;
  rank?: number;
  status: 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';
  createdAt: string;
  paidAt?: string;
  txReference?: string;
}

interface RewardRow {
  id: string;
  campaign_id: string;
  campaign_title: string;
  creator_id: string;
  creator_name: string;
  creator_username: string;
  amount: number;
  currency: string;
  rank: number | null;
  status: string;
  created_at: string;
  paid_at: string | null;
  tx_reference: string | null;
}

function rowToReward(row: RewardRow): Reward {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    campaignTitle: row.campaign_title,
    creatorId: row.creator_id,
    creatorName: row.creator_name,
    creatorUsername: row.creator_username,
    amount: row.amount,
    currency: row.currency,
    rank: row.rank || undefined,
    status: row.status as Reward['status'],
    createdAt: row.created_at,
    paidAt: row.paid_at || undefined,
    txReference: row.tx_reference || undefined,
  };
}

export const RewardModel = {
  async findAll(creatorId?: string): Promise<Reward[]> {
    let queryStr = 'SELECT * FROM rewards';
    const params: string[] = [];

    if (creatorId) {
      queryStr += ' WHERE creator_id = $1';
      params.push(creatorId);
    }

    const rows = await query(queryStr, params) as RewardRow[];
    return rows.map(rowToReward);
  },

  async findById(id: string): Promise<Reward | null> {
    const row = await queryOne('SELECT * FROM rewards WHERE id = $1', [id]) as RewardRow | null;
    return row ? rowToReward(row) : null;
  },

  async create(data: Omit<Reward, 'id' | 'createdAt'>): Promise<Reward> {
    const id = `rew-${Date.now()}-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();

    await query(
      `INSERT INTO rewards (
        id, campaign_id, campaign_title, creator_id, creator_name,
        creator_username, amount, currency, rank, status, created_at,
        paid_at, tx_reference
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [
        id, data.campaignId, data.campaignTitle, data.creatorId, data.creatorName,
        data.creatorUsername, data.amount, data.currency, data.rank || null,
        data.status, now, data.paidAt || null, data.txReference || null
      ]
    );

    return (await this.findById(id))!;
  },

  async updateStatus(id: string, status: string, txReference?: string): Promise<void> {
    const now = new Date().toISOString();
    await query(
      `UPDATE rewards
       SET status = $1, paid_at = CASE WHEN $1 = 'PAID' THEN $2 ELSE paid_at END, tx_reference = COALESCE($3, tx_reference)
       WHERE id = $4`,
      [status, now, txReference || null, id]
    );
  },

  async deleteAll(): Promise<void> {
    await query('DELETE FROM rewards');
  },
};
