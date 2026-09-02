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
import { xProvider } from './social/xProvider';
import { campaignScoringService } from './scoringService';

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
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
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

export class AppStorage {
  private users: User[];
  private currentUserId: string | null;
  private creators: CreatorProfile[];
  private projects: Project[];
  private campaigns: Campaign[];
  private participants: CampaignParticipant[];
  private submissions: Submission[];
  private rewards: Reward[];
  private notifications: Notification[];
  private listeners: (() => void)[] = [];

  constructor() {
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

  subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  resetToDefaults() {
    this.users = [...SEED_USERS];
    this.currentUserId = 'user-creator-1';
    this.creators = [...SEED_CREATORS];
    this.projects = [...SEED_PROJECTS];
    this.campaigns = [...SEED_CAMPAIGNS];
    this.participants = [...SEED_PARTICIPANTS];
    this.submissions = [...SEED_SUBMISSIONS];
    this.rewards = [...SEED_REWARDS];
    this.notifications = [...SEED_NOTIFICATIONS];

    setStored(STORAGE_KEYS.USERS, this.users);
    setStored(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
    setStored(STORAGE_KEYS.CREATORS, this.creators);
    setStored(STORAGE_KEYS.PROJECTS, this.projects);
    setStored(STORAGE_KEYS.CAMPAIGNS, this.campaigns);
    setStored(STORAGE_KEYS.PARTICIPANTS, this.participants);
    setStored(STORAGE_KEYS.SUBMISSIONS, this.submissions);
    setStored(STORAGE_KEYS.REWARDS, this.rewards);
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);

    this.notify();
  }

  // --- Auth & Users ---
  getCurrentUser(): User | null {
    if (!this.currentUserId) return null;
    return this.users.find((u) => u.id === this.currentUserId) || null;
  }

  switchUser(userId: string | null) {
    this.currentUserId = userId;
    setStored(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
    this.notify();
  }

  getUsers(): User[] {
    return this.users;
  }

  registerUser(name: string, email: string, category: User['category'], role: User['role'] = 'USER'): User {
    const existing = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      category,
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

  login(email: string): User {
    const user = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error('User not found. Try one of our demo accounts or register.');
    }
    this.currentUserId = user.id;
    setStored(STORAGE_KEYS.CURRENT_USER_ID, this.currentUserId);
    this.notify();
    return user;
  }

  logout() {
    this.currentUserId = null;
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

  getCreatorByUserId(userId: string): CreatorProfile | undefined {
    return this.creators.find((c) => c.userId === userId);
  }

  applyAsCreator(data: Omit<CreatorProfile, 'id' | 'status' | 'appliedAt'>): CreatorProfile {
    const newCreator: CreatorProfile = {
      ...data,
      id: `creator-${Date.now()}`,
      status: 'PENDING',
      appliedAt: new Date().toISOString(),
    };

    this.creators.push(newCreator);
    setStored(STORAGE_KEYS.CREATORS, this.creators);

    // Notify admin
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
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);

    this.notify();
    return newCreator;
  }

  updateCreatorStatus(creatorId: string, status: CreatorStatus, reviewNotes?: string) {
    const index = this.creators.findIndex((c) => c.id === creatorId);
    if (index === -1) return;

    this.creators[index] = {
      ...this.creators[index],
      status,
      reviewedAt: new Date().toISOString(),
      reviewNotes,
    };

    // If approved, update user role to CREATOR
    if (status === 'APPROVED') {
      const uIndex = this.users.findIndex((u) => u.id === this.creators[index].userId);
      if (uIndex !== -1) {
        this.users[uIndex] = { ...this.users[uIndex], role: 'CREATOR' };
        setStored(STORAGE_KEYS.USERS, this.users);
      }
    }

    // Add notification to creator
    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: this.creators[index].userId,
      title: status === 'APPROVED' ? 'Creator Application Approved! 🎉' : 'Creator Application Status Update',
      message:
        status === 'APPROVED'
          ? 'Congratulations! You are now a verified EthioWeb3 creator. You can browse and join campaigns.'
          : `Your creator application status has been updated to ${status}.`,
      type: status === 'APPROVED' ? 'success' : 'info',
      read: false,
      createdAt: new Date().toISOString(),
      link: 'dashboard',
    });

    setStored(STORAGE_KEYS.CREATORS, this.creators);
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }

  // --- Projects ---
  getProjects(): Project[] {
    return this.projects;
  }

  applyAsProject(data: Omit<Project, 'id' | 'status' | 'appliedAt'>): Project {
    const newProject: Project = {
      ...data,
      id: `project-${Date.now()}`,
      status: 'PENDING',
      appliedAt: new Date().toISOString(),
    };

    this.projects.push(newProject);
    setStored(STORAGE_KEYS.PROJECTS, this.projects);

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: 'user-admin',
      title: 'New Project Partner Request',
      message: `${newProject.name} (${newProject.category}) submitted an onboarding application.`,
      type: 'info',
      read: false,
      createdAt: new Date().toISOString(),
      link: 'admin-projects',
    });
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);

    this.notify();
    return newProject;
  }

  updateProjectStatus(projectId: string, status: ProjectStatus) {
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
        setStored(STORAGE_KEYS.USERS, this.users);
      }
    }

    setStored(STORAGE_KEYS.PROJECTS, this.projects);
    this.notify();
  }

  // --- Campaigns ---
  getCampaigns(): Campaign[] {
    return this.campaigns;
  }

  getCampaignByIdOrSlug(identifier: string): Campaign | undefined {
    return this.campaigns.find((c) => c.id === identifier || c.slug === identifier);
  }

  createCampaign(data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: CampaignStatus }): Campaign {
    const newCampaign: Campaign = {
      ...data,
      id: `campaign-${Date.now()}`,
      status: data.status || 'PENDING_REVIEW',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.campaigns.unshift(newCampaign);
    setStored(STORAGE_KEYS.CAMPAIGNS, this.campaigns);

    this.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: 'user-admin',
      title: 'New Campaign Pending Review',
      message: `"${newCampaign.title}" by ${newCampaign.projectName} was submitted for review.`,
      type: 'campaign',
      read: false,
      createdAt: new Date().toISOString(),
      link: 'admin-campaigns',
    });
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);

    this.notify();
    return newCampaign;
  }

  updateCampaignStatus(campaignId: string, status: CampaignStatus) {
    const index = this.campaigns.findIndex((c) => c.id === campaignId);
    if (index === -1) return;

    this.campaigns[index] = {
      ...this.campaigns[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    setStored(STORAGE_KEYS.CAMPAIGNS, this.campaigns);
    this.notify();
  }

  // --- Participation ---
  getParticipants(campaignId?: string): CampaignParticipant[] {
    if (!campaignId) return this.participants;
    return this.participants.filter((p) => p.campaignId === campaignId);
  }

  joinCampaign(campaignId: string, creator: CreatorProfile): CampaignParticipant {
    const existing = this.participants.find(
      (p) => p.campaignId === campaignId && p.creatorId === creator.id
    );
    if (existing) return existing;

    const newParticipant: CampaignParticipant = {
      id: `part-${Date.now()}`,
      campaignId,
      creatorId: creator.id,
      creatorName: creator.displayName,
      creatorUsername: creator.username,
      creatorAvatar: this.users.find((u) => u.id === creator.userId)?.avatarUrl,
      joinedAt: new Date().toISOString(),
      status: 'ACTIVE',
      totalPosts: 0,
      totalImpressions: 0,
      totalEngagements: 0,
      score: 0,
      rank: this.getParticipants(campaignId).length + 1,
    };

    this.participants.push(newParticipant);
    setStored(STORAGE_KEYS.PARTICIPANTS, this.participants);
    this.notify();
    return newParticipant;
  }

  // --- Submissions & X Analytics ---
  getSubmissions(campaignId?: string, creatorId?: string): Submission[] {
    return this.submissions.filter((s) => {
      if (campaignId && s.campaignId !== campaignId) return false;
      if (creatorId && s.creatorId !== creatorId) return false;
      return true;
    });
  }

  async submitXPost(campaignId: string, creator: CreatorProfile, postUrl: string): Promise<Submission> {
    // 1. Validate X URL
    const validation = xProvider.validateUrl(postUrl);
    if (!validation.valid || !validation.postId) {
      throw new Error(validation.error || 'Invalid X post URL format.');
    }

    // 2. Prevent duplicate submission in this campaign
    const existing = this.submissions.find(
      (s) => s.campaignId === campaignId && s.externalPostId === validation.postId
    );
    if (existing) {
      throw new Error('This X post has already been submitted to this campaign.');
    }

    const campaign = this.campaigns.find((c) => c.id === campaignId);
    if (!campaign) {
      throw new Error('Campaign not found.');
    }

    // Ensure creator is a participant
    this.joinCampaign(campaignId, creator);

    // 3. Fetch initial post details & public metrics via Provider abstraction
    const postData = await xProvider.fetchPostData(validation.postId, validation.username || creator.username);
    const score = campaignScoringService.calculatePostScore(postData.metrics);
    const engagementRate = campaignScoringService.calculateEngagementRate(postData.metrics);

    const initialSnapshot = {
      id: `snap-${Date.now()}`,
      submissionId: `sub-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...postData.metrics,
    };

    const newSubmission: Submission = {
      id: initialSnapshot.submissionId,
      campaignId,
      campaignTitle: campaign.title,
      creatorId: creator.id,
      creatorUsername: creator.username,
      creatorDisplayName: creator.displayName,
      creatorAvatar: this.users.find((u) => u.id === creator.userId)?.avatarUrl,
      platform: 'X',
      externalPostId: validation.postId,
      url: postUrl.trim(),
      contentText: postData.contentText,
      submittedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
      status: 'VERIFIED',
      metrics: {
        ...postData.metrics,
        engagementRate,
      },
      snapshots: [initialSnapshot],
      score,
    };

    this.submissions.unshift(newSubmission);
    setStored(STORAGE_KEYS.SUBMISSIONS, this.submissions);

    // 4. Update participant statistics and recalculate ranks
    this.recalculateParticipantStats(campaignId, creator.id);

    this.notify();
    return newSubmission;
  }

  async syncSubmissionMetrics(submissionId: string): Promise<Submission> {
    const subIndex = this.submissions.findIndex((s) => s.id === submissionId);
    if (subIndex === -1) throw new Error('Submission not found.');

    const sub = this.submissions[subIndex];
    const newMetrics = await xProvider.refreshMetrics(sub.externalPostId);
    const score = campaignScoringService.calculatePostScore(newMetrics);
    const engagementRate = campaignScoringService.calculateEngagementRate(newMetrics);

    const newSnapshot = {
      id: `snap-${Date.now()}`,
      submissionId,
      timestamp: new Date().toISOString(),
      ...newMetrics,
    };

    const updated: Submission = {
      ...sub,
      lastSyncedAt: new Date().toISOString(),
      metrics: {
        ...newMetrics,
        engagementRate,
      },
      snapshots: [...sub.snapshots, newSnapshot],
      score,
    };

    this.submissions[subIndex] = updated;
    setStored(STORAGE_KEYS.SUBMISSIONS, this.submissions);

    this.recalculateParticipantStats(updated.campaignId, updated.creatorId);

    this.notify();
    return updated;
  }

  private recalculateParticipantStats(campaignId: string, creatorId: string) {
    const creatorSubmissions = this.submissions.filter(
      (s) => s.campaignId === campaignId && s.creatorId === creatorId && s.status === 'VERIFIED'
    );

    const totalPosts = creatorSubmissions.length;
    const totalImpressions = creatorSubmissions.reduce((sum, s) => sum + s.metrics.impressions, 0);
    const totalEngagements = creatorSubmissions.reduce(
      (sum, s) => sum + s.metrics.likes + s.metrics.reposts + s.metrics.replies + s.metrics.bookmarks,
      0
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

    // Re-rank all participants in this campaign by score descending
    const campaignParts = this.participants.filter((p) => p.campaignId === campaignId);
    campaignParts.sort((a, b) => b.score - a.score);

    campaignParts.forEach((p, idx) => {
      const globalIdx = this.participants.findIndex((item) => item.id === p.id);
      if (globalIdx !== -1) {
        this.participants[globalIdx].rank = idx + 1;
      }
    });

    setStored(STORAGE_KEYS.PARTICIPANTS, this.participants);
  }

  // --- Rewards ---
  getRewards(creatorId?: string): Reward[] {
    if (!creatorId) return this.rewards;
    return this.rewards.filter((r) => r.creatorId === creatorId);
  }

  updateRewardStatus(rewardId: string, status: RewardStatus, txReference?: string) {
    const index = this.rewards.findIndex((r) => r.id === rewardId);
    if (index === -1) return;

    this.rewards[index] = {
      ...this.rewards[index],
      status,
      paidAt: status === 'PAID' ? new Date().toISOString() : this.rewards[index].paidAt,
      txReference: txReference || this.rewards[index].txReference,
    };

    setStored(STORAGE_KEYS.REWARDS, this.rewards);
    this.notify();
  }

  // --- Notifications ---
  getNotifications(userId: string): Notification[] {
    return this.notifications.filter((n) => n.userId === userId);
  }

  markNotificationRead(notificationId: string) {
    const index = this.notifications.findIndex((n) => n.id === notificationId);
    if (index === -1) return;
    this.notifications[index].read = true;
    setStored(STORAGE_KEYS.NOTIFICATIONS, this.notifications);
    this.notify();
  }
}

export const appStorage = new AppStorage();
