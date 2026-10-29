/**
 * Admin service — dashboard analytics and management operations.
 * All data is demonstration-only preview data; writes mutate in-memory mock
 * state and disappear on reload. Milestone 2 moves this behind real auth.
 */
import {
  seedAdminAnalytics,
  seedAdminUsers,
  seedCoinPackages,
  seedDownloadRows,
  seedDownloadSettings,
  seedEpisodes,
  seedPlatformSettings,
  seedSeries,
  seedTransactions,
} from "@/data/mock/seed";
import type {
  AdminAnalytics,
  CoinPackage,
  CoinPackageInput,
  DownloadEpisodeRow,
  DownloadSettings,
  Episode,
  EpisodeInput,
  PlatformSettings,
  Series,
  SeriesInput,
  Transaction,
  TransactionStatus,
  TransactionType,
  UserProfile,
} from "@/types/domain";
import { mockDelay, nowIso } from "./mock";

export interface AdminService {
  getAnalytics(rangeDays: number): Promise<AdminAnalytics>;

  listAllSeries(): Promise<Series[]>;
  createSeries(input: SeriesInput): Promise<Series>;
  updateSeries(id: string, input: Partial<SeriesInput>): Promise<Series>;
  archiveSeries(id: string): Promise<Series>;

  listAllEpisodes(seriesId?: string): Promise<Episode[]>;
  createEpisode(input: EpisodeInput): Promise<Episode>;
  updateEpisode(id: string, input: Partial<EpisodeInput>): Promise<Episode>;

  listPackages(): Promise<CoinPackage[]>;
  createPackage(input: CoinPackageInput): Promise<CoinPackage>;
  updatePackage(id: string, input: Partial<CoinPackageInput>): Promise<CoinPackage>;
  deletePackage(id: string): Promise<void>;

  listUsers(): Promise<UserProfile[]>;
  setUserStatus(id: string, status: UserProfile["status"]): Promise<UserProfile>;

  listAllTransactions(filter?: { type?: TransactionType | "all"; status?: TransactionStatus | "all" }): Promise<Transaction[]>;

  listDownloadRows(): Promise<DownloadEpisodeRow[]>;
  getDownloadSettings(): Promise<DownloadSettings>;
  updateDownloadSettings(input: Partial<DownloadSettings>): Promise<DownloadSettings>;
  setEpisodeEligibility(episodeId: string, eligible: boolean): Promise<DownloadEpisodeRow>;
  applyBulkFirstFive(seriesSlug: string): Promise<void>;

  getPlatformSettings(): Promise<PlatformSettings>;
  updatePlatformSettings(input: Partial<PlatformSettings>): Promise<PlatformSettings>;
}

const series: Series[] = [...seedSeries];
const episodes: Episode[] = [...seedEpisodes];
const packages: CoinPackage[] = [...seedCoinPackages];
const users: UserProfile[] = [...seedAdminUsers];
const downloadRows: DownloadEpisodeRow[] = [...seedDownloadRows];
const downloadSettings: DownloadSettings = { ...seedDownloadSettings };
const platformSettings: PlatformSettings = { ...seedPlatformSettings };
let localId = 0;
const nextId = (prefix: string) => `${prefix}-local-${++localId}`;

export const adminService: AdminService = {
  async getAnalytics(rangeDays) {
    const daily = seedAdminAnalytics.daily.slice(-Math.min(rangeDays, seedAdminAnalytics.daily.length));
    return mockDelay({ ...seedAdminAnalytics, daily }, 260);
  },

  async listAllSeries() {
    return mockDelay([...series].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), 200);
  },

  async createSeries(input) {
    await mockDelay(null, 350);
    const created: Series = {
      id: nextId("sr"),
      totalViews: 0,
      createdAt: nowIso(),
      ...input,
    };
    series.unshift(created);
    return mockDelay(created, 30);
  },

  async updateSeries(id, input) {
    const target = series.find((s) => s.id === id);
    if (!target) return Promise.reject(new Error("Series not found."));
    await mockDelay(null, 300);
    Object.assign(target, input);
    return mockDelay(target, 30);
  },

  async archiveSeries(id) {
    const target = series.find((s) => s.id === id);
    if (!target) return Promise.reject(new Error("Series not found."));
    await mockDelay(null, 250);
    target.status = "archived";
    return mockDelay(target, 30);
  },

  async listAllEpisodes(seriesId) {
    const list = episodes
      .filter((e) => !seriesId || e.seriesId === seriesId)
      .sort((a, b) => a.seriesSlug.localeCompare(b.seriesSlug) || a.episodeNumber - b.episodeNumber);
    return mockDelay(list, 200);
  },

  async createEpisode(input) {
    await mockDelay(null, 350);
    const seriesRef = series.find((s) => s.id === input.seriesId);
    if (!seriesRef) return Promise.reject(new Error("Pick a series first."));
    const created: Episode = {
      id: nextId("ep"),
      seriesSlug: seriesRef.slug,
      thumbnailUrl: seriesRef.posterUrl,
      aspectRatio: "portrait",
      createdAt: nowIso(),
      ...input,
    };
    episodes.push(created);
    return mockDelay(created, 30);
  },

  async updateEpisode(id, input) {
    const target = episodes.find((e) => e.id === id);
    if (!target) return Promise.reject(new Error("Episode not found."));
    await mockDelay(null, 300);
    Object.assign(target, input);
    return mockDelay(target, 30);
  },

  async listPackages() {
    return mockDelay([...packages], 150);
  },

  async createPackage(input) {
    await mockDelay(null, 300);
    const created: CoinPackage = { id: nextId("cp"), ...input };
    packages.push(created);
    return mockDelay(created, 30);
  },

  async updatePackage(id, input) {
    const target = packages.find((p) => p.id === id);
    if (!target) return Promise.reject(new Error("Package not found."));
    await mockDelay(null, 250);
    Object.assign(target, input);
    return mockDelay(target, 30);
  },

  async deletePackage(id) {
    await mockDelay(null, 200);
    const idx = packages.findIndex((p) => p.id === id);
    if (idx !== -1) packages.splice(idx, 1);
  },

  async listUsers() {
    return mockDelay([...users], 180);
  },

  async setUserStatus(id, status) {
    const target = users.find((u) => u.id === id);
    if (!target) return Promise.reject(new Error("User not found."));
    await mockDelay(null, 250);
    target.status = status;
    return mockDelay(target, 30);
  },

  async listAllTransactions(filter = {}) {
    let rows = [...seedTransactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (filter.type && filter.type !== "all") rows = rows.filter((t) => t.type === filter.type);
    if (filter.status && filter.status !== "all") rows = rows.filter((t) => t.status === filter.status);
    return mockDelay(rows, 200);
  },

  async listDownloadRows() {
    return mockDelay([...downloadRows], 160);
  },

  async getDownloadSettings() {
    return mockDelay({ ...downloadSettings }, 120);
  },

  async updateDownloadSettings(input) {
    await mockDelay(null, 280);
    Object.assign(downloadSettings, input);
    downloadRows.forEach((row) => {
      if (downloadSettings.bulkFirstFiveEpisodes && row.episodeNumber <= 5) row.eligible = true;
    });
    return mockDelay({ ...downloadSettings }, 30);
  },

  async setEpisodeEligibility(episodeId, eligible) {
    const row = downloadRows.find((r) => r.episodeId === episodeId);
    if (!row) return Promise.reject(new Error("Episode not found."));
    await mockDelay(null, 200);
    row.eligible = eligible;
    if (!eligible) row.processingStatus = "not_started";
    return mockDelay(row, 30);
  },

  async applyBulkFirstFive(seriesSlug) {
    await mockDelay(null, 280);
    downloadRows.forEach((row) => {
      if (row.seriesSlug === seriesSlug && row.episodeNumber <= 5) row.eligible = true;
    });
  },

  async getPlatformSettings() {
    return mockDelay({ ...platformSettings }, 120);
  },

  async updatePlatformSettings(input) {
    await mockDelay(null, 280);
    Object.assign(platformSettings, input);
    return mockDelay({ ...platformSettings }, 30);
  },
};
