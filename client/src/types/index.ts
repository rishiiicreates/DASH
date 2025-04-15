import { User as FirebaseUser } from 'firebase/auth';

// Platform types
export type Platform = 'youtube' | 'instagram' | 'twitter' | 'facebook';
export type ConnectionStatus = 'connected' | 'setup-needed' | 'not-connected';
export type SubscriptionPlan = 'free' | 'pro' | 'business';

// User type
export interface User {
  id: number;
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  subscription: SubscriptionPlan;
  subscriptionEndDate?: string;
}

// API Key type
export interface ApiKey {
  id: number;
  userId: number;
  platform: Platform;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  accessTokenSecret?: string;
  refreshToken?: string;
  expiresAt?: string;
  isConnected: boolean;
}

// Subscription type
export interface Subscription {
  id: number;
  userId: number;
  plan: SubscriptionPlan;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  paymentId?: string;
  paymentDetails?: any;
}

// Platform data types
export interface PlatformData {
  id: number;
  userId: number;
  platform: Platform;
  dataType: string;
  data: any;
  fetchedAt: string;
}

// YouTube specific types
export interface YouTubeAnalytics {
  subscribers: number;
  views: number;
  watchTime: number;
  avgViewDuration: string;
  growth: {
    subscribers: number;
    views: number;
    watchTime: number;
    avgViewDuration: number;
  };
}

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  publishedAt: string;
}

// Instagram specific types
export interface InstagramAnalytics {
  followers: number;
  engagementRate: number;
  reach: number;
  impressions: number;
  growth: {
    followers: number;
    engagementRate: number;
    reach: number;
    impressions: number;
  };
}

export interface InstagramPost {
  id: string;
  imageUrl: string;
  likes: number;
  comments: number;
  reach: number;
  impressions: number;
  engagementRate: number;
  publishedAt: string;
}

// Twitter specific types
export interface TwitterAnalytics {
  followers: number;
  retweets: number;
  likes: number;
  impressions: number;
  growth: {
    followers: number;
    retweets: number;
    likes: number;
    impressions: number;
  };
}

export interface TwitterTweet {
  id: string;
  text: string;
  likes: number;
  retweets: number;
  replies: number;
  impressions: number;
  publishedAt: string;
}

// Facebook specific types
export interface FacebookAnalytics {
  pageLikes: number;
  reach: number;
  engagement: number;
  postImpressions: number;
  growth: {
    pageLikes: number;
    reach: number;
    engagement: number;
    postImpressions: number;
  };
}

export interface FacebookPost {
  id: string;
  text: string;
  imageUrl?: string;
  reactions: number;
  comments: number;
  shares: number;
  reach: number;
  publishedAt: string;
}

// Payment related types
export interface PaymentInfo {
  paymentId: string;
  orderId?: string;
  signature?: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending';
}

// Combined analytics type
export interface CombinedAnalytics {
  totalAudience: number;
  totalEngagement: number;
  totalReach: number;
  contentPerformance: number;
  platformBreakdown: {
    youtube: YouTubeAnalytics | null;
    instagram: InstagramAnalytics | null;
    twitter: TwitterAnalytics | null;
    facebook: FacebookAnalytics | null;
  };
}
