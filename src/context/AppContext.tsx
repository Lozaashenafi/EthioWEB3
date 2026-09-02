import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
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
import { appStorage } from '../services/storage';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  creators: CreatorProfile[];
  approvedCreators: CreatorProfile[];
  projects: Project[];
  campaigns: Campaign[];
  participants: CampaignParticipant[];
  submissions: Submission[];
  rewards: Reward[];
  notifications: Notification[];
  activeCreatorProfile: CreatorProfile | undefined;
  activeProjectProfile: Project | undefined;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  setTheme: (theme: 'dark' | 'light') => void;
  
  // Actions
  switchUser: (userId: string | null) => void;
  login: (email: string) => User;
  register: (name: string, email: string, category: User['category'], role?: User['role']) => User;
  logout: () => void;
  applyAsCreator: (data: Omit<CreatorProfile, 'id' | 'status' | 'appliedAt'>) => CreatorProfile;
  updateCreatorStatus: (creatorId: string, status: CreatorStatus, notes?: string) => void;
  applyAsProject: (data: Omit<Project, 'id' | 'status' | 'appliedAt'>) => Project;
  updateProjectStatus: (projectId: string, status: ProjectStatus) => void;
  createCampaign: (data: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { status?: CampaignStatus }) => Campaign;
  updateCampaignStatus: (campaignId: string, status: CampaignStatus) => void;
  joinCampaign: (campaignId: string, creator: CreatorProfile) => CampaignParticipant;
  submitXPost: (campaignId: string, creator: CreatorProfile, postUrl: string) => Promise<Submission>;
  syncSubmissionMetrics: (submissionId: string) => Promise<Submission>;
  updateRewardStatus: (rewardId: string, status: RewardStatus, txRef?: string) => void;
  markNotificationRead: (notifId: string) => void;
  resetToDefaults: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [version, setVersion] = useState(0);
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ethio_theme');
      if (saved === 'light' || saved === 'dark') return saved;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    return 'dark';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ethio_theme', theme);
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
  };

  useEffect(() => {
    const unsubscribe = appStorage.subscribe(() => {
      setVersion((v) => v + 1);
    });
    return unsubscribe;
  }, []);

  const currentUser = useMemo(() => appStorage.getCurrentUser(), [version]);
  const users = useMemo(() => appStorage.getUsers(), [version]);
  const creators = useMemo(() => appStorage.getCreators(), [version]);
  const approvedCreators = useMemo(() => appStorage.getApprovedCreators(), [version]);
  const projects = useMemo(() => appStorage.getProjects(), [version]);
  const campaigns = useMemo(() => appStorage.getCampaigns(), [version]);
  const participants = useMemo(() => appStorage.getParticipants(), [version]);
  const submissions = useMemo(() => appStorage.getSubmissions(), [version]);
  const rewards = useMemo(() => appStorage.getRewards(), [version]);
  const notifications = useMemo(
    () => (currentUser ? appStorage.getNotifications(currentUser.id) : []),
    [currentUser, version]
  );

  const activeCreatorProfile = useMemo(() => {
    if (!currentUser) return undefined;
    return creators.find((c) => c.userId === currentUser.id);
  }, [currentUser, creators]);

  const activeProjectProfile = useMemo(() => {
    if (!currentUser) return undefined;
    return projects.find((p) => p.userId === currentUser.id);
  }, [currentUser, projects]);

  const value: AppContextType = {
    currentUser,
    users,
    creators,
    approvedCreators,
    projects,
    campaigns,
    participants,
    submissions,
    rewards,
    notifications,
    activeCreatorProfile,
    activeProjectProfile,
    theme,
    toggleTheme,
    setTheme,

    switchUser: (userId) => appStorage.switchUser(userId),
    login: (email) => appStorage.login(email),
    register: (name, email, cat, role) => appStorage.registerUser(name, email, cat, role),
    logout: () => appStorage.logout(),
    applyAsCreator: (data) => appStorage.applyAsCreator(data),
    updateCreatorStatus: (creatorId, status, notes) => appStorage.updateCreatorStatus(creatorId, status, notes),
    applyAsProject: (data) => appStorage.applyAsProject(data),
    updateProjectStatus: (projectId, status) => appStorage.updateProjectStatus(projectId, status),
    createCampaign: (data) => appStorage.createCampaign(data),
    updateCampaignStatus: (campaignId, status) => appStorage.updateCampaignStatus(campaignId, status),
    joinCampaign: (campaignId, creator) => appStorage.joinCampaign(campaignId, creator),
    submitXPost: (campaignId, creator, postUrl) => appStorage.submitXPost(campaignId, creator, postUrl),
    syncSubmissionMetrics: (submissionId) => appStorage.syncSubmissionMetrics(submissionId),
    updateRewardStatus: (rewardId, status, txRef) => appStorage.updateRewardStatus(rewardId, status, txRef),
    markNotificationRead: (notifId) => appStorage.markNotificationRead(notifId),
    resetToDefaults: () => appStorage.resetToDefaults(),
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
