import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { initiateRazorpayPayment } from '@/lib/razorpay';
import { useAuth } from '@/lib/context';

const cardSchema = z.object({
  cardNumber: z.string().min(16, "Card number must be 16 digits").max(19),
  expirationDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiration date must be in MM/YY format"),
  cvc: z.string().min(3, "CVC must be at least 3 digits").max(4),
  nameOnCard: z.string().min(1, "Name on card is required"),
  terms: z.boolean().refine(val => val === true, { message: "You must agree to the terms" })
});

export default function Subscription() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'business' | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Subscription form
  const form = useForm<z.infer<typeof cardSchema>>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      cardNumber: '',
      expirationDate: '',
      cvc: '',
      nameOnCard: '',
      terms: false
    }
  });

  // Fetch current subscription
  const { data: subscription } = useQuery({
    queryKey: ['/api/subscriptions'],
    enabled: !!user,
  });

  // Payment verification mutation
  const paymentMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('POST', '/api/verify-payment', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscriptions'] });
      toast({
        title: "Payment successful",
        description: "Your subscription has been activated",
      });
      setShowPaymentModal(false);
    },
    onError: (error) => {
      toast({
        title: "Payment failed",
        description: (error as Error).message || "Failed to process payment",
        variant: "destructive",
      });
    }
  });

  const handleUpgrade = (plan: 'pro' | 'business') => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const onSubmit = async (data: z.infer<typeof cardSchema>) => {
    if (!selectedPlan) return;

    try {
      // Use Razorpay for payment
      const amount = selectedPlan === 'pro' ? 2900 : 9900; // In cents
      const response = await initiateRazorpayPayment({
        amount,
        currency: 'USD',
        name: 'DashMetrics',
        description: `${selectedPlan === 'pro' ? 'Pro' : 'Business'} Plan Subscription`,
        prefill: {
          name: data.nameOnCard,
          contact: '',
          email: user?.email || ''
        }
      });

      // Verify payment on the server
      if (response.razorpay_payment_id) {
        await paymentMutation.mutateAsync({
          paymentId: response.razorpay_payment_id,
          subscriptionPlan: selectedPlan,
          amount
        });
      }
    } catch (error) {
      toast({
        title: "Payment failed",
        description: (error as Error).message || "Failed to process payment",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-semibold text-gray-900">Subscription Plans</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Choose the Right Plan for Your Needs
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Upgrade your account to unlock advanced features and historical data.
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:grid-cols-3">
          {/* Free Plan */}
          <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Free</h3>
              <p className="mt-4 text-sm text-gray-500">Perfect for getting started with basic analytics.</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$0</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              <Button 
                variant="secondary" 
                className="mt-8 block w-full"
                disabled={subscription?.plan === 'free'}
              >
                {subscription?.plan === 'free' ? 'Current Plan' : 'Downgrade to Free'}
              </Button>
            </div>
            <div className="pt-6 pb-8 px-6">
              <h4 className="text-sm font-medium text-gray-900 tracking-wide">What's included</h4>
              <ul className="mt-6 space-y-4">
                <li className="flex space-x-3">
                  <span className="material-icons text-green-500 flex-shrink-0">check</span>
                  <span className="text-sm text-gray-500">7-day data history</span>
                </li>
                <li className="flex space-x-3">
                  <span className="material-icons text-green-500 flex-shrink-0">check</span>
                  <span className="text-sm text-gray-500">Basic analytics for all platforms</span>
                </li>
                <li className="flex space-x-3">
                  <span className="material-icons text-green-500 flex-shrink-0">check</span>
                  <span className="text-sm text-gray-500">Connect up to 2 accounts per platform</span>
                </li>
                <li className="flex space-x-3">
                  <span className="material-icons text-green-500 flex-shrink-0">check</span>
                  <span className="text-sm text-gray-500">Daily data refresh</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="border border-primary rounded-lg shadow-sm divide-y divide-gray-200 bg-white relative">
            {subscription?.plan !== 'pro' && (
              <div className="absolute -top-5 right-6">
                <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-primary">
                  Popular
                </span>
              </div>
            )}
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Pro</h3>
              <p className="mt-4 text-sm text-gray-500">Everything you need for professional social media management.</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$29</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              {subscription?.plan === 'pro' ? (
                <Button className="mt-8 block w-full bg-gray-200 text-gray-700 hover:bg-gray-300" variant="secondary">
                  Current Plan
                </Button>
              ) : (
                <Button 
                  className="mt-8 block w-full" 
                  onClick={() => handleUpgrade('pro')}
                >
                  Upgrade to Pro
                </Button>
              )}
            </div>
            <div className="pt-6 pb-8 px-6">
              <h4 className="text-sm font-medium text-gray-900 tracking-wide">What's included</h4>
              <ul className="mt-6 space-y-4">
                <li className="flex space-x-3">
                  <span className="material-icons text-green-500 flex-shrink-0">check</span>
                  <span className="text-sm text-gray-500">90-day data history</span>
                </li>
                <li className="flex space-x-3">
                  <span className="material-icons text-green-500 flex-shrink-0">check</span>
                  <span className="text-sm text-gray-500">Advanced analytics and reporting</span>
                </li>
                <li className="flex space-x-3">
                  <span className="material-icons text-green-500 flex-shrink-0">check</span>
                  <span className="text-sm text-gray-500">Connect up to 5 accounts per platform</span>
                </li>
                <li className="flex space-x-3">
                  <span className="material-icons text-green-500 flex-shrink-0">check</span>
                  <span className="text-sm text-gray-500">Hourly data refresh</span>
                </li>
                <li className="flex space-x-3">
                  <span className="material-icons text-green-500 flex-shrink-0">check</span>
                  <span className="text-sm text-gray-500">Export data in CSV/PDF format</span>
                </li>
                <li className="flex space-x-3">
                  <span className="material-icons text-green-500 flex-shrink-0">check</span>
                  <span className="text-sm text-gray-500">Email reports</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Business Plan */}
          <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900">Business</h3>
              <p className="mt-4 text-sm text-gray-500">Advanced features for agencies and large businesses.</p>
              <p className="mt-8">
                <span className="text-4xl font-extrabold text-gray-900">$99</span>
                <span className="text-base font-medium text-gray-500">/month</span>
              </p>
              {subscription?.plan === 'business' ? (
                <Button className="mt-8 block w-full bg-gray-200 text-gray-700 hover:bg-gray-300" variant="secondary">
                  Current Plan
                </Button>
              ) : (
                <Button 
                  className="mt-8 block w-full" 
                  variant="outline" 
                  onClick={() => handleUpgrade('business')}
                >
                  Upgrade to Business
                </Button>
              )}
            </div>
            <div className="pt-6 pb-8 px-6">
              <h4 className="text-sm font-medium text-gray-900 tracking-wide">What's included</h4>
              <ul className="mt-6 space-y-4">
                <li className="flex space-x-3">
                  <span className="material-icons text-green-500 flex-shrink-0">check</span>
                  <span className="text-sm text-gray-500">Unlimited data history</span>
                </li>
                <li className="flex space-x-3">
                  <span className="material-icons text-green-500 flex-shrink-0">check</span>
                  <span className="text-sm text-gray-500">Custom dashboards and reports</span>
                </li>
                <li className="flex space-x-3">
                  <span className="material-icons text-green-500 flex-shrink-0">check</span>
                  <span className="text-sm text-gray-500">Connect unlimited accounts</span>
                </li>
                <li className="flex space-x-3">
                  <span className="material-icons text-green-500 flex-shrink-0">check</span>
                  <span className="text-sm text-gray-500">Real-time data updates</span>
                </li>
                <li className="flex space-x-3">
                  <span className="material-icons text-green-500 flex-shrink-0">check</span>
                  <span className="text-sm text-gray-500">API access</span>
                </li>
                <li className="flex space-x-3">
                  <span className="material-icons text-green-500 flex-shrink-0">check</span>
                  <span className="text-sm text-gray-500">White-label reports</span>
                </li>
                <li className="flex space-x-3">
                  <span className="material-icons text-green-500 flex-shrink-0">check</span>
                  <span className="text-sm text-gray-500">Priority support</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Payment Modal */}
        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <div className="text-center mb-4">
                <div className="inline-block p-3 bg-primary bg-opacity-10 rounded-full">
                  <span className="material-icons text-primary text-2xl">payment</span>
                </div>
                <DialogTitle className="mt-4 text-lg font-medium text-gray-900">Complete Your Payment</DialogTitle>
                <DialogDescription className="mt-1 text-sm text-gray-500">
                  You'll be redirected to Razorpay to complete your payment securely.
                </DialogDescription>
              </div>
            </DialogHeader>
            <div className="mt-5 border-t border-gray-200 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Plan</span>
                <span className="text-sm font-medium">
                  {selectedPlan === 'pro' ? 'Pro Plan' : 'Business Plan'}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-500">Billing</span>
                <span className="text-sm font-medium">Monthly</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-sm text-gray-500">Total</span>
                <span className="text-sm font-medium">
                  ${selectedPlan === 'pro' ? '29.00' : '99.00'}
                </span>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="cardNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card number</FormLabel>
                      <FormControl>
                        <Input placeholder="1234 5678 9012 3456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="expirationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiration date (MM/YY)</FormLabel>
                        <FormControl>
                          <Input placeholder="MM/YY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cvc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVC</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="nameOnCard"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name on card</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-medium text-gray-700">
                          I agree to the <a href="#" className="text-primary hover:text-blue-700">Terms of Service</a> and <a href="#" className="text-primary hover:text-blue-700">Privacy Policy</a>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <div className="mt-6">
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={paymentMutation.isPending}
                  >
                    {paymentMutation.isPending ? 'Processing...' : 'Proceed to Payment'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
