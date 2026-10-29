/**
 * Central domain models for the Panick Monsta short-drama streaming platform.
 * These interfaces mirror the future Supabase schema so Milestone 2 can swap
 * the mock service implementations for real queries without touching the UI.
 */

export type Genre =
  | "Romance"
  | "Thriller"
  | "Fantasy"
  | "Comedy"
  | "Mystery"
  | "Drama"
  | "Horror"
  | "Action";

export type PublicationStatus = "draft" | "published" | "archived";

export type AccountStatus = "active" | "suspended";

export type TransactionType = "coin_purchase" | "episode_unlock";

export type TransactionStatus = "completed" | "pending" | "failed";

export interface Series {
  id: string;
  slug: string;
  title: string;
  synopsis: string;
  genre: Genre;
  releaseYear: number;
  posterUrl: string;
  status: PublicationStatus;
  featured: boolean;
  trending: boolean;
  totalViews: number;
  createdAt: string;
}

export interface Episode {
  id: string;
  seriesId: string;
  seriesSlug: string;
  episodeNumber: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  /** Provider-neutral video reference. null until a real provider is connected. */
  videoUrl: string | null;
  durationSeconds: number;
  isFree: boolean;
  coinPrice: number;
  status: PublicationStatus;
  downloadEnabled: boolean;
  aspectRatio: "portrait" | "landscape";
  createdAt: string;
}

export interface CoinPackage {
  id: string;
  name: string;
  coinAmount: number;
  bonusCoins: number;
  priceIdr: number;
  popular: boolean;
  active: boolean;
}

export interface Wallet {
  balance: number;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  reference: string;
  type: TransactionType;
  title: string;
  seriesTitle: string | null;
  episodeNumber: number | null;
  /** Positive for coin purchases, negative for episode unlocks. */
  coinAmount: number;
  /** IDR amount; only set for coin purchases. */
  amountIdr: number | null;
  status: TransactionStatus;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
  status: AccountStatus;
  coinBalance: number;
  totalUnlocks: number;
  totalSpentIdr: number;
}

export interface WatchProgress {
  seriesId: string;
  seriesSlug: string;
  seriesTitle: string;
  posterUrl: string;
  episodeId: string;
  episodeNumber: number;
  episodeTitle: string;
  positionSeconds: number;
  durationSeconds: number;
  updatedAt: string;
}

export interface EpisodeAccessRecord {
  episodeId: string;
  seriesId: string;
  seriesSlug: string;
  episodeNumber: number;
  unlockedAt: string;
  source: "coins" | "free";
}

export interface AdminAnalytics {
  totalSalesIdr: number;
  totalCoinsSold: number;
  totalCoinsSpent: number;
  userCount: number;
  topSeries: Array<{ seriesId: string; title: string; unlocks: number; revenueIdr: number }>;
  recentTransactions: Transaction[];
  daily: Array<{ date: string; revenueIdr: number; unlocks: number }>;
}

export type DownloadProcessingStatus =
  | "not_started"
  | "processing"
  | "ready"
  | "failed";

export interface DownloadEpisodeRow {
  episodeId: string;
  seriesTitle: string;
  seriesSlug: string;
  episodeNumber: number;
  episodeTitle: string;
  eligible: boolean;
  processingStatus: DownloadProcessingStatus;
}

export interface DownloadSettings {
  platformName: string;
  watermarkText: string;
  watermarkLogoUrl: string | null;
  /** Duration-based watermark positioning, keyed by second ranges. */
  positions: Array<{ fromSecond: number; toSecond: number; position: string }>;
  bulkFirstFiveEpisodes: boolean;
}

export interface PlatformSettings {
  platformName: string;
  tagline: string;
  currency: "IDR";
  coinName: string;
  coinSymbol: string;
  videoProvider: string;
  paymentProvider: string;
  supportEmail: string;
}

export interface SeriesInput {
  title: string;
  slug: string;
  synopsis: string;
  genre: Genre;
  releaseYear: number;
  posterUrl: string;
  status: PublicationStatus;
  featured: boolean;
  trending: boolean;
}

export interface EpisodeInput {
  seriesId: string;
  episodeNumber: number;
  title: string;
  description: string;
  videoUrl: string | null;
  durationSeconds: number;
  isFree: boolean;
  coinPrice: number;
  status: PublicationStatus;
  downloadEnabled: boolean;
}

export interface CoinPackageInput {
  name: string;
  coinAmount: number;
  bonusCoins: number;
  priceIdr: number;
  popular: boolean;
  active: boolean;
}
