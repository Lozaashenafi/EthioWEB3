import {
  User,
  CreatorProfile,
  Project,
  Campaign,
  CampaignParticipant,
  Submission,
  Reward,
  Notification,
  CreatorStatus,
  ProjectStatus,
  CampaignStatus,
  RewardStatus,
} from '../types';
import { apiClient } from './api';

// Detect if we can reach the backend
let API_AVAILABLE = true;

async function checkApiHealth(): Promise<boolean> {
  try {
    const res = await fetch('http://localhost:3001/api/health', {
      method: 'GET',
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// --- localStorage helpers ---
const STORAGE_KEYS = {
  USERS: 'ethioweb3_users',
  CURRENT_USER_ID: 'ethioweb3_current_user_id',
  CREATORS: 'ethioweb3_creators',
  PROJECTS: 'ethioweb3_projects',
  CAMPAIGNS: 'ethioweb3_campaigns',
  PARTICIPANTS: 'ethioweb3_participants',
  SUBMISSIONS: 'ethioweb3_submissions',
  REWARDS: 'ethioweb3_rewards',
  NOTIFICATIONS: 'ethioweb3_notifications',
};

function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving ${key} to storage:`, err);
  }
}

// Seed data for localStorage fallback
import {
  SEED_USERS,
  SEED_CREATORS,
  SEED_PROJECTS,
  SEED_CAMPAIGNS,
  SEED_PARTICIPANTS,
  SEED_SUBMISSIONS,
  SEED_REWARDS,
  SEED_NOTIFICATIONS,
} from './seedData';

export class AppStorage {
  private users: User[] = [];
  private currentUserId: string | null = null;
  private creators: CreatorProfile[] = [];
  private projects: Project[] = [];
  private campaigns: Campaign[] = [];
  private participants: CampaignParticipant[] = [];
  private submissions: Submission[] = [];
  private rewards: Reward[] = [];
  private notifications: Notification[] = [];
  private listeners: (() => void)[] = [];
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    API_AVAILABLE = await checkApiHealth();
    console.log(`🔌 API ${API_AVAILABLE ? 'connected' : 'unavailable (using localStorage fallback)'}`);

    if (API_AVAILABLE) {
      await this.loadFromApi();
    } else {
      this.loadFromLocalStorage();
    }

    this.initialized = true;
  }

  private async loadFromApi(): Promise<void> {
    try {
      // Try to restore current user from JWT token
      const token = apiClient.getToken();
      if (token) {
        try {
          const { user } = await apiClient.getMe();
          this.currentUserId = user.id;
          // Update user in local cache
          const existingIdx = this.users.findIndex((u) => u.id === user.id);
          if (existingIdx !== -1) {
            this.users[existingIdx] = user;
          } else {
            this.users.push(user);
          }
        } catch {
          // Token invalid or expired, clear it
          apiClient.removeToken();
          this.currentUserId = getStored<string | null>(STORAGE_KEYS.CURRENT_USER_ID, null);
        }
      } else {
        // No token, use stored userId for demo
        this.currentUserId = getStored<string | null>(STORAGE_KEYS.CURRENT_USER_ID, null);
      }

      const [usersRes, creatorsRes, projectsRes, campaignsRes] = await Promise.all([
        apiClient.getUsers().catch(() => ({ users: [] })),
        apiClient.getCreators(),
        apiClient.getProjects(),
        apiClient.getCampaigns(),
      ]);

      this.users = usersRes.users.length > 0 ? usersRes.users : this.users;
      this.creators = creatorsRes.creators;
      this.projects = projectsRes.projects;
      this.campaigns = campaignsRes.campaigns;

      // Load rewards (with token, returns only user's rewards; without token, empty)
      try {
        const rewardsRes = await apiClient.getRewards();
        this.rewards = rewardsRes.rewards;
      } catch { /* ignore */ }

      // Load participants for all campaigns
      this.participants = [];
      for (const c of this.campaigns) {
        try {
          const partsRes = await apiClient.getCampaignParticipants(c.id);
          this.participants.push(...partsRes.participants);
        } catch { /* ignore */ }
      }

      // Load submissions for all campaigns
      this.submissions = [];
      for (const c of this.campaigns) {
        try {
          const subsRes = await apiClient.getCampaignSubmissions(c.id);
          this.submissions.push(...subsRes.submissions);
        } catch { /* ignore */ }
      }

      // Set default user if none
      if (!this.currentUserId && this.users.length > 0) {
        this.currentUserId = this.users[0].id;
      }

      // Load notifications for current user (requires auth)
      if (this.currentUserId) {
        try {
          const notifsRes = await apiClient.getNotifications(this.currentUserId);
          this.notifications = notifsRes.notifications;
        } catch { /* ignore */ }
      }
    } catch (err) {
      console.error('Failed to load from API, falling back to localStorage:', err);
      API_AVAILABLE = false;
      this.loadFromLocalStorage();
    }
  }

  private loadFromLocalStorage(): void {
    this.users = getStored<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
    this.currentUserId = getStored<string | null>(STORAGE_KEYS.CURRENT_USER_ID, 'user-creator-1');
    this.creators = getStored<CreatorProfile[]>(STORAGE_KEYS.CREATORS, SEED_CREATORS);
    this.projects = getStored<Project[]>(STORAGE_KEYS.PROJECTS, SEED_PROJECTS);
    this.campaigns = getStored<Campaign[]>(STORAGE_KEYS.CAMPAIGNS, SEED_CAMPAIGNS);
    this.participants = getStored<CampaignParticipant[]>(STORAGE_KEYS.PARTICIPANTS, SEED_PARTICIPANTS);
    this.submissions = getStored<Submission[]>(STORAGE_KEYS.SUBMISSIONS, SEED_SUBMISSIONS);
    this.rewards = getStored<Reward[]>(STORAGE_KEYS.REWARDS, SEED_REWARDS);
    this.notifications = getStored<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
  }

  private saveToLocalStorage(): void {
    setStored(STORAGE_KEYS.USERS, this.users);
    setStored(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
    setStored(STORAGE_KEYS.CREATORS, this.creators);
    setStored(STORAGE_KEYS.PROJECTS, this.projects);
    setStored(STORAGE_KEYS.CAMPAIGNS, this.campaigns);
    setStored(STORAGE_KEYS.PARTICIPANTS, this.participants);
    setStored(STORAGE_KEYS.SUBMISSIONS, this.submissions);
    setStored(STORAGE_KEYS.REWARDS, this.rewards);
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
  }

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((l) => l());
  }

  // --- Reset ---
  resetToDefaults(): void {
    this.users = [...SEED_USERS];
    this.currentUserId = 'user-creator-1';
    this.creators = [...SEED_CREATORS];
    this.projects = [...SEED_PROJECTS];
    this.campaigns = [...SEED_CAMPAIGNS];
    this.participants = [...SEED_PARTICIPANTS];
    this.submissions = [...SEED_SUBMISSIONS];
    this.rewards = [...SEED_REWARDS];
    this.notifications = [...SEED_NOTIFICATIONS];
    apiClient.removeToken();
    this.saveToLocalStorage();
    this.notify();
  }

  // --- Auth & Users ---
  getCurrentUser(): User | null {
    if (!this.currentUserId) return null;
    return this.users.find((u) => u.id === this.currentUserId) || null;
  }

  async switchUser(userId: string | null): Promise<void> {
    this.currentUserId = userId;
    setStored(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);

    if (API_AVAILABLE && userId) {
      // Login as this user to get a JWT token
      try {
        const user = this.users.find((u) => u.id === userId);
        if (user) {
          await apiClient.login(user.email);
        }
      } catch { /* ignore */ }

      try {
        const notifsRes = await apiClient.getNotifications(userId);
        this.notifications = notifsRes.notifications;
      } catch { /* ignore */ }
    }

    this.notify();
  }

  getUsers(): User[] {
    return this.users;
  }

  async register(name: string, email: string, category: User['category'], role: User['role'] = 'USER'): Promise<User> {
    if (API_AVAILABLE) {
      const { user, token } = await apiClient.register(name, email, category, role);
      this.users.push(user);
      this.currentUserId = user.id;
      setStored(STORAGE_KEYS.CURRENT_USER_ID, user.id);
      if (token) apiClient.setToken(token);
      this.notify();
      return user;
    }

    const existing = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) throw new Error('An account with this email address already exists.');

    const newUser: User = {
      id: `user-${Date.now()}`,
      name, email, role, category,
      createdAt: new Date().toISOString(),
      isEmailVerified: true,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`,
    };

    this.users.push(newUser);
    this.currentUserId = newUser.id;
    setStored(STORAGE_KEYS.USERS, this.users);
    setStored(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
    this.notify();
    return newUser;
  }

  async login(email: string): Promise<User> {
    if (API_AVAILABLE) {
      const { user, token } = await apiClient.login(email);
      this.currentUserId = user.id;
      setStored(STORAGE_KEYS.CURRENT_USER_ID, user.id);
      if (token) apiClient.setToken(token);

      // Ensure user is in our local cache
      const existingIdx = this.users.findIndex((u) => u.id === user.id);
      if (existingIdx !== -1) {
        this.users[existingIdx] = user;
      } else {
        this.users.push(user);
      }

      try {
        const notifsRes = await apiClient.getNotifications(user.id);
        this.notifications = notifsRes.notifications;
      } catch { /* ignore */ }

      this.notify();
      return user;
    }

    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) throw new Error('User not found. Try one of our demo accounts or register.');
    this.currentUserId = user.id;
    setStored(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
    this.notify();
    return user;
  }

  logout(): void {
    this.currentUserId = null;
    apiClient.removeToken();
    setStored(STORAGE_KEYS.CURRENT_USER_ID, null);
    this.notify();
  }

  // --- Creators ---
  getCreators(): CreatorProfile[] {
    return this.creators;
  }

  getApprovedCreators(): CreatorProfile[] {
    return this.creators.filter((c) => c.status === 'APPROVED');
  }

  async applyAsCreator(data: Omit<CreatorProfile, 'id' | 'status' | 'appliedAt'>): Promise<CreatorProfile> {
    if (API_AVAILABLE) {
      const { creator } = await apiClient.applyAsCreator(data);
      this.creators.push(creator);
      this.notify();
      return creator;
    }

    const newCreator: CreatorProfile = {
      ...data,
      id: `creator-${Date.now()}`,
      status: 'PENDING',
      appliedAt: new Date().toISOString(),
    };
    this.creators.push(newCreator);

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: 'user-admin',
      title: 'New Creator Application',
      message: `${newCreator.displayName} (@${newCreator.username}) submitted an application for review.`,
      type: 'warning',
      read: false,
      createdAt: new Date().toISOString(),
      link: 'admin-creators',
    });

    this.saveToLocalStorage();
    this.notify();
    return newCreator;
  }

  async updateCreatorStatus(creatorId: string, status: CreatorStatus, reviewNotes?: string): Promise<void> {
    if (API_AVAILABLE) {
      const { creator } = await apiClient.updateCreatorStatus(creatorId, status, reviewNotes);
      const index = this.creators.findIndex((c) => c.id === creatorId);
      if (index !== -1) this.creators[index] = creator;
      const { users } = await apiClient.getUsers().catch(() => ({ users: this.users }));
      this.users = users;
      this.notify();
      return;
    }

    const index = this.creators.findIndex((c) => c.id === creatorId);
    if (index === -1) return;

    this.creators[index] = {
      ...this.creators[index],
      status,
      reviewedAt: new Date().toISOString(),
      reviewNotes,
    };

    if (status === 'APPROVED') {
      const uIndex = this.users.findIndex((u) => u.id === this.creators[index].userId);
      if (uIndex !== -1) {
        this.users[uIndex] = { ...this.users[uIndex], role: 'CREATOR' };
      }
    }

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: this.creators[index].userId,
      title: status === 'APPROVED' ? 'Creator Application Approved! 🎉' : 'Creator Application Status Update',
      message: status === 'APPROVED'
        ? 'Congratulations! You are now a verified EthioWeb3 creator.'
        : `Your creator application status has been updated to ${status}.`,
      type: status === 'APPROVED' ? 'success' : 'info',
      read: false,
      createdAt: new Date().toISOString(),
      link: 'dashboard',
    });

    this.saveToLocalStorage();
    this.notify();
  }

  // --- Projects ---
  getProjects(): Project[] {
    return this.projects;
  }

  async applyAsProject(data: Omit<Project, 'id' | 'status' | 'appliedAt'>): Promise<Project> {
    if (API_AVAILABLE) {
      const { project } = await apiClient.applyAsProject(data);
      this.projects.push(project);
      this.notify();
      return project;
    }

    const newProject: Project = {
      ...data,
      id: `project-${Date.now()}`,
      status: 'PENDING',
      appliedAt: new Date().toISOString(),
    };
    this.projects.push(newProject);
    this.saveToLocalStorage();
    this.notify();
    return newProject;
  }

  async updateProjectStatus(projectId: string, status: ProjectStatus): Promise<void> {
    if (API_AVAILABLE) {
      const { project } = await apiClient.updateProjectStatus(projectId, status);
      const index = this.projects.findIndex((p) => p.id === projectId);
      if (index !== -1) this.projects[index] = project;
      const { users } = await apiClient.getUsers().catch(() => ({ users: this.users }));
      this.users = users;
      this.notify();
      return;
    }

    const index = this.projects.findIndex((p) => p.id === projectId);
    if (index === -1) return;

    this.projects[index] = {
      ...this.projects[index],
      status,
      reviewedAt: new Date().toISOString(),
    };

    if (status === 'APPROVED') {
      const uIndex = this.users.findIndex((u) => u.id === this.projects[index].userId);
      if (uIndex !== -1) {
        this.users[uIndex] = { ...this.users[uIndex], role: 'PROJECT' };
      }
    }

    this.saveToLocalStorage();
    this.notify();
  }

  // --- Campaigns ---
  getCampaigns(): Campaign[] {
    return this.campaigns;
  }

  async createCampaign(data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: CampaignStatus }): Promise<Campaign> {
    if (API_AVAILABLE) {
      const { campaign } = await apiClient.createCampaign(data);
      this.campaigns.unshift(campaign);
      this.notify();
      return campaign;
    }

    const newCampaign: Campaign = {
      ...data,
      id: `campaign-${Date.now()}`,
      status: data.status || 'PENDING_REVIEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.campaigns.unshift(newCampaign);
    this.saveToLocalStorage();
    this.notify();
    return newCampaign;
  }

  async updateCampaignStatus(campaignId: string, status: CampaignStatus): Promise<void> {
    if (API_AVAILABLE) {
      await apiClient.updateCampaignStatus(campaignId, status);
      const index = this.campaigns.findIndex((c) => c.id === campaignId);
      if (index !== -1) {
        this.campaigns[index] = { ...this.campaigns[index], status, updatedAt: new Date().toISOString() };
      }
      this.notify();
      return;
    }

    const index = this.campaigns.findIndex((c) => c.id === campaignId);
    if (index === -1) return;

    this.campaigns[index] = {
      ...this.campaigns[index],
      status,
      updatedAt: new Date().toISOString(),
    };
    this.saveToLocalStorage();
    this.notify();
  }

  // --- Participation ---
  getParticipants(campaignId?: string): CampaignParticipant[] {
    if (!campaignId) return this.participants;
    return this.participants.filter((p) => p.campaignId === campaignId);
  }

  async joinCampaign(campaignId: string, creator: CreatorProfile): Promise<CampaignParticipant> {
    const existing = this.participants.find(
      (p) => p.campaignId === campaignId && p.creatorId === creator.id
    );
    if (existing) return existing;

    if (API_AVAILABLE) {
      const { participant } = await apiClient.joinCampaign(campaignId, creator.id);
      this.participants.push(participant);
      this.notify();
      return participant;
    }

    const newParticipant: CampaignParticipant = {
      id: `part-${Date.now()}`,
      campaignId,
      creatorId: creator.id,
      creatorName: creator.displayName,
      creatorUsername: creator.username,
      joinedAt: new Date().toISOString(),
      status: 'ACTIVE',
      totalPosts: 0,
      totalImpressions: 0,
      totalEngagements: 0,
      score: 0,
      rank: this.getParticipants(campaignId).length + 1,
    };

    this.participants.push(newParticipant);
    this.saveToLocalStorage();
    this.notify();
    return newParticipant;
  }

  // --- Submissions ---
  getSubmissions(campaignId?: string, creatorId?: string): Submission[] {
    return this.submissions.filter((s) => {
      if (campaignId && s.campaignId !== campaignId) return false;
      if (creatorId && s.creatorId !== creatorId) return false;
      return true;
    });
  }

  async submitXPost(campaignId: string, creator: CreatorProfile, postUrl: string): Promise<Submission> {
    if (API_AVAILABLE) {
      const { submission } = await apiClient.submitXPost(campaignId, creator.id, postUrl);
      this.submissions.unshift(submission);

      try {
        const partsRes = await apiClient.getCampaignParticipants(campaignId);
        this.participants = this.participants.filter((p) => p.campaignId !== campaignId);
        this.participants.push(...partsRes.participants);
      } catch { /* ignore */ }

      this.notify();
      return submission;
    }

    const X_REGEX = /^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]{1,15}\/status\/(\d+)(?:\S*)?$/i;
    const match = postUrl.trim().match(X_REGEX);
    if (!match) throw new Error('Invalid X post URL format.');

    const postId = match[1];
    const existing = this.submissions.find(
      (s) => s.campaignId === campaignId && s.externalPostId === postId
    );
    if (existing) throw new Error('This X post has already been submitted to this campaign.');

    const campaign = this.campaigns.find((c) => c.id === campaignId);
    if (!campaign) throw new Error('Campaign not found.');

    this.joinCampaign(campaignId, creator);

    const seedNum = parseInt(postId.slice(-4), 10) || 1234;
    const impressions = 1200 + (seedNum % 3400);
    const likes = Math.floor(impressions * 0.04) + 15;
    const reposts = Math.floor(likes * 0.35) + 4;
    const replies = Math.floor(likes * 0.2) + 2;
    const bookmarks = Math.floor(likes * 0.15) + 1;
    const engagementRate = impressions > 0 ? Number(((likes + replies + reposts + bookmarks) / impressions * 100).toFixed(2)) : 0;
    const score = Math.round(impressions * 0.05 + likes * 2.0 + reposts * 4.0 + replies * 3.0 + bookmarks * 2.5);

    const initialSnapshot = {
      id: `snap-${Date.now()}`,
      submissionId: `sub-${Date.now()}`,
      timestamp: new Date().toISOString(),
      impressions, likes, replies, reposts, bookmarks,
    };

    const newSubmission: Submission = {
      id: initialSnapshot.submissionId,
      campaignId,
      campaignTitle: campaign.title,
      creatorId: creator.id,
      creatorUsername: creator.username,
      creatorDisplayName: creator.displayName,
      platform: 'X',
      externalPostId: postId,
      url: postUrl.trim(),
      contentText: 'Excited to participate in the campaign!',
      submittedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
      status: 'VERIFIED',
      metrics: { impressions, likes, replies, reposts, bookmarks, engagementRate },
      snapshots: [initialSnapshot as any],
      score,
    };

    this.submissions.unshift(newSubmission);
    this.recalculateParticipantStats(campaignId, creator.id);
    this.saveToLocalStorage();
    this.notify();
    return newSubmission;
  }

  async syncSubmissionMetrics(submissionId: string): Promise<Submission> {
    if (API_AVAILABLE) {
      const { submission } = await apiClient.syncSubmissionMetrics(submissionId);
      const index = this.submissions.findIndex((s) => s.id === submissionId);
      if (index !== -1) this.submissions[index] = submission;

      try {
        const partsRes = await apiClient.getCampaignParticipants(submission.campaignId);
        this.participants = this.participants.filter((p) => p.campaignId !== submission.campaignId);
        this.participants.push(...partsRes.participants);
      } catch { /* ignore */ }

      this.notify();
      return submission;
    }

    const subIndex = this.submissions.findIndex((s) => s.id === submissionId);
    if (subIndex === -1) throw new Error('Submission not found.');

    const sub = this.submissions[subIndex];
    const seed = parseInt(sub.externalPostId.slice(-3), 10) || 50;
    const delta = 1 + (Math.random() * 0.15 + 0.05);

    const base = sub.metrics;
    const newMetrics = {
      impressions: Math.floor(base.impressions * delta) + (seed % 100),
      likes: Math.floor(base.likes * delta) + 3,
      reposts: Math.floor(base.reposts * delta) + 1,
      replies: Math.floor(base.replies * delta) + 1,
      bookmarks: Math.floor(base.bookmarks * delta) + 1,
      engagementRate: 0,
    };
    newMetrics.engagementRate = newMetrics.impressions > 0
      ? Number(((newMetrics.likes + newMetrics.replies + newMetrics.reposts + newMetrics.bookmarks) / newMetrics.impressions * 100).toFixed(2))
      : 0;

    const score = Math.round(
      newMetrics.impressions * 0.05 + newMetrics.likes * 2.0 + newMetrics.reposts * 4.0 +
      newMetrics.replies * 3.0 + newMetrics.bookmarks * 2.5
    );

    const newSnapshot = {
      id: `snap-${Date.now()}`,
      submissionId,
      timestamp: new Date().toISOString(),
      impressions: newMetrics.impressions,
      likes: newMetrics.likes,
      replies: newMetrics.replies,
      reposts: newMetrics.reposts,
      bookmarks: newMetrics.bookmarks,
    };

    const updated: Submission = {
      ...sub,
      lastSyncedAt: new Date().toISOString(),
      metrics: newMetrics,
      snapshots: [...sub.snapshots, newSnapshot as any],
      score,
    };

    this.submissions[subIndex] = updated;
    this.recalculateParticipantStats(updated.campaignId, updated.creatorId);
    this.saveToLocalStorage();
    this.notify();
    return updated;
  }

  private recalculateParticipantStats(campaignId: string, creatorId: string): void {
    const creatorSubmissions = this.submissions.filter(
      (s) => s.campaignId === campaignId && s.creatorId === creatorId && s.status === 'VERIFIED'
    );

    const totalPosts = creatorSubmissions.length;
    const totalImpressions = creatorSubmissions.reduce((sum, s) => sum + s.metrics.impressions, 0);
    const totalEngagements = creatorSubmissions.reduce(
      (sum, s) => sum + s.metrics.likes + s.metrics.reposts + s.metrics.replies + s.metrics.bookmarks, 0
    );
    const score = creatorSubmissions.reduce((sum, s) => sum + s.score, 0);

    const pIndex = this.participants.findIndex(
      (p) => p.campaignId === campaignId && p.creatorId === creatorId
    );

    if (pIndex !== -1) {
      this.participants[pIndex] = {
        ...this.participants[pIndex],
        totalPosts,
        totalImpressions,
        totalEngagements,
        score,
      };
    }

    const campaignParts = this.participants.filter((p) => p.campaignId === campaignId);
    campaignParts.sort((a, b) => b.score - a.score);
    campaignParts.forEach((p, idx) => {
      const globalIdx = this.participants.findIndex((item) => item.id === p.id);
      if (globalIdx !== -1) this.participants[globalIdx].rank = idx + 1;
    });
  }

  // --- Rewards ---
  getRewards(creatorId?: string): Reward[] {
    if (!creatorId) return this.rewards;
    return this.rewards.filter((r) => r.creatorId === creatorId);
  }

  async updateRewardStatus(rewardId: string, status: RewardStatus, txReference?: string): Promise<void> {
    if (API_AVAILABLE) {
      await apiClient.updateRewardStatus(rewardId, status, txReference);
      const index = this.rewards.findIndex((r) => r.id === rewardId);
      if (index !== -1) {
        this.rewards[index] = {
          ...this.rewards[index],
          status,
          paidAt: status === 'PAID' ? new Date().toISOString() : this.rewards[index].paidAt,
          txReference: txReference || this.rewards[index].txReference,
        };
      }
      this.notify();
      return;
    }

    const index = this.rewards.findIndex((r) => r.id === rewardId);
    if (index === -1) return;

    this.rewards[index] = {
      ...this.rewards[index],
      status,
      paidAt: status === 'PAID' ? new Date().toISOString() : this.rewards[index].paidAt,
      txReference: txReference || this.rewards[index].txReference,
    };

    this.saveToLocalStorage();
    this.notify();
  }

  // --- Notifications ---
  getNotifications(userId: string): Notification[] {
    return this.notifications.filter((n) => n.userId === userId);
  }

  async markNotificationRead(notifId: string): Promise<void> {
    if (API_AVAILABLE) {
      await apiClient.markNotificationRead(notifId);
    }

    const index = this.notifications.findIndex((n) => n.id === notifId);
    if (index !== -1) this.notifications[index].read = true;

    this.saveToLocalStorage();
    this.notify();
  }
}

export const appStorage = new AppStorage();
