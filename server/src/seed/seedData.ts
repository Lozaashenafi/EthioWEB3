import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

export async function seedDatabase(): Promise<void> {
  const userCountResult = await pool.query('SELECT COUNT(*)::int as cnt FROM users');
  if (userCountResult.rows[0].cnt > 0) {
    console.log('📦 Database already seeded, skipping...');
    return;
  }

  console.log('🌱 Seeding database with initial data...');

  const defaultPasswordHash = bcrypt.hashSync('demo1234', 10);

  // --- USERS ---
  const users = [
    { id: 'user-admin', email: 'admin@ethioweb3.org', name: 'Alazar Kebede', role: 'ADMIN', category: 'Community Leader', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', createdAt: '2026-01-10T09:00:00Z' },
    { id: 'user-creator-1', email: 'dawit@creator.ethioweb3.org', name: 'Dawit Alemu', role: 'CREATOR', category: 'Creator', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', createdAt: '2026-01-15T11:20:00Z' },
    { id: 'user-creator-2', email: 'selam@creator.ethioweb3.org', name: 'Selam Haile', role: 'CREATOR', category: 'Creator', avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', createdAt: '2026-01-18T14:30:00Z' },
    { id: 'user-creator-pending', email: 'amen@applicant.com', name: 'Amen Worku', role: 'USER', category: 'Creator', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', createdAt: '2026-02-01T10:00:00Z' },
    { id: 'user-project-sheba', email: 'contact@shebafi.org', name: 'ShebaFi Team', role: 'PROJECT', category: 'Project / Company', avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80', createdAt: '2026-01-12T08:00:00Z' },
    { id: 'user-project-arbitrum', email: 'africa@arbitrum.foundation', name: 'Arbitrum Africa', role: 'PROJECT', category: 'Project / Company', avatarUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=150&auto=format&fit=crop&q=80', createdAt: '2026-01-10T08:00:00Z' },
  ];

  for (const u of users) {
    await pool.query(
      `INSERT INTO users (id, email, name, password_hash, role, category, avatar_url, created_at, is_email_verified)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1)`,
      [u.id, u.email, u.name, defaultPasswordHash, u.role, u.category, u.avatarUrl, u.createdAt]
    );
  }

  // --- CREATOR PROFILES ---
  const creators = [
    { id: 'creator-dawit', userId: 'user-creator-1', displayName: 'Dawit Alemu', username: 'dawit_web3', bio: 'Web3 educator and Amharic crypto content creator.', country: 'Ethiopia', city: 'Addis Ababa', languages: ['Amharic', 'English'], platforms: { x: 'https://x.com/dawit_web3', telegram: 'https://t.me/ethio_crypto_insights', youtube: 'https://youtube.com/@DawitWeb3' }, audience: { followerCount: 14500, avgViews: 4800, engagementRate: 6.8, topLocations: ['Ethiopia', 'Kenya', 'United States'] }, categories: ['Web3 education', 'DeFi', 'Crypto'], experience: { yearsInWeb3: 3, previousCampaigns: 'Arbitrum Africa Launch', portfolioLinks: ['https://x.com/dawit_web3/status/1789012345'], sampleContentUrl: 'https://x.com/dawit_web3/status/1789012345' }, status: 'APPROVED', appliedAt: '2026-01-15T11:30:00Z', reviewedAt: '2026-01-16T10:00:00Z' },
    { id: 'creator-selam', userId: 'user-creator-2', displayName: 'Selam Haile', username: 'selam_crypto', bio: 'DeFi researcher and tech writer decoding L2 rollups.', country: 'Ethiopia', city: 'Addis Ababa', languages: ['Amharic', 'English', 'Oromo'], platforms: { x: 'https://x.com/selam_crypto', telegram: 'https://t.me/selam_defi' }, audience: { followerCount: 22800, avgViews: 8200, engagementRate: 7.4, topLocations: ['Ethiopia', 'UAE', 'United Kingdom'] }, categories: ['DeFi', 'Finance', 'Technology'], experience: { yearsInWeb3: 4, previousCampaigns: 'ShebaFi Alpha sprint', portfolioLinks: ['https://x.com/selam_crypto/status/1789098765'] }, status: 'APPROVED', appliedAt: '2026-01-18T14:40:00Z', reviewedAt: '2026-01-19T09:00:00Z' },
    { id: 'creator-amen-pending', userId: 'user-creator-pending', displayName: 'Amen Worku', username: 'amen_web3', bio: 'Community builder and developer advocate based in Hawassa.', country: 'Ethiopia', city: 'Hawassa', languages: ['Amharic', 'English', 'Sidamo'], platforms: { x: 'https://x.com/amen_web3', telegram: 'https://t.me/hawassa_blockchain' }, audience: { followerCount: 4200, avgViews: 1900, engagementRate: 5.2, topLocations: ['Ethiopia'] }, categories: ['Blockchain development', 'Web3 education'], experience: { yearsInWeb3: 2, previousCampaigns: 'Hawassa University Techfest', portfolioLinks: ['https://github.com/amen-worku'] }, status: 'PENDING', appliedAt: '2026-02-01T10:15:00Z' },
  ];

  for (const c of creators) {
    await pool.query(
      `INSERT INTO creator_profiles (id, user_id, display_name, username, bio, country, city, languages, platforms, audience, categories, experience, status, applied_at, reviewed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [c.id, c.userId, c.displayName, c.username, c.bio, c.country, c.city, JSON.stringify(c.languages), JSON.stringify(c.platforms), JSON.stringify(c.audience), JSON.stringify(c.categories), JSON.stringify(c.experience), c.status, c.appliedAt, c.reviewedAt || null]
    );
  }

  // --- PROJECTS ---
  const projects = [
    { id: 'project-sheba', userId: 'user-project-sheba', name: 'ShebaFi', logoUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80', website: 'https://shebafi.network', description: 'Decentralized Ethiopian Birr-backed stablecoin.', category: 'DeFi & Payments', ecosystem: 'Ethereum / Arbitrum', contactEmail: 'contact@shebafi.org', socialLinks: { x: 'https://x.com/shebafi', telegram: 'https://t.me/shebafi_announcements' }, representativeName: 'Kalkidan Teshale', status: 'APPROVED', appliedAt: '2026-01-12T08:30:00Z', reviewedAt: '2026-01-13T12:00:00Z' },
    { id: 'project-arbitrum', userId: 'user-project-arbitrum', name: 'Arbitrum Africa Initiative', logoUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=150&auto=format&fit=crop&q=80', website: 'https://arbitrum.io', description: 'Empowering East African developers on Ethereum L2.', category: 'Layer 2 / Scaling', ecosystem: 'Arbitrum Nitro', contactEmail: 'africa@arbitrum.foundation', socialLinks: { x: 'https://x.com/arbitrum_africa' }, representativeName: 'Samuel Mensah', status: 'APPROVED', appliedAt: '2026-01-10T10:00:00Z', reviewedAt: '2026-01-11T14:00:00Z' },
  ];

  for (const p of projects) {
    await pool.query(
      `INSERT INTO projects (id, user_id, name, logo_url, website, description, category, ecosystem, contact_email, social_links, representative_name, status, applied_at, reviewed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [p.id, p.userId, p.name, p.logoUrl, p.website, p.description, p.category, p.ecosystem, p.contactEmail, JSON.stringify(p.socialLinks), p.representativeName, p.status, p.appliedAt, p.reviewedAt || null]
    );
  }

  // --- CAMPAIGNS ---
  const campaigns = [
    { id: 'campaign-arbitrum-builders', title: 'Arbitrum Africa Builders & Creators Campaign', slug: 'arbitrum-africa-builders', shortDescription: 'Educate Ethiopian developers about Ethereum L2 rollups.', description: 'Create content about Arbitrum L2 benefits.', coverImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=80', projectId: 'project-arbitrum', projectName: 'Arbitrum Africa Initiative', projectLogo: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=150&auto=format&fit=crop&q=80', status: 'ACTIVE', startDate: '2026-02-01T00:00:00Z', endDate: '2026-03-31T23:59:59Z', rewardPool: { total: 3500, currency: 'USDC', rewardStructure: 'Top 10 split 70%.' }, maxParticipants: 50, targetPlatforms: ['X'], contentRequirements: ['Original X post about Arbitrum L2.'], requiredHashtags: ['#ArbitrumAfrica', '#EthioWeb3', '#Layer2'], requiredMentions: ['@Arbitrum_Africa', '@EthioWeb3'], campaignRules: ['Original content only.'], createdAt: '2026-01-28T14:00:00Z', updatedAt: '2026-02-01T00:00:00Z' },
    { id: 'campaign-shebafi-sprint', title: 'ShebaFi Birr-to-Stablecoin Awareness Sprint', slug: 'shebafi-stablecoin-sprint', shortDescription: 'Demystify local currency on-ramps for Ethiopian freelancers.', description: 'Help community understand DeFi cross-border payments.', coverImage: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=800&auto=format&fit=crop&q=80', projectId: 'project-sheba', projectName: 'ShebaFi', projectLogo: 'https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80', status: 'ACTIVE', startDate: '2026-02-10T00:00:00Z', endDate: '2026-03-25T23:59:59Z', rewardPool: { total: 2000, currency: 'USDT', rewardStructure: 'Rank 1: 500 USDT.' }, maxParticipants: 40, targetPlatforms: ['X'], contentRequirements: ['Educational breakdown in Amharic or English.'], requiredHashtags: ['#ShebaFi', '#EthioCrypto', '#AddisWeb3'], requiredMentions: ['@ShebaFi'], campaignRules: ['No investment advice.'], createdAt: '2026-02-05T12:00:00Z', updatedAt: '2026-02-10T00:00:00Z' },
    { id: 'campaign-polygon-odyssey', title: 'Polygon Addis Developer Odyssey 2026', slug: 'polygon-addis-dev-odyssey', shortDescription: 'Smart contract tutorials and dApp showcases on Polygon zkEVM.', description: 'Share coding walkthroughs on Polygon.', coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80', projectId: 'project-arbitrum', projectName: 'Polygon Addis Guild', projectLogo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80', status: 'APPROVED', startDate: '2026-03-15T00:00:00Z', endDate: '2026-04-30T23:59:59Z', rewardPool: { total: 1800, currency: 'USDC', rewardStructure: 'Top 5 guides.' }, maxParticipants: 30, targetPlatforms: ['X'], contentRequirements: ['Technical post with GitHub link.'], requiredHashtags: ['#PolygonAddis', '#EthioDevs', '#zkEVM'], requiredMentions: ['@PolygonAddis'], campaignRules: ['Original code required.'], createdAt: '2026-02-20T10:00:00Z', updatedAt: '2026-02-25T11:00:00Z' },
  ];

  for (const c of campaigns) {
    await pool.query(
      `INSERT INTO campaigns (id, title, slug, short_description, description, cover_image, project_id, project_name, project_logo, status, start_date, end_date, reward_pool, max_participants, target_platforms, content_requirements, required_hashtags, required_mentions, campaign_rules, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)`,
      [c.id, c.title, c.slug, c.shortDescription, c.description, c.coverImage, c.projectId, c.projectName, c.projectLogo, c.status, c.startDate, c.endDate, JSON.stringify(c.rewardPool), c.maxParticipants, JSON.stringify(c.targetPlatforms), JSON.stringify(c.contentRequirements), JSON.stringify(c.requiredHashtags), JSON.stringify(c.requiredMentions), JSON.stringify(c.campaignRules), c.createdAt, c.updatedAt]
    );
  }

  // --- PARTICIPANTS ---
  const participants = [
    { id: 'part-dawit-arbitrum', campaignId: 'campaign-arbitrum-builders', creatorId: 'creator-dawit', creatorName: 'Dawit Alemu', creatorUsername: 'dawit_web3', creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', joinedAt: '2026-02-02T08:00:00Z', status: 'ACTIVE', totalPosts: 2, totalImpressions: 11400, totalEngagements: 890, score: 1840, rank: 1 },
    { id: 'part-selam-arbitrum', campaignId: 'campaign-arbitrum-builders', creatorId: 'creator-selam', creatorName: 'Selam Haile', creatorUsername: 'selam_crypto', creatorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', joinedAt: '2026-02-03T11:30:00Z', status: 'ACTIVE', totalPosts: 1, totalImpressions: 8900, totalEngagements: 670, score: 1420, rank: 2 },
    { id: 'part-dawit-sheba', campaignId: 'campaign-shebafi-sprint', creatorId: 'creator-dawit', creatorName: 'Dawit Alemu', creatorUsername: 'dawit_web3', creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', joinedAt: '2026-02-11T09:00:00Z', status: 'ACTIVE', totalPosts: 1, totalImpressions: 4600, totalEngagements: 380, score: 790, rank: 1 },
  ];

  for (const p of participants) {
    await pool.query(
      `INSERT INTO campaign_participants (id, campaign_id, creator_id, creator_name, creator_username, creator_avatar, joined_at, status, total_posts, total_impressions, total_engagements, score, rank)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [p.id, p.campaignId, p.creatorId, p.creatorName, p.creatorUsername, p.creatorAvatar, p.joinedAt, p.status, p.totalPosts, p.totalImpressions, p.totalEngagements, p.score, p.rank]
    );
  }

  // --- SUBMISSIONS ---
  const submissions = [
    { id: 'sub-1', campaignId: 'campaign-arbitrum-builders', campaignTitle: 'Arbitrum Africa Builders & Creators Campaign', creatorId: 'creator-dawit', creatorUsername: 'dawit_web3', creatorDisplayName: 'Dawit Alemu', creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', platform: 'X', externalPostId: '1892300100234567890', url: 'https://x.com/dawit_web3/status/1892300100234567890', contentText: 'Why Ethereum L2 rollups are a game-changer for Ethiopian builders.', submittedAt: '2026-02-04T10:30:00Z', lastSyncedAt: '2026-03-01T15:00:00Z', status: 'VERIFIED', metrics: { impressions: 6800, likes: 245, replies: 42, reposts: 78, bookmarks: 35, engagementRate: 5.88 }, snapshots: [], score: 1118 },
    { id: 'sub-2', campaignId: 'campaign-arbitrum-builders', campaignTitle: 'Arbitrum Africa Builders & Creators Campaign', creatorId: 'creator-selam', creatorUsername: 'selam_crypto', creatorDisplayName: 'Selam Haile', creatorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', platform: 'X', externalPostId: '1892400500123456789', url: 'https://x.com/selam_crypto/status/1892400500123456789', contentText: 'Cross-border settlements using stablecoins on Arbitrum.', submittedAt: '2026-02-06T14:15:00Z', lastSyncedAt: '2026-03-01T15:00:00Z', status: 'VERIFIED', metrics: { impressions: 8900, likes: 310, replies: 54, reposts: 95, bookmarks: 48, engagementRate: 5.69 }, snapshots: [], score: 1420 },
    { id: 'sub-3', campaignId: 'campaign-arbitrum-builders', campaignTitle: 'Arbitrum Africa Builders & Creators Campaign', creatorId: 'creator-dawit', creatorUsername: 'dawit_web3', creatorDisplayName: 'Dawit Alemu', creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', platform: 'X', externalPostId: '1893100200987654321', url: 'https://x.com/dawit_web3/status/1893100200987654321', contentText: 'Testing smart contracts on Arbitrum Sepolia testnet.', submittedAt: '2026-02-14T09:40:00Z', lastSyncedAt: '2026-03-01T15:00:00Z', status: 'VERIFIED', metrics: { impressions: 4600, likes: 180, replies: 28, reposts: 46, bookmarks: 29, engagementRate: 6.15 }, snapshots: [], score: 722 },
  ];

  for (const s of submissions) {
    await pool.query(
      `INSERT INTO submissions (id, campaign_id, campaign_title, creator_id, creator_username, creator_display_name, creator_avatar, platform, external_post_id, url, content_text, submitted_at, last_synced_at, status, metrics, snapshots, score)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
      [s.id, s.campaignId, s.campaignTitle, s.creatorId, s.creatorUsername, s.creatorDisplayName, s.creatorAvatar, s.platform, s.externalPostId, s.url, s.contentText, s.submittedAt, s.lastSyncedAt, s.status, JSON.stringify(s.metrics), JSON.stringify(s.snapshots), s.score]
    );
  }

  // --- REWARDS ---
  const rewards = [
    { id: 'rew-1', campaignId: 'campaign-arbitrum-builders', campaignTitle: 'Arbitrum Africa Builders & Creators Campaign', creatorId: 'creator-dawit', creatorName: 'Dawit Alemu', creatorUsername: 'dawit_web3', amount: 650, currency: 'USDC', rank: 1, status: 'APPROVED', createdAt: '2026-02-28T12:00:00Z' },
    { id: 'rew-2', campaignId: 'campaign-arbitrum-builders', campaignTitle: 'Arbitrum Africa Builders & Creators Campaign', creatorId: 'creator-selam', creatorName: 'Selam Haile', creatorUsername: 'selam_crypto', amount: 450, currency: 'USDC', rank: 2, status: 'APPROVED', createdAt: '2026-02-28T12:00:00Z' },
  ];

  for (const r of rewards) {
    await pool.query(
      `INSERT INTO rewards (id, campaign_id, campaign_title, creator_id, creator_name, creator_username, amount, currency, rank, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [r.id, r.campaignId, r.campaignTitle, r.creatorId, r.creatorName, r.creatorUsername, r.amount, r.currency, r.rank, r.status, r.createdAt]
    );
  }

  // --- NOTIFICATIONS ---
  const notifications = [
    { id: 'notif-1', userId: 'user-admin', title: 'New Creator Application', message: 'Amen Worku submitted an application.', type: 'warning', createdAt: '2026-02-01T10:15:00Z' },
    { id: 'notif-2', userId: 'user-creator-1', title: 'Creator Application Approved! 🎉', message: 'Congratulations! You are now a verified creator.', type: 'success', createdAt: '2026-01-16T10:00:00Z' },
    { id: 'notif-3', userId: 'user-creator-1', title: 'Campaign Submission Verified', message: 'Your submission to Arbitrum Africa Builders has been verified.', type: 'success', createdAt: '2026-02-04T12:00:00Z' },
  ];

  for (const n of notifications) {
    await pool.query(
      `INSERT INTO notifications (id, user_id, title, message, type, read, created_at)
       VALUES ($1, $2, $3, $4, $5, 0, $6)`,
      [n.id, n.userId, n.title, n.message, n.type, n.createdAt]
    );
  }

  console.log('✅ Database seeded successfully');
}
