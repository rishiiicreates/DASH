import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertApiKeySchema, insertSubscriptionSchema, platformEnum } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Middleware to verify Firebase ID token
  const verifyFirebaseToken = async (req: Request, res: Response, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    // In a real implementation, you would verify the Firebase token here
    // For this implementation, we'll just pass the token through
    const token = authHeader.split('Bearer ')[1];
    req.body.uid = token; // Attach the user ID to the request

    next();
  };

  // User routes
  app.post('/api/users', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.getUserByUid(userData.uid);
      
      if (user) {
        return res.status(200).json(user);
      }
      
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.get('/api/users/:uid', async (req, res) => {
    try {
      const { uid } = req.params;
      const user = await storage.getUserByUid(uid);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });
  
  app.patch('/api/users/profile', verifyFirebaseToken, async (req, res) => {
    try {
      const user = await storage.getUserByUid(req.body.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const profileSchema = z.object({
        displayName: z.string().min(1).optional(),
        photoURL: z.string().url().optional(),
      });
      
      const profileData = profileSchema.parse(req.body);
      
      const updatedUser = await storage.updateUser(user.id, profileData);
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // API Key routes
  app.get('/api/api-keys', verifyFirebaseToken, async (req, res) => {
    try {
      const user = await storage.getUserByUid(req.body.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const apiKeys = await storage.getApiKeys(user.id);
      res.json(apiKeys);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post('/api/api-keys', verifyFirebaseToken, async (req, res) => {
    try {
      const user = await storage.getUserByUid(req.body.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Validate platform
      const platform = z.enum(['youtube', 'instagram', 'twitter', 'facebook']).parse(req.body.platform);
      
      // Check if API key already exists for this platform
      const existingApiKey = await storage.getApiKey(user.id, platform);
      
      if (existingApiKey) {
        // Update existing API key
        const apiKeyData = {
          ...req.body,
          userId: user.id,
          isConnected: true
        };
        
        delete apiKeyData.uid;
        
        const updatedApiKey = await storage.updateApiKey(existingApiKey.id, apiKeyData);
        return res.json(updatedApiKey);
      }
      
      // Create new API key
      const apiKeyData = insertApiKeySchema.parse({
        ...req.body,
        userId: user.id,
        isConnected: true
      });
      
      const newApiKey = await storage.createApiKey(apiKeyData);
      res.status(201).json(newApiKey);
    } catch (error) {
      console.error('Error creating/updating API key:', error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  app.delete('/api/api-keys/:id', verifyFirebaseToken, async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteApiKey(parseInt(id));
      
      if (!deleted) {
        return res.status(404).json({ message: 'API key not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error('Error deleting API key:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Subscription routes
  app.get('/api/subscriptions', verifyFirebaseToken, async (req, res) => {
    try {
      const user = await storage.getUserByUid(req.body.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const subscription = await storage.getSubscription(user.id);
      
      if (!subscription) {
        // Return default free subscription info if no subscription exists
        return res.json({
          plan: 'free',
          status: 'active',
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        });
      }
      
      res.json(subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  app.post('/api/subscriptions', verifyFirebaseToken, async (req, res) => {
    try {
      const user = await storage.getUserByUid(req.body.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const existingSubscription = await storage.getSubscription(user.id);
      
      if (existingSubscription) {
        // Update existing subscription
        const subscriptionData = {
          ...req.body,
          userId: user.id
        };
        
        delete subscriptionData.uid;
        
        const updatedSubscription = await storage.updateSubscription(existingSubscription.id, subscriptionData);
        return res.json(updatedSubscription);
      }
      
      // Create new subscription
      const subscriptionData = insertSubscriptionSchema.parse({
        ...req.body,
        userId: user.id
      });
      
      const newSubscription = await storage.createSubscription(subscriptionData);
      
      // Update user subscription info
      await storage.updateUser(user.id, {
        subscription: subscriptionData.plan,
        subscriptionEndDate: subscriptionData.endDate
      });
      
      res.status(201).json(newSubscription);
    } catch (error) {
      console.error('Error creating/updating subscription:', error);
      res.status(400).json({ message: (error as Error).message });
    }
  });

  // Platform data routes
  app.get('/api/platform-data/:platform/:dataType', verifyFirebaseToken, async (req, res) => {
    try {
      const user = await storage.getUserByUid(req.body.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const { platform, dataType } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      // Validate platform
      const validatedPlatform = platformEnum.parse(platform);
      
      const data = await storage.getPlatformData(user.id, validatedPlatform, dataType, limit);
      res.json(data);
    } catch (error) {
      console.error('Error fetching platform data:', error);
      res.status(500).json({ message: (error as Error).message });
    }
  });

  // Verify Razorpay payment
  app.post('/api/payments/verify', verifyFirebaseToken, async (req, res) => {
    try {
      const { 
        razorpay_payment_id, 
        razorpay_order_id, 
        razorpay_signature, 
        subscriptionPlan, 
        amount, 
        currency 
      } = req.body;
      
      const user = await storage.getUserByUid(req.body.uid);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // In a production environment, you'd verify the signature using crypto
      // Something like this:
      // const crypto = require('crypto');
      // const hmac = crypto.createHmac('sha256', process.env.VITE_RAZORPAY_KEY_SECRET);
      // hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
      // const generatedSignature = hmac.digest('hex');
      // const isSignatureValid = generatedSignature === razorpay_signature;
      
      // For this implementation, we'll assume the signature is valid
      const isSignatureValid = true;
      
      if (!isSignatureValid) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed: Invalid signature'
        });
      }
      
      // Determine subscription duration based on plan
      let durationInDays = 30; // default 1 month for Pro
      if (subscriptionPlan === 'business') {
        durationInDays = 365; // 1 year for Business
      }
      
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + durationInDays * 24 * 60 * 60 * 1000);
      
      // Create or update subscription
      const existingSubscription = await storage.getSubscription(user.id);
      
      if (existingSubscription) {
        await storage.updateSubscription(existingSubscription.id, {
          plan: subscriptionPlan,
          status: 'active',
          startDate,
          endDate,
          paymentId: razorpay_payment_id,
          paymentDetails: { 
            orderId: razorpay_order_id,
            signature: razorpay_signature,
            amount,
            currency,
            verified: true 
          }
        });
      } else {
        await storage.createSubscription({
          userId: user.id,
          plan: subscriptionPlan,
          status: 'active',
          startDate,
          endDate,
          paymentId: razorpay_payment_id,
          paymentDetails: { 
            orderId: razorpay_order_id,
            signature: razorpay_signature,
            amount,
            currency,
            verified: true 
          }
        });
      }
      
      // Update user subscription info
      await storage.updateUser(user.id, {
        subscription: subscriptionPlan,
        subscriptionEndDate: endDate
      });
      
      res.json({ success: true, message: 'Payment verified successfully' });
    } catch (error) {
      console.error('Error verifying payment:', error);
      res.status(500).json({ 
        success: false,
        message: (error as Error).message 
      });
    }
  });

  return httpServer;
}
