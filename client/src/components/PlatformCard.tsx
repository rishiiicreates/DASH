import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface PlatformCardProps {
  platform: 'youtube' | 'instagram' | 'twitter' | 'facebook';
  status: 'connected' | 'setup-needed' | 'not-connected';
  timeRange: string;
}

export default function PlatformCard({ platform, status, timeRange }: PlatformCardProps) {
  // Platform-specific styling
  const getStyles = () => {
    switch (platform) {
      case 'youtube':
        return {
          iconName: 'smart_display',
          textColor: 'text-youtube',
          bgColor: 'bg-youtube',
          bgOpacity: 'bg-opacity-10',
        };
      case 'instagram':
        return {
          iconName: 'camera_alt',
          textColor: 'text-instagram',
          bgColor: 'bg-instagram',
          bgOpacity: 'bg-opacity-10',
        };
      case 'twitter':
        return {
          iconName: 'chat',
          textColor: 'text-twitter',
          bgColor: 'bg-twitter',
          bgOpacity: 'bg-opacity-10',
        };
      case 'facebook':
        return {
          iconName: 'thumb_up',
          textColor: 'text-facebook',
          bgColor: 'bg-facebook',
          bgOpacity: 'bg-opacity-10',
        };
    }
  };

  const styles = getStyles();
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);

  // Platform-specific statistics
  const getStats = () => {
    switch (platform) {
      case 'youtube':
        return [
          { label: 'Subscribers', key: 'subscribers' },
          { label: 'Total Views', key: 'views' },
          { label: 'Watch Time (hrs)', key: 'watchTime' },
          { label: 'Avg. View Duration', key: 'avgViewDuration' },
        ];
      case 'instagram':
        return [
          { label: 'Followers', key: 'followers' },
          { label: 'Engagement Rate', key: 'engagementRate' },
          { label: 'Reach', key: 'reach' },
          { label: 'Impressions', key: 'impressions' },
        ];
      case 'twitter':
        return [
          { label: 'Followers', key: 'followers' },
          { label: 'Retweets', key: 'retweets' },
          { label: 'Likes', key: 'likes' },
          { label: 'Impressions', key: 'impressions' },
        ];
      case 'facebook':
        return [
          { label: 'Page Likes', key: 'pageLikes' },
          { label: 'Reach', key: 'reach' },
          { label: 'Engagement', key: 'engagement' },
          { label: 'Post Impressions', key: 'postImpressions' },
        ];
    }
  };

  const stats = getStats();

  // If platform is not connected, show empty card with setup message
  if (status === 'not-connected' || status === 'setup-needed') {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className={`${styles.bgColor} ${styles.bgOpacity} px-6 py-4 border-b border-gray-200`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className={`material-icons ${styles.textColor} mr-2`}>{styles.iconName}</span>
              <h3 className="text-lg font-medium">{platformName}</h3>
            </div>
            <div>
              <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
                <span className="material-icons">more_vert</span>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-col items-center justify-center min-h-[300px]">
          <div className={`${styles.textColor} mb-4`}>
            <span className="material-icons text-5xl opacity-30">{styles.iconName}</span>
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            {status === 'setup-needed' ? 'Setup Required' : 'Not Connected'}
          </h4>
          <p className="text-gray-500 text-center mb-4">
            {status === 'setup-needed' 
              ? `You've started setting up your ${platformName} account. Complete the setup to view your data.` 
              : `Connect your ${platformName} account to view analytics data.`}
          </p>
          <a 
            href="/api-setup" 
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {status === 'setup-needed' ? 'Complete Setup' : 'Connect Account'}
          </a>
        </div>
      </div>
    );
  }

  // Platform is connected, show actual card with data
  // Define data types
  interface AnalyticsItem {
    id: number;
    userId: number;
    platform: string;
    dataType: string;
    data: any;
    fetchedAt: string;
  }
  
  // Fetch analytics data for this platform
  const { data: analyticsData } = useQuery<AnalyticsItem[]>({
    queryKey: [`/api/platform-data/${platform}/analytics`, timeRange],
    enabled: status === 'connected',
  });
  
  // Fetch top content for this platform
  const { data: topContentData } = useQuery<AnalyticsItem[]>({
    queryKey: [`/api/platform-data/${platform}/top-content`, timeRange],
    enabled: status === 'connected',
  });
  
  // Get the analytics data for the platform
  const getAnalyticsValue = (key: string) => {
    if (!analyticsData || analyticsData.length === 0) {
      return { value: 0, change: 0 };
    }
    
    const data = analyticsData[0].data;
    
    return { 
      value: data ? data[key] || 0 : 0, 
      change: data && data.growth ? data.growth[key] || 0 : 0
    };
  };
  
  // Get top content data
  const getTopContent = () => {
    if (!topContentData || topContentData.length === 0) {
      return [];
    }
    
    return topContentData[0] && topContentData[0].data ? topContentData[0].data : [];
  };
  
  const formatValue = (value: number, key: string) => {
    if (key === 'engagementRate') {
      return `${value.toFixed(2)}%`;
    }
    if (value > 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value > 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className={`${styles.bgColor} ${styles.bgOpacity} px-6 py-4 border-b border-gray-200`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className={`material-icons ${styles.textColor} mr-2`}>{styles.iconName}</span>
            <h3 className="text-lg font-medium">{platformName}</h3>
          </div>
          <div>
            <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
              <span className="material-icons">more_vert</span>
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          {stats.map((stat, index) => {
            const { value, change } = getAnalyticsValue(stat.key);
            
            return (
              <div key={index}>
                <h4 className="text-sm font-medium text-gray-500 mb-1">{stat.label}</h4>
                <div className="flex items-baseline">
                  <p className="text-xl font-bold text-gray-900">{formatValue(value, stat.key)}</p>
                  {change !== 0 && (
                    <p className={`ml-2 text-xs ${change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {change > 0 ? '+' : ''}{change}%
                    </p>
                  )}
                  {change === 0 && (
                    <p className="ml-2 text-xs text-gray-400">
                      0%
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {platform === 'youtube' && (
          <>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Top Performing Videos</h4>
            <div className="space-y-3">
              {getTopContent().length > 0 ? (
                getTopContent().slice(0, 3).map((video: any) => (
                  <div key={video.id} className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <div className="w-20 h-12 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                      {video.thumbnail ? (
                        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="material-icons text-gray-400">play_circle</span>
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-700 line-clamp-1">{video.title}</p>
                      <div className="flex space-x-2 text-xs text-gray-500">
                        <span>{formatValue(video.views, 'views')} views</span>
                        <span>•</span>
                        <span>{formatValue(video.likes, 'likes')} likes</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center p-2 bg-gray-50 rounded-lg">
                  <div className="w-20 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <span className="material-icons text-gray-400">play_circle</span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">No videos found</p>
                    <p className="text-xs text-gray-500">Connect your YouTube account to see video performance</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {platform === 'instagram' && (
          <>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Top Performing Posts</h4>
            <div className="grid grid-cols-3 gap-2">
              {getTopContent().length > 0 ? (
                getTopContent().slice(0, 6).map((post: any) => (
                  <div key={post.id} className="aspect-square bg-gray-200 rounded-md overflow-hidden">
                    {post.imageUrl ? (
                      <img src={post.imageUrl} alt="Instagram post" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-icons text-gray-400">image</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                Array(6).fill(0).map((_, index) => (
                  <div key={index} className="aspect-square bg-gray-200 rounded-md flex items-center justify-center">
                    <span className="material-icons text-gray-400">image</span>
                  </div>
                ))
              )}
            </div>
          </>
        )}
        
        {platform === 'twitter' && (
          <>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Top Performing Tweets</h4>
            <div className="space-y-3">
              {getTopContent().length > 0 ? (
                getTopContent().slice(0, 2).map((tweet: any) => (
                  <div key={tweet.id} className="p-3 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-800 mb-2">{tweet.text}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <div className="flex space-x-3">
                        <span className="flex items-center">
                          <span className="material-icons text-xs mr-1">favorite</span>
                          {formatValue(tweet.likes, 'likes')}
                        </span>
                        <span className="flex items-center">
                          <span className="material-icons text-xs mr-1">repeat</span>
                          {formatValue(tweet.retweets, 'retweets')}
                        </span>
                        <span className="flex items-center">
                          <span className="material-icons text-xs mr-1">chat_bubble_outline</span>
                          {formatValue(tweet.replies, 'replies')}
                        </span>
                      </div>
                      <span>{new Date(tweet.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-500 text-center">No tweets found</p>
                </div>
              )}
            </div>
          </>
        )}
        
        {platform === 'facebook' && (
          <>
            <h4 className="text-sm font-medium text-gray-500 mb-2">Top Performing Posts</h4>
            <div className="space-y-3">
              {getTopContent().length > 0 ? (
                getTopContent().slice(0, 2).map((post: any) => (
                  <div key={post.id} className="p-3 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-800 mb-2">{post.text}</p>
                    {post.imageUrl && (
                      <div className="mb-2 h-40 bg-gray-200 rounded overflow-hidden">
                        <img src={post.imageUrl} alt="Facebook post" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-gray-500">
                      <div className="flex space-x-3">
                        <span className="flex items-center">
                          <span className="material-icons text-xs mr-1">thumb_up</span>
                          {formatValue(post.reactions, 'reactions')}
                        </span>
                        <span className="flex items-center">
                          <span className="material-icons text-xs mr-1">comment</span>
                          {formatValue(post.comments, 'comments')}
                        </span>
                        <span className="flex items-center">
                          <span className="material-icons text-xs mr-1">share</span>
                          {formatValue(post.shares, 'shares')}
                        </span>
                      </div>
                      <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-500 text-center">No posts found</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
