export interface PostValidationResult {
  valid: boolean;
  postId?: string;
  username?: string;
  error?: string;
}

export interface PostFetchedData {
  externalPostId: string;
  username: string;
  contentText: string;
  createdAt: string;
  metrics: {
    impressions: number;
    likes: number;
    replies: number;
    reposts: number;
    bookmarks: number;
  };
}

export interface SocialPlatformProvider {
  platformName: string;
  validateUrl(url: string): PostValidationResult;
  fetchPostData(postId: string, username?: string): Promise<PostFetchedData>;
  refreshMetrics(postId: string): Promise<PostFetchedData['metrics']>;
}
