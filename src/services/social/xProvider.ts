import { PostValidationResult, PostFetchedData, SocialPlatformProvider } from './provider';

export class XProvider implements SocialPlatformProvider {
  readonly platformName = 'X';

  // Matches https://x.com/<username>/status/<id> or https://twitter.com/<username>/status/<id>
  private static readonly X_URL_REGEX =
    /^https?:\/\/(?:www\.)?(?:twitter\.com|x\.com)\/(?<username>[a-zA-Z0-9_]{1,15})\/status\/(?<id>\d+)(?:\S*)?$/i;

  validateUrl(url: string): PostValidationResult {
    if (!url || typeof url !== 'string') {
      return { valid: false, error: 'URL must not be empty' };
    }

    const trimmed = url.trim();
    const match = trimmed.match(XProvider.X_URL_REGEX);

    if (!match || !match.groups) {
      return {
        valid: false,
        error: 'Invalid X (Twitter) post URL. Format: https://x.com/username/status/123456789',
      };
    }

    const { username, id } = match.groups;
    if (!id || id.length < 5) {
      return { valid: false, error: 'Could not extract valid Post ID from URL' };
    }

    return {
      valid: true,
      postId: id,
      username: username.toLowerCase(),
    };
  }

  async fetchPostData(postId: string, username = 'creator'): Promise<PostFetchedData> {
    // In production, this uses process.env.X_BEARER_TOKEN to call official X API v2:
    // https://api.twitter.com/2/tweets/${postId}?tweet.fields=public_metrics,created_at,text
    // For MVP demonstration, we simulate verified retrieval based on post ID:
    const seedNum = parseInt(postId.slice(-4), 10) || 1234;
    const baseImpressions = 1200 + (seedNum % 3400);
    const baseLikes = Math.floor(baseImpressions * 0.04) + 15;
    const baseReposts = Math.floor(baseLikes * 0.35) + 4;
    const baseReplies = Math.floor(baseLikes * 0.2) + 2;
    const baseBookmarks = Math.floor(baseLikes * 0.15) + 1;

    return {
      externalPostId: postId,
      username,
      contentText: `Excited to participate in the campaign! Ethiopia's Web3 community is growing rapidly with @Arbitrum & @ShebaFi. Discover more #EthioWeb3 #Web3Africa 🇪🇹🚀`,
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      metrics: {
        impressions: baseImpressions,
        likes: baseLikes,
        replies: baseReplies,
        reposts: baseReposts,
        bookmarks: baseBookmarks,
      },
    };
  }

  async refreshMetrics(postId: string): Promise<PostFetchedData['metrics']> {
    // Simulates an incremental sync snapshot (e.g. background job running periodically)
    const seed = parseInt(postId.slice(-3), 10) || 50;
    const deltaMultiplier = 1 + (Math.random() * 0.15 + 0.05);

    const base = await this.fetchPostData(postId);
    return {
      impressions: Math.floor(base.metrics.impressions * deltaMultiplier) + (seed % 100),
      likes: Math.floor(base.metrics.likes * deltaMultiplier) + 3,
      reposts: Math.floor(base.metrics.reposts * deltaMultiplier) + 1,
      replies: Math.floor(base.metrics.replies * deltaMultiplier) + 1,
      bookmarks: Math.floor(base.metrics.bookmarks * deltaMultiplier) + 1,
    };
  }
}

export const xProvider = new XProvider();
