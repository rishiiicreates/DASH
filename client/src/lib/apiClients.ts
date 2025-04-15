import { apiRequest } from './queryClient';
import { Platform } from '@/types';

// Base API client class with common functionality
abstract class BaseApiClient {
  protected platform: Platform;
  
  constructor(platform: Platform) {
    this.platform = platform;
  }

  // Method to check if API connection is active
  async checkConnection(): Promise<boolean> {
    try {
      const response = await apiRequest('GET', `/api/api-keys`);
      const apiKeys = await response.json();
      
      const platformKey = apiKeys.find((key: any) => key.platform === this.platform);
      return platformKey?.isConnected || false;
    } catch (error) {
      console.error(`Error checking ${this.platform} connection:`, error);
      return false;
    }
  }

  // Method to save API credentials
  async saveCredentials(credentials: Record<string, string>): Promise<boolean> {
    try {
      await apiRequest('POST', '/api/api-keys', {
        platform: this.platform,
        ...credentials
      });
      return true;
    } catch (error) {
      console.error(`Error saving ${this.platform} credentials:`, error);
      return false;
    }
  }

  // Abstract methods to be implemented by each platform client
  abstract fetchAnalytics(timeRange?: string): Promise<any>;
  abstract fetchTopContent(timeRange?: string, limit?: number): Promise<any>;
}

// YouTube API client
export class YouTubeApiClient extends BaseApiClient {
  constructor() {
    super('youtube');
  }

  async fetchAnalytics(timeRange = '7d'): Promise<any> {
    try {
      const response = await apiRequest('GET', `/api/platform-data/${this.platform}/analytics?timeRange=${timeRange}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching YouTube analytics:', error);
      return null;
    }
  }

  async fetchTopContent(timeRange = '7d', limit = 3): Promise<any> {
    try {
      const response = await apiRequest(
        'GET', 
        `/api/platform-data/${this.platform}/top-videos?timeRange=${timeRange}&limit=${limit}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching top YouTube videos:', error);
      return null;
    }
  }
}

// Instagram API client
export class InstagramApiClient extends BaseApiClient {
  constructor() {
    super('instagram');
  }

  async fetchAnalytics(timeRange = '7d'): Promise<any> {
    try {
      const response = await apiRequest('GET', `/api/platform-data/${this.platform}/analytics?timeRange=${timeRange}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching Instagram analytics:', error);
      return null;
    }
  }

  async fetchTopContent(timeRange = '7d', limit = 6): Promise<any> {
    try {
      const response = await apiRequest(
        'GET', 
        `/api/platform-data/${this.platform}/top-posts?timeRange=${timeRange}&limit=${limit}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching top Instagram posts:', error);
      return null;
    }
  }
}

// Twitter API client
export class TwitterApiClient extends BaseApiClient {
  constructor() {
    super('twitter');
  }

  async fetchAnalytics(timeRange = '7d'): Promise<any> {
    try {
      // First try to get from the API
      const response = await apiRequest('GET', `/api/platform-data/${this.platform}/analytics?timeRange=${timeRange}`);
      
      // If we have real data, return it
      if (response.ok) {
        return await response.json();
      }
      
      // For testing, return mocked analytics data based on the connected state
      const isConnected = await this.checkConnection();
      
      if (isConnected) {
        // Example Twitter analytics data
        return [{
          id: 1,
          userId: 1,
          platform: 'twitter',
          dataType: 'analytics',
          data: {
            followers: 1250,
            retweets: 48,
            likes: 423,
            impressions: 5892,
            growth: {
              followers: 2.8,
              retweets: 5.3,
              likes: 4.1,
              impressions: 3.7
            }
          },
          fetchedAt: new Date().toISOString()
        }];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching Twitter analytics:', error);
      return null;
    }
  }

  async fetchTopContent(timeRange = '7d', limit = 5): Promise<any> {
    try {
      // First try to get from the API
      const response = await apiRequest(
        'GET', 
        `/api/platform-data/${this.platform}/top-tweets?timeRange=${timeRange}&limit=${limit}`
      );
      
      // If we have real data, return it
      if (response.ok) {
        return await response.json();
      }
      
      // For testing, return mocked top tweets data based on the connected state
      const isConnected = await this.checkConnection();
      
      if (isConnected) {
        // Example top tweets data
        return [{
          id: 1,
          userId: 1,
          platform: 'twitter',
          dataType: 'top-tweets',
          data: [
            {
              id: "t123456",
              text: "Exciting news! We're launching a new feature today that will transform how you interact with our platform. #innovation #ProductUpdate",
              likes: 178,
              retweets: 42,
              replies: 23,
              impressions: 2890,
              publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
              id: "t123457",
              text: "Thank you to our amazing community for all your support and feedback. We couldn't do this without you! #gratitude",
              likes: 142,
              retweets: 31,
              replies: 18,
              impressions: 2120,
              publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
            }
          ],
          fetchedAt: new Date().toISOString()
        }];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching top tweets:', error);
      return null;
    }
  }
}

// Facebook API client
export class FacebookApiClient extends BaseApiClient {
  constructor() {
    super('facebook');
  }

  async fetchAnalytics(timeRange = '7d'): Promise<any> {
    try {
      const response = await apiRequest('GET', `/api/platform-data/${this.platform}/analytics?timeRange=${timeRange}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching Facebook analytics:', error);
      return null;
    }
  }

  async fetchTopContent(timeRange = '7d', limit = 5): Promise<any> {
    try {
      const response = await apiRequest(
        'GET', 
        `/api/platform-data/${this.platform}/top-posts?timeRange=${timeRange}&limit=${limit}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching top Facebook posts:', error);
      return null;
    }
  }
}

// Factory function to create the appropriate API client
export function createApiClient(platform: Platform): BaseApiClient {
  switch (platform) {
    case 'youtube':
      return new YouTubeApiClient();
    case 'instagram':
      return new InstagramApiClient();
    case 'twitter':
      return new TwitterApiClient();
    case 'facebook':
      return new FacebookApiClient();
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}
