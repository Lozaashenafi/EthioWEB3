const API_BASE = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'ethioweb3_token';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // --- Token Management ---
  getToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  setToken(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch { /* ignore */ }
  }

  removeToken(): void {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch { /* ignore */ }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);

    // If 401, clear token and redirect
    if (response.status === 401) {
      this.removeToken();
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // --- Auth ---
  async login(email: string, password?: string) {
    const body: Record<string, string> = { email };
    if (password) body.password = password;

    const result = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (result.token) {
      this.setToken(result.token);
    }

    return result;
  }

  async register(name: string, email: string, category: string, role?: string, password?: string) {
    const body: Record<string, string> = { name, email, category };
    if (role) body.role = role;
    if (password) body.password = password;

    const result = await this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });

    if (result.token) {
      this.setToken(result.token);
    }

    return result;
  }

  async applyAsCreator(data: any) {
    return this.request<{ creator: any }>('/auth/apply-creator', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async applyAsProject(data: any) {
    return this.request<{ project: any }>('/auth/apply-project', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request<{ user: any }>('/auth/me');
  }

  // --- Users ---
  async getUsers() {
    return this.request<{ users: any[] }>('/users');
  }

  async getUser(id: string) {
    return this.request<{ user: any }>(`/users/${id}`);
  }

  async updateUserRole(id: string, role: string) {
    return this.request<{ user: any }>(`/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  // --- Creators ---
  async getCreators(approvedOnly = false) {
    const params = approvedOnly ? '?approved=true' : '';
    return this.request<{ creators: any[] }>(`/creators${params}`);
  }

  async getCreator(id: string) {
    return this.request<{ creator: any }>(`/creators/${id}`);
  }

  async updateCreatorStatus(id: string, status: string, reviewNotes?: string) {
    return this.request<{ creator: any }>(`/creators/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reviewNotes }),
    });
  }

  // --- Projects ---
  async getProjects() {
    return this.request<{ projects: any[] }>('/projects');
  }

  async getProject(id: string) {
    return this.request<{ project: any }>(`/projects/${id}`);
  }

  async updateProjectStatus(id: string, status: string) {
    return this.request<{ project: any }>(`/projects/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // --- Campaigns ---
  async getCampaigns() {
    return this.request<{ campaigns: any[] }>('/campaigns');
  }

  async getCampaign(identifier: string) {
    return this.request<{ campaign: any }>(`/campaigns/${identifier}`);
  }

  async createCampaign(data: any) {
    return this.request<{ campaign: any }>('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCampaignStatus(id: string, status: string) {
    return this.request<{ campaign: any }>(`/campaigns/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async joinCampaign(campaignId: string, creatorId: string) {
    return this.request<{ participant: any }>(`/campaigns/${campaignId}/join`, {
      method: 'POST',
      body: JSON.stringify({ creatorId }),
    });
  }

  async getCampaignParticipants(campaignId: string) {
    return this.request<{ participants: any[] }>(`/campaigns/${campaignId}/participants`);
  }

  async getCampaignSubmissions(campaignId: string) {
    return this.request<{ submissions: any[] }>(`/campaigns/${campaignId}/submissions`);
  }

  async submitXPost(campaignId: string, creatorId: string, postUrl: string) {
    return this.request<{ submission: any }>(`/campaigns/${campaignId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ creatorId, postUrl }),
    });
  }

  async syncSubmissionMetrics(submissionId: string) {
    return this.request<{ submission: any }>(`/campaigns/submissions/${submissionId}/sync`, {
      method: 'POST',
    });
  }

  // --- Rewards ---
  async getRewards(creatorId?: string) {
    const params = creatorId ? `?creatorId=${creatorId}` : '';
    return this.request<{ rewards: any[] }>(`/rewards${params}`);
  }

  async updateRewardStatus(id: string, status: string, txReference?: string) {
    return this.request<{ reward: any }>(`/rewards/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, txReference }),
    });
  }

  // --- Notifications ---
  async getNotifications(userId: string) {
    return this.request<{ notifications: any[] }>(`/notifications/${userId}`);
  }

  async markNotificationRead(id: string) {
    return this.request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PATCH',
    });
  }
}

export const apiClient = new ApiClient(API_BASE);
