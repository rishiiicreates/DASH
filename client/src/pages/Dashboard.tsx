import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { useAuth } from '@/lib/context';
import { apiRequest } from '@/lib/queryClient';
import ConnectionStatus from '@/components/ConnectionStatus';
import StatCard from '@/components/StatCard';
import PlatformCard from '@/components/PlatformCard';
import { User, ApiKey, SubscriptionPlan } from '@/types';

export default function Dashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');

  // Fetch user information
  const { data: userData } = useQuery<User>({
    queryKey: [`/api/users/${user?.uid}`],
    enabled: !!user,
  });

  // Fetch API keys to determine connected platforms
  const { data: apiKeys } = useQuery<ApiKey[]>({
    queryKey: ['/api/api-keys'],
    enabled: !!user,
  });

  // Fetch subscription information
  const { data: subscription } = useQuery({
    queryKey: ['/api/subscriptions'],
    enabled: !!user,
  });

  const getPlatformStatus = (platform: string): 'connected' | 'setup-needed' | 'not-connected' => {
    if (!apiKeys) return 'not-connected';
    
    const platformKey = apiKeys.find(key => key.platform === platform);
    if (!platformKey) return 'not-connected';
    
    return platformKey.isConnected ? 'connected' : 'setup-needed';
  };

  const getDaysRemaining = (): number => {
    if (!subscription) return 0;
    
    const endDate = new Date(subscription.endDate);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <div className="flex items-center">
            <div className="relative mr-4">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="material-icons absolute left-3 top-2 text-gray-400">search</span>
            </div>
            <div className="flex space-x-4">
              <button className="text-gray-500 hover:text-gray-700 focus:outline-none relative">
                <span className="material-icons">notifications</span>
                <span className="absolute top-0 right-0 block w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="text-gray-500 hover:text-gray-700 focus:outline-none">
                <span className="material-icons">help_outline</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Welcome back, {userData?.displayName?.split(' ')[0] || 'User'}!</h2>
              <p className="text-gray-600 mt-1">Here's what's happening with your social accounts today.</p>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Data last updated:</span>
              <span className="text-sm font-medium">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
              <button className="ml-2 text-primary hover:text-blue-700 focus:outline-none">
                <span className="material-icons">refresh</span>
              </button>
            </div>
          </div>
          

        </div>

        {/* API Connection Status */}
        <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Connected Platforms</h3>
            <p className="mt-1 text-sm text-gray-500">Configure your social media API connections to start tracking metrics.</p>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <ConnectionStatus 
                platform="youtube" 
                status={getPlatformStatus('youtube')} 
                label="YouTube"
                icon="smart_display" 
              />
              <ConnectionStatus 
                platform="instagram" 
                status={getPlatformStatus('instagram')} 
                label="Instagram"
                icon="camera_alt" 
              />
              <ConnectionStatus 
                platform="twitter" 
                status={getPlatformStatus('twitter')} 
                label="Twitter"
                icon="chat" 
              />
              <ConnectionStatus 
                platform="facebook" 
                status={getPlatformStatus('facebook')} 
                label="Facebook"
                icon="thumb_up" 
              />
            </div>
            <div className="mt-4">
              <Link href="/api-setup" className="inline-flex items-center text-sm font-medium text-primary hover:text-blue-700">
                <span>Configure API connections</span>
                <span className="material-icons text-sm ml-1">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Subscription Status */}
        <div className="bg-white rounded-lg shadow mb-8 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">
                  {subscription?.plan === 'free' ? 'Free Plan' : 
                  subscription?.plan === 'pro' ? 'Pro Plan' : 
                  subscription?.plan === 'business' ? 'Business Plan' : 'Free Plan'}
                </h3>
                <p className="text-blue-100 text-sm">
                  {subscription?.plan === 'free' ? 'Access to limited data for 7 days' : 
                  subscription?.plan === 'pro' ? 'Access to 90 days of data and advanced analytics' : 
                  subscription?.plan === 'business' ? 'Unlimited data history and all premium features' : 
                  'Access to limited data for 7 days'}
                </p>
              </div>
              <div>
                {subscription?.plan === 'free' && (
                  <span className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {getDaysRemaining()} days remaining
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="p-6">
            {subscription?.plan === 'free' && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-500">
                    <p>Upgrade to unlock access to historical data and advanced analytics.</p>
                  </div>
                  <Link href="/subscription" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    Upgrade Now
                  </Link>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${(7 - getDaysRemaining()) / 7 * 100}%` }}
                  ></div>
                </div>
              </>
            )}
            {subscription?.plan !== 'free' && (
              <div className="text-sm text-gray-500">
                <p>Your premium subscription is active. Enjoy all the features!</p>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Overview */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard 
              title="Total Audience" 
              value="0" 
              change={0} 
              icon="people" 
            />
            <StatCard 
              title="Total Engagement" 
              value="0" 
              change={0} 
              icon="thumb_up" 
            />
            <StatCard 
              title="Total Reach" 
              value="0" 
              change={0} 
              icon="visibility" 
            />
            <StatCard 
              title="Content Performance" 
              value="0%" 
              change={0} 
              icon="trending_up" 
            />
          </div>
        </div>

        {/* Platform Specific Cards */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">Platform Insights</h3>
            <div className="relative">
              <select 
                className="pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              <span className="material-icons absolute right-2 top-2 text-gray-400 pointer-events-none">
                expand_more
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PlatformCard
              platform="youtube"
              status={getPlatformStatus('youtube')}
              timeRange={timeRange}
            />
            <PlatformCard
              platform="instagram"
              status={getPlatformStatus('instagram')}
              timeRange={timeRange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
