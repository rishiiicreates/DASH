import { 
  users, type User, type InsertUser,
  apiKeys, type ApiKey, type InsertApiKey,
  subscriptions, type Subscription, type InsertSubscription,
  platformData, type PlatformData, type InsertPlatformData,
  platformEnum, type Platform
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUserByUid(uid: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<Omit<User, 'id'>>): Promise<User | undefined>;
  
  // API Key operations
  getApiKeys(userId: number): Promise<ApiKey[]>;
  getApiKey(userId: number, platform: Platform): Promise<ApiKey | undefined>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  updateApiKey(id: number, apiKeyData: Partial<Omit<ApiKey, 'id'>>): Promise<ApiKey | undefined>;
  deleteApiKey(id: number): Promise<boolean>;
  
  // Subscription operations
  getSubscription(userId: number): Promise<Subscription | undefined>;
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  updateSubscription(id: number, subscriptionData: Partial<Omit<Subscription, 'id'>>): Promise<Subscription | undefined>;
  
  // Platform data operations
  getPlatformData(userId: number, platform: Platform, dataType: string, limit?: number): Promise<PlatformData[]>;
  createPlatformData(data: InsertPlatformData): Promise<PlatformData>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private apiKeys: Map<number, ApiKey>;
  private subscriptions: Map<number, Subscription>;
  private platformData: Map<number, PlatformData>;
  private currentIds: {
    users: number;
    apiKeys: number;
    subscriptions: number;
    platformData: number;
  };

  constructor() {
    this.users = new Map();
    this.apiKeys = new Map();
    this.subscriptions = new Map();
    this.platformData = new Map();
    this.currentIds = {
      users: 1,
      apiKeys: 1,
      subscriptions: 1,
      platformData: 1
    };
  }

  // User operations
  async getUserByUid(uid: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.uid === uid) {
        return user;
      }
    }
    return undefined;
  }

  async getUserById(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<Omit<User, 'id'>>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    
    const updatedUser: User = { ...existingUser, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // API Key operations
  async getApiKeys(userId: number): Promise<ApiKey[]> {
    const userApiKeys: ApiKey[] = [];
    for (const apiKey of this.apiKeys.values()) {
      if (apiKey.userId === userId) {
        userApiKeys.push(apiKey);
      }
    }
    return userApiKeys;
  }

  async getApiKey(userId: number, platform: Platform): Promise<ApiKey | undefined> {
    for (const apiKey of this.apiKeys.values()) {
      if (apiKey.userId === userId && apiKey.platform === platform) {
        return apiKey;
      }
    }
    return undefined;
  }

  async createApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const id = this.currentIds.apiKeys++;
    const newApiKey: ApiKey = { ...apiKey, id };
    this.apiKeys.set(id, newApiKey);
    return newApiKey;
  }

  async updateApiKey(id: number, apiKeyData: Partial<Omit<ApiKey, 'id'>>): Promise<ApiKey | undefined> {
    const existingApiKey = this.apiKeys.get(id);
    if (!existingApiKey) return undefined;
    
    const updatedApiKey: ApiKey = { ...existingApiKey, ...apiKeyData };
    this.apiKeys.set(id, updatedApiKey);
    return updatedApiKey;
  }

  async deleteApiKey(id: number): Promise<boolean> {
    return this.apiKeys.delete(id);
  }

  // Subscription operations
  async getSubscription(userId: number): Promise<Subscription | undefined> {
    for (const subscription of this.subscriptions.values()) {
      if (subscription.userId === userId) {
        return subscription;
      }
    }
    return undefined;
  }

  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const id = this.currentIds.subscriptions++;
    const newSubscription: Subscription = { ...subscription, id };
    this.subscriptions.set(id, newSubscription);
    return newSubscription;
  }

  async updateSubscription(id: number, subscriptionData: Partial<Omit<Subscription, 'id'>>): Promise<Subscription | undefined> {
    const existingSubscription = this.subscriptions.get(id);
    if (!existingSubscription) return undefined;
    
    const updatedSubscription: Subscription = { ...existingSubscription, ...subscriptionData };
    this.subscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }

  // Platform data operations
  async getPlatformData(userId: number, platform: Platform, dataType: string, limit?: number): Promise<PlatformData[]> {
    const userPlatformData: PlatformData[] = [];
    for (const data of this.platformData.values()) {
      if (data.userId === userId && data.platform === platform && data.dataType === dataType) {
        userPlatformData.push(data);
      }
    }
    
    // Sort by fetchedAt in descending order (newest first)
    userPlatformData.sort((a, b) => 
      new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime()
    );
    
    // Apply limit if provided
    return limit ? userPlatformData.slice(0, limit) : userPlatformData;
  }

  async createPlatformData(data: InsertPlatformData): Promise<PlatformData> {
    const id = this.currentIds.platformData++;
    const newPlatformData: PlatformData = { ...data, id };
    this.platformData.set(id, newPlatformData);
    return newPlatformData;
  }
}

export const storage = new MemStorage();
