import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/context';
import { apiRequest } from '@/lib/queryClient';
import { createApiClient } from '@/lib/apiClients';
import { Platform, ApiKey } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Check, X } from 'lucide-react';

// Form schema for account settings
const accountSchema = z.object({
  displayName: z.string().min(1, "Display name is required"),
  email: z.string().email("Please enter a valid email").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
  confirmPassword: z.string().optional(),
}).refine(data => {
  if (data.password && data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Form schema for API keys
const apiKeySchema = z.object({
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  accessToken: z.string().optional(),
  accessTokenSecret: z.string().optional(),
});

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [activePlatform, setActivePlatform] = useState<Platform>('youtube');
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Account settings form
  const accountForm = useForm<z.infer<typeof accountSchema>>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      email: user?.email || '',
      password: '',
      confirmPassword: '',
    },
  });

  // API keys form
  const apiKeyForm = useForm<z.infer<typeof apiKeySchema>>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      apiKey: '',
      apiSecret: '',
      accessToken: '',
      accessTokenSecret: '',
    },
  });

  // Fetch API keys on component mount
  useEffect(() => {
    const fetchApiKeys = async () => {
      try {
        const response = await apiRequest('GET', '/api/api-keys');
        const data = await response.json();
        setApiKeys(data);
        
        // Fill form with existing API keys for the active platform
        const platformKey = data.find((key: ApiKey) => key.platform === activePlatform);
        if (platformKey) {
          apiKeyForm.reset({
            apiKey: platformKey.apiKey || '',
            apiSecret: platformKey.apiSecret || '',
            accessToken: platformKey.accessToken || '',
            accessTokenSecret: platformKey.accessTokenSecret || '',
          });
        }
      } catch (error) {
        console.error('Error fetching API keys:', error);
      }
    };

    if (user) {
      fetchApiKeys();
    }
  }, [user, activePlatform]);

  // Handle account form submission
  const onAccountSubmit = async (data: z.infer<typeof accountSchema>) => {
    setLoading(true);
    setUpdateSuccess(false);
    
    try {
      // Import required Firebase functions
      const { updateUserProfile, changePassword } = await import('@/lib/firebase');
      
      // Update user profile
      await updateUserProfile(data.displayName);
      
      // Handle password change if provided
      if (data.password) {
        await changePassword(data.password);
      }
      
      setUpdateSuccess(true);
      toast({
        title: "Account settings updated",
        description: "Your account information has been successfully updated.",
      });
      
      // Refresh user display name in the UI
      window.location.reload();
    } catch (error) {
      toast({
        title: "Update failed",
        description: (error instanceof Error) ? error.message : "Failed to update account settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle API key form submission
  const onApiKeySubmit = async (data: z.infer<typeof apiKeySchema>) => {
    setLoading(true);
    setUpdateSuccess(false);
    
    try {
      const apiClient = createApiClient(activePlatform);
      const result = await apiClient.saveCredentials(data);
      
      if (result) {
        setUpdateSuccess(true);
        toast({
          title: "API keys updated",
          description: `Your ${activePlatform} API keys have been successfully updated.`,
        });
        
        // Refresh API keys after update
        const response = await apiRequest('GET', '/api/api-keys');
        const updatedKeys = await response.json();
        setApiKeys(updatedKeys);
      } else {
        throw new Error('Failed to update API keys');
      }
    } catch (error) {
      toast({
        title: "Update failed",
        description: `Failed to update ${activePlatform} API keys. Please check your credentials and try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get connection status for a platform
  const getConnectionStatus = (platform: Platform) => {
    const key = apiKeys.find(key => key.platform === platform);
    return key?.isConnected || false;
  };

  // Return JSX
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 lg:w-96">
          <TabsTrigger value="account">Account Settings</TabsTrigger>
          <TabsTrigger value="apiKeys">API Connections</TabsTrigger>
        </TabsList>
        
        {/* Account Settings Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              {updateSuccess && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    Your account settings have been updated successfully.
                  </AlertDescription>
                </Alert>
              )}
              
              <Form {...accountForm}>
                <form onSubmit={accountForm.handleSubmit(onAccountSubmit)} className="space-y-6">
                  <FormField
                    control={accountForm.control}
                    name="displayName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={accountForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input {...field} disabled />
                        </FormControl>
                        <FormDescription>
                          Email cannot be changed. To use a different email, please log out and sign in with another account.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Separator className="my-4" />
                  <h3 className="text-lg font-medium mb-4">Change Password</h3>
                  
                  <FormField
                    control={accountForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                          Leave blank if you don't want to change your password
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={accountForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* API Keys Tab */}
        <TabsContent value="apiKeys">
          <Card>
            <CardHeader>
              <CardTitle>Manage API Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <Button 
                  variant={activePlatform === 'youtube' ? 'default' : 'outline'} 
                  onClick={() => setActivePlatform('youtube')}
                  className="justify-start"
                >
                  <span className={`material-icons mr-2 ${getConnectionStatus('youtube') ? 'text-green-500' : 'text-red-500'}`}>
                    {getConnectionStatus('youtube') ? 'check_circle' : 'cancel'}
                  </span>
                  YouTube
                </Button>
                
                <Button 
                  variant={activePlatform === 'instagram' ? 'default' : 'outline'} 
                  onClick={() => setActivePlatform('instagram')}
                  className="justify-start"
                >
                  <span className={`material-icons mr-2 ${getConnectionStatus('instagram') ? 'text-green-500' : 'text-red-500'}`}>
                    {getConnectionStatus('instagram') ? 'check_circle' : 'cancel'}
                  </span>
                  Instagram
                </Button>
                
                <Button 
                  variant={activePlatform === 'twitter' ? 'default' : 'outline'} 
                  onClick={() => setActivePlatform('twitter')}
                  className="justify-start"
                >
                  <span className={`material-icons mr-2 ${getConnectionStatus('twitter') ? 'text-green-500' : 'text-red-500'}`}>
                    {getConnectionStatus('twitter') ? 'check_circle' : 'cancel'}
                  </span>
                  Twitter
                </Button>
                
                <Button 
                  variant={activePlatform === 'facebook' ? 'default' : 'outline'} 
                  onClick={() => setActivePlatform('facebook')}
                  className="justify-start"
                >
                  <span className={`material-icons mr-2 ${getConnectionStatus('facebook') ? 'text-green-500' : 'text-red-500'}`}>
                    {getConnectionStatus('facebook') ? 'check_circle' : 'cancel'}
                  </span>
                  Facebook
                </Button>
              </div>
              
              {updateSuccess && (
                <Alert className="mb-4 bg-green-50 border-green-200">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    Your {activePlatform} API keys have been updated successfully.
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="mb-4">
                <h3 className="text-lg font-medium capitalize">{activePlatform} API Keys</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Enter your {activePlatform} API credentials below. 
                  These are used to connect to your {activePlatform} account and retrieve analytics data.
                </p>
                
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mt-2">
                  <div className="flex">
                    <span className="material-icons text-amber-500 mr-2">warning</span>
                    <div>
                      <p className="text-sm text-amber-700 font-medium">API Keys Required</p>
                      <p className="text-xs text-amber-600 mt-1">
                        You must provide your own {activePlatform} API keys to fetch real data from the platform.
                        Without valid credentials, the dashboard will not display your actual analytics.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Form {...apiKeyForm}>
                <form onSubmit={apiKeyForm.handleSubmit(onApiKeySubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={apiKeyForm.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={apiKeyForm.control}
                      name="apiSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Secret</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {(activePlatform === 'twitter' || activePlatform === 'instagram') && (
                      <>
                        <FormField
                          control={apiKeyForm.control}
                          name="accessToken"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Access Token</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={apiKeyForm.control}
                          name="accessTokenSecret"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Access Token Secret</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}
                  </div>
                  
                  <div className="flex space-x-4">
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Saving...' : 'Save API Keys'}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => apiKeyForm.reset()}
                      disabled={loading}
                    >
                      Reset
                    </Button>
                  </div>
                </form>
              </Form>
              
              <div className="mt-8">
                <h4 className="font-medium mb-2">How to get {activePlatform} API credentials:</h4>
                
                {activePlatform === 'youtube' && (
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Go to the <a href="https://console.developers.google.com/" target="_blank" className="text-primary underline">Google Developer Console</a></li>
                    <li>Create a new project or select an existing one</li>
                    <li>Enable the YouTube Data API v3</li>
                    <li>Create credentials (OAuth client ID for web application)</li>
                    <li>Copy the API Key and API Secret</li>
                  </ol>
                )}
                
                {activePlatform === 'instagram' && (
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Go to <a href="https://developers.facebook.com/" target="_blank" className="text-primary underline">Facebook for Developers</a></li>
                    <li>Create a new app or select an existing one</li>
                    <li>Add the Instagram Graph API product</li>
                    <li>Set up the app and get your access tokens</li>
                    <li>Copy the API Key, API Secret, Access Token, and Access Token Secret</li>
                  </ol>
                )}
                
                {activePlatform === 'twitter' && (
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Go to the <a href="https://developer.twitter.com/en/portal/dashboard" target="_blank" className="text-primary underline">Twitter Developer Portal</a></li>
                    <li>Create a new project and app or select an existing one</li>
                    <li>Navigate to the "Keys and tokens" tab</li>
                    <li>Generate Consumer Keys (API Key and Secret) and Access Tokens</li>
                    <li>Copy the API Key, API Secret, Access Token, and Access Token Secret</li>
                  </ol>
                )}
                
                {activePlatform === 'facebook' && (
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>Go to <a href="https://developers.facebook.com/" target="_blank" className="text-primary underline">Facebook for Developers</a></li>
                    <li>Create a new app or select an existing one</li>
                    <li>Add the Facebook Graph API product</li>
                    <li>Navigate to the App Dashboard and find your App ID and App Secret</li>
                    <li>Copy the API Key and API Secret</li>
                  </ol>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}