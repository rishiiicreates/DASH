import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { ApiKey } from '@/types';

// Form schemas
const youtubeSchema = z.object({
  apiKey: z.string().min(1, "API Key is required")
});

const instagramSchema = z.object({
  accessToken: z.string().min(1, "Access Token is required")
});

const twitterSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  apiSecret: z.string().min(1, "API Secret is required"),
  accessToken: z.string().min(1, "Access Token is required"),
  accessTokenSecret: z.string().min(1, "Access Token Secret is required")
});

const facebookSchema = z.object({
  appId: z.string().min(1, "App ID is required"),
  appSecret: z.string().min(1, "App Secret is required"),
  accessToken: z.string().min(1, "Access Token is required")
});

export default function ApiSetup() {
  const { toast } = useToast();
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);

  // YouTube form
  const youtubeForm = useForm<z.infer<typeof youtubeSchema>>({
    resolver: zodResolver(youtubeSchema),
    defaultValues: {
      apiKey: ''
    }
  });

  // Instagram form
  const instagramForm = useForm<z.infer<typeof instagramSchema>>({
    resolver: zodResolver(instagramSchema),
    defaultValues: {
      accessToken: ''
    }
  });

  // Twitter form
  const twitterForm = useForm<z.infer<typeof twitterSchema>>({
    resolver: zodResolver(twitterSchema),
    defaultValues: {
      apiKey: '',
      apiSecret: '',
      accessToken: '',
      accessTokenSecret: ''
    }
  });

  // Facebook form
  const facebookForm = useForm<z.infer<typeof facebookSchema>>({
    resolver: zodResolver(facebookSchema),
    defaultValues: {
      appId: '',
      appSecret: '',
      accessToken: ''
    }
  });

  // Fetch existing API keys
  const { data: apiKeys, isLoading } = useQuery<ApiKey[]>({
    queryKey: ['/api/api-keys'],
  });

  // Update form values from fetched API keys
  useState(() => {
    if (apiKeys) {
      const youtubeKey = apiKeys.find(key => key.platform === 'youtube');
      if (youtubeKey) {
        youtubeForm.setValue('apiKey', youtubeKey.apiKey || '');
      }

      const instagramKey = apiKeys.find(key => key.platform === 'instagram');
      if (instagramKey) {
        instagramForm.setValue('accessToken', instagramKey.accessToken || '');
      }

      const twitterKey = apiKeys.find(key => key.platform === 'twitter');
      if (twitterKey) {
        twitterForm.setValue('apiKey', twitterKey.apiKey || '');
        twitterForm.setValue('apiSecret', twitterKey.apiSecret || '');
        twitterForm.setValue('accessToken', twitterKey.accessToken || '');
        twitterForm.setValue('accessTokenSecret', twitterKey.accessTokenSecret || '');
      }

      const facebookKey = apiKeys.find(key => key.platform === 'facebook');
      if (facebookKey) {
        facebookForm.setValue('appId', facebookKey.apiKey || '');
        facebookForm.setValue('appSecret', facebookKey.apiSecret || '');
        facebookForm.setValue('accessToken', facebookKey.accessToken || '');
      }
    }
  });

  // API key mutation
  const apiKeyMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/api-keys', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/api-keys'] });
      toast({
        title: "API key updated",
        description: "Your API key has been successfully updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: (error as Error).message || "Failed to update API key",
        variant: "destructive",
      });
    }
  });

  const onSubmitYoutube = (data: z.infer<typeof youtubeSchema>) => {
    apiKeyMutation.mutate({
      platform: 'youtube',
      apiKey: data.apiKey
    });
  };

  const onSubmitInstagram = (data: z.infer<typeof instagramSchema>) => {
    apiKeyMutation.mutate({
      platform: 'instagram',
      accessToken: data.accessToken
    });
  };

  const onSubmitTwitter = (data: z.infer<typeof twitterSchema>) => {
    apiKeyMutation.mutate({
      platform: 'twitter',
      apiKey: data.apiKey,
      apiSecret: data.apiSecret,
      accessToken: data.accessToken,
      accessTokenSecret: data.accessTokenSecret
    });
  };

  const onSubmitFacebook = (data: z.infer<typeof facebookSchema>) => {
    apiKeyMutation.mutate({
      platform: 'facebook',
      apiKey: data.appId,
      apiSecret: data.appSecret,
      accessToken: data.accessToken
    });
  };

  const getPlatformStatus = (platform: string): 'connected' | 'setup-needed' | 'not-connected' => {
    if (isLoading || !apiKeys) return 'not-connected';
    
    const platformKey = apiKeys.find(key => key.platform === platform);
    if (!platformKey) return 'not-connected';
    
    return platformKey.isConnected ? 'connected' : 'setup-needed';
  };

  const renderStatusBadge = (status: 'connected' | 'setup-needed' | 'not-connected') => {
    if (status === 'connected') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Connected
        </span>
      );
    } else if (status === 'setup-needed') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Setup Required
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Not Connected
        </span>
      );
    }
  };

  return (
    <div>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">API Setup</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="overflow-hidden mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Connect Your Platforms</h3>
            <p className="mt-1 text-sm text-gray-500">Follow the instructions below to connect your social media accounts.</p>
          </div>

          <div className="px-6 py-4">
            {/* YouTube API Setup */}
            <div className="border border-gray-200 rounded-lg mb-6">
              <div 
                className="flex items-center bg-gray-50 px-4 py-3 border-b border-gray-200 cursor-pointer"
                onClick={() => setExpandedPlatform(expandedPlatform === 'youtube' ? null : 'youtube')}
              >
                <div className="w-10 h-10 flex items-center justify-center bg-youtube bg-opacity-10 rounded-lg mr-4">
                  <span className="material-icons text-youtube">smart_display</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">YouTube API Setup</h4>
                  <p className="text-sm text-gray-500">Connect to YouTube Analytics API</p>
                </div>
                <div>
                  {renderStatusBadge(getPlatformStatus('youtube'))}
                </div>
              </div>

              {expandedPlatform === 'youtube' && (
                <div className="p-4">
                  <Form {...youtubeForm}>
                    <form onSubmit={youtubeForm.handleSubmit(onSubmitYoutube)} className="space-y-4">
                      <FormField
                        control={youtubeForm.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>YouTube API Key</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your YouTube API Key" 
                                {...field} 
                                className="font-mono text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="rounded-lg bg-gray-50 p-4 mb-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">How to get your YouTube API Key</h5>
                        <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                          <li>Go to the <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-blue-700">Google Developers Console</a></li>
                          <li>Create a new project or select an existing one</li>
                          <li>Navigate to "APIs & Services" &gt; "Library"</li>
                          <li>Search for "YouTube Data API v3" and enable it</li>
                          <li>Go to "Credentials" and create an API key</li>
                          <li>Copy your API key and paste it above</li>
                        </ol>
                      </div>

                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <span className="material-icons text-yellow-400">warning</span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                              Make sure you have YouTube Analytics API enabled for your project in Google Developers Console.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={apiKeyMutation.isPending}
                        >
                          {apiKeyMutation.isPending ? 'Saving...' : 'Save API Key'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}
            </div>

            {/* Instagram API Setup */}
            <div className="border border-gray-200 rounded-lg mb-6">
              <div 
                className="flex items-center bg-gray-50 px-4 py-3 border-b border-gray-200 cursor-pointer"
                onClick={() => setExpandedPlatform(expandedPlatform === 'instagram' ? null : 'instagram')}
              >
                <div className="w-10 h-10 flex items-center justify-center bg-instagram bg-opacity-10 rounded-lg mr-4">
                  <span className="material-icons text-instagram">camera_alt</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Instagram API Setup</h4>
                  <p className="text-sm text-gray-500">Connect to Instagram Graph API</p>
                </div>
                <div>
                  {renderStatusBadge(getPlatformStatus('instagram'))}
                </div>
              </div>

              {expandedPlatform === 'instagram' && (
                <div className="p-4">
                  <Form {...instagramForm}>
                    <form onSubmit={instagramForm.handleSubmit(onSubmitInstagram)} className="space-y-4">
                      <FormField
                        control={instagramForm.control}
                        name="accessToken"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Instagram Access Token</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your Instagram Access Token" 
                                {...field} 
                                className="font-mono text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="rounded-lg bg-gray-50 p-4 mb-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">How to get your Instagram Access Token</h5>
                        <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                          <li>Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-blue-700">Facebook for Developers</a> and create an app</li>
                          <li>Add the Instagram Basic Display product to your app</li>
                          <li>Configure your app and add Instagram Test Users</li>
                          <li>Generate a User Token for your Instagram account</li>
                          <li>Copy the Access Token and paste it above</li>
                        </ol>
                      </div>

                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <span className="material-icons text-yellow-400">warning</span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-yellow-700">
                              Instagram Access Tokens expire after 60 days. Set up token refresh to avoid interruptions.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={apiKeyMutation.isPending}
                        >
                          {apiKeyMutation.isPending ? 'Saving...' : 'Save Access Token'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}
            </div>

            {/* Twitter API Setup */}
            <div className="border border-gray-200 rounded-lg mb-6">
              <div 
                className="flex items-center bg-gray-50 px-4 py-3 border-b border-gray-200 cursor-pointer"
                onClick={() => setExpandedPlatform(expandedPlatform === 'twitter' ? null : 'twitter')}
              >
                <div className="w-10 h-10 flex items-center justify-center bg-twitter bg-opacity-10 rounded-lg mr-4">
                  <span className="material-icons text-twitter">chat</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Twitter API Setup</h4>
                  <p className="text-sm text-gray-500">Connect to Twitter API v2</p>
                </div>
                <div>
                  {renderStatusBadge(getPlatformStatus('twitter'))}
                </div>
              </div>

              {expandedPlatform === 'twitter' && (
                <div className="p-4">
                  <Form {...twitterForm}>
                    <form onSubmit={twitterForm.handleSubmit(onSubmitTwitter)} className="space-y-4">
                      <FormField
                        control={twitterForm.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter API Key</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your Twitter API Key" 
                                {...field} 
                                className="font-mono text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={twitterForm.control}
                        name="apiSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter API Secret</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Enter your Twitter API Secret" 
                                {...field} 
                                className="font-mono text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={twitterForm.control}
                        name="accessToken"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter Access Token</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your Twitter Access Token" 
                                {...field} 
                                className="font-mono text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={twitterForm.control}
                        name="accessTokenSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Twitter Access Token Secret</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Enter your Twitter Access Token Secret" 
                                {...field} 
                                className="font-mono text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="rounded-lg bg-gray-50 p-4 mb-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">How to get your Twitter API credentials</h5>
                        <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                          <li>Apply for a <a href="https://developer.twitter.com/en/apply-for-access" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-blue-700">Twitter Developer Account</a></li>
                          <li>Create a new project and app in the Twitter Developer Portal</li>
                          <li>Navigate to the "Keys and Tokens" tab</li>
                          <li>Generate "Consumer Keys" and "Access Token and Secret"</li>
                          <li>Copy and paste them in the fields above</li>
                        </ol>
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={apiKeyMutation.isPending}
                        >
                          {apiKeyMutation.isPending ? 'Connecting...' : 'Connect Twitter'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}
            </div>

            {/* Facebook API Setup */}
            <div className="border border-gray-200 rounded-lg">
              <div 
                className="flex items-center bg-gray-50 px-4 py-3 border-b border-gray-200 cursor-pointer"
                onClick={() => setExpandedPlatform(expandedPlatform === 'facebook' ? null : 'facebook')}
              >
                <div className="w-10 h-10 flex items-center justify-center bg-facebook bg-opacity-10 rounded-lg mr-4">
                  <span className="material-icons text-facebook">thumb_up</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">Facebook API Setup</h4>
                  <p className="text-sm text-gray-500">Connect to Facebook Graph API</p>
                </div>
                <div>
                  {renderStatusBadge(getPlatformStatus('facebook'))}
                </div>
              </div>

              {expandedPlatform === 'facebook' && (
                <div className="p-4">
                  <Form {...facebookForm}>
                    <form onSubmit={facebookForm.handleSubmit(onSubmitFacebook)} className="space-y-4">
                      <FormField
                        control={facebookForm.control}
                        name="appId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook App ID</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your Facebook App ID" 
                                {...field} 
                                className="font-mono text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={facebookForm.control}
                        name="appSecret"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook App Secret</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Enter your Facebook App Secret" 
                                {...field} 
                                className="font-mono text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={facebookForm.control}
                        name="accessToken"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Facebook Access Token</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your Facebook Access Token" 
                                {...field} 
                                className="font-mono text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="rounded-lg bg-gray-50 p-4 mb-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">How to get your Facebook API credentials</h5>
                        <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                          <li>Go to <a href="https://developers.facebook.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-blue-700">Facebook for Developers</a> and create an app</li>
                          <li>Configure the app with required permissions</li>
                          <li>Navigate to the "Settings" &gt; "Basic" section to find your App ID and App Secret</li>
                          <li>Use the Graph API Explorer to generate an Access Token with the required permissions</li>
                          <li>Copy and paste the credentials in the fields above</li>
                        </ol>
                      </div>

                      <div className="flex justify-end">
                        <Button 
                          type="submit" 
                          disabled={apiKeyMutation.isPending}
                        >
                          {apiKeyMutation.isPending ? 'Connecting...' : 'Connect Facebook'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
