export interface ScoringWeights {
  impressionWeight: number;
  likeWeight: number;
  repostWeight: number;
  replyWeight: number;
  bookmarkWeight: number;
}

export class CampaignScoringService {
  private weights: ScoringWeights;

  constructor(customWeights?: Partial<ScoringWeights>) {
    this.weights = {
      impressionWeight: 0.05,
      likeWeight: 2.0,
      repostWeight: 4.0,
      replyWeight: 3.0,
      bookmarkWeight: 2.5,
      ...customWeights,
    };
  }

  setWeights(newWeights: Partial<ScoringWeights>): void {
    this.weights = { ...this.weights, ...newWeights };
  }

  getWeights(): ScoringWeights {
    return { ...this.weights };
  }

  calculatePostScore(metrics: {
    impressions: number;
    likes: number;
    replies: number;
    reposts: number;
    bookmarks: number;
  }): number {
    const raw =
      metrics.impressions * this.weights.impressionWeight +
      metrics.likes * this.weights.likeWeight +
      metrics.reposts * this.weights.repostWeight +
      metrics.replies * this.weights.replyWeight +
      metrics.bookmarks * this.weights.bookmarkWeight;

    return Math.round(raw);
  }

  calculateEngagementRate(metrics: {
    impressions: number;
    likes: number;
    replies: number;
    reposts: number;
    bookmarks: number;
  }): number {
    if (!metrics.impressions || metrics.impressions <= 0) return 0;
    const totalInteractions =
      metrics.likes + metrics.replies + metrics.reposts + metrics.bookmarks;
    const rate = (totalInteractions / metrics.impressions) * 100;
    return Number(rate.toFixed(2));
  }
}

export const campaignScoringService = new CampaignScoringService();
