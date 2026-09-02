export type UserRole = 'USER' | 'CREATOR' | 'PROJECT' | 'ADMIN';

export type UserCategory =
  | 'Creator'
  | 'Developer'
  | 'Builder'
  | 'Community Leader'
  | 'Trader'
  | 'Web3 Enthusiast'
  | 'Student'
  | 'Project / Company';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  category: UserCategory;
  avatarUrl?: string;
  createdAt: string;
  isEmailVerified: boolean;
}

export type CreatorStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

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
  status: CreatorStatus;
  appliedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export type ProjectStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

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
  status: ProjectStatus;
  appliedAt: string;
  reviewedAt?: string;
}

export type CampaignStatus =
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Campaign {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  coverImage: string;
  projectId: string;
  projectName: string;
  projectLogo: string;
  status: CampaignStatus;
  startDate: string;
  endDate: string;
  rewardPool: {
    total: number;
    currency: string;
    rewardStructure: string;
  };
  maxParticipants: number;
  targetPlatforms: ('X' | 'TELEGRAM' | 'YOUTUBE' | 'TIKTOK')[];
  contentRequirements: string[];
  requiredHashtags: string[];
  requiredMentions: string[];
  campaignRules: string[];
  createdAt: string;
  updatedAt: string;
}

export type ParticipationStatus = 'JOINED' | 'ACTIVE' | 'COMPLETED' | 'DISQUALIFIED';

export interface CampaignParticipant {
  id: string;
  campaignId: string;
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar?: string;
  joinedAt: string;
  status: ParticipationStatus;
  totalPosts: number;
  totalImpressions: number;
  totalEngagements: number;
  score: number;
  rank?: number;
}

export type SubmissionStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface MetricSnapshot {
  id: string;
  submissionId: string;
  timestamp: string;
  impressions: number;
  likes: number;
  replies: number;
  reposts: number;
  bookmarks: number;
}

export interface Submission {
  id: string;
  campaignId: string;
  campaignTitle: string;
  creatorId: string;
  creatorUsername: string;
  creatorDisplayName: string;
  creatorAvatar?: string;
  platform: 'X' | 'TELEGRAM' | 'YOUTUBE';
  externalPostId: string;
  url: string;
  contentText?: string;
  submittedAt: string;
  lastSyncedAt: string;
  status: SubmissionStatus;
  metrics: {
    impressions: number;
    likes: number;
    replies: number;
    reposts: number;
    bookmarks: number;
    engagementRate: number;
  };
  snapshots: MetricSnapshot[];
  score: number;
  notes?: string;
}

export type RewardStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';

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
  status: RewardStatus;
  createdAt: string;
  paidAt?: string;
  txReference?: string;
}

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
