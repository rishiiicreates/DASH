import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uid: text("uid").notNull().unique(),
  email: text("email").notNull(),
  displayName: text("display_name"),
  photoURL: text("photo_url"),
  subscription: text("subscription").default("free"),
  subscriptionEndDate: timestamp("subscription_end_date"),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

// API Keys schema
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  platform: text("platform").notNull(),
  apiKey: text("api_key"),
  apiSecret: text("api_secret"),
  accessToken: text("access_token"),
  accessTokenSecret: text("access_token_secret"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at"),
  isConnected: boolean("is_connected").default(false),
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
});

// Subscription schema
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  plan: text("plan").notNull(),
  status: text("status").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  paymentId: text("payment_id"),
  paymentDetails: jsonb("payment_details"),
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
});

// Platform data schema
export const platformData = pgTable("platform_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  platform: text("platform").notNull(),
  dataType: text("data_type").notNull(),
  data: jsonb("data").notNull(),
  fetchedAt: timestamp("fetched_at").notNull(),
});

export const insertPlatformDataSchema = createInsertSchema(platformData).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export type PlatformData = typeof platformData.$inferSelect;
export type InsertPlatformData = z.infer<typeof insertPlatformDataSchema>;

// Platform types
export const platformEnum = z.enum(['youtube', 'instagram', 'twitter', 'facebook']);
export type Platform = z.infer<typeof platformEnum>;

// Subscription plan types
export const subscriptionPlanEnum = z.enum(['free', 'pro', 'business']);
export type SubscriptionPlan = z.infer<typeof subscriptionPlanEnum>;
