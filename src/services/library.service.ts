/**
 * Library service — continue watching, recently watched and unlocked episodes.
 * Mock in-browser state; Milestone 2 persists this against the real database.
 */
import { seedContinueWatching, seedEpisodes, seedSeries } from "@/data/mock/seed";
import type { Episode, Series, WatchProgress } from "@/types/domain";
import { mockDelay, nowIso } from "./mock";

export interface LibraryService {
  listContinueWatching(): Promise<WatchProgress[]>;
  listRecentlyWatched(): Promise<WatchProgress[]>;
  saveProgress(input: { seriesId: string; episodeId: string; positionSeconds: number }): Promise<void>;
}

const progress: WatchProgress[] = [...seedContinueWatching];

export const libraryService: LibraryService = {
  async listContinueWatching() {
    return mockDelay(
      [...progress].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
      180,
    );
  },

  async listRecentlyWatched() {
    return mockDelay(
      [...progress].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8),
      180,
    );
  },

  async saveProgress({ seriesId, episodeId, positionSeconds }) {
    const series = seedSeries.find((s) => s.id === seriesId);
    const episode = seedEpisodes.find((e) => e.id === episodeId);
    if (!series || !episode) return;
    const existing = progress.find((p) => p.seriesId === seriesId);
    const entry: WatchProgress = {
      seriesId,
      seriesSlug: series.slug,
      seriesTitle: series.title,
      posterUrl: series.posterUrl,
      episodeId,
      episodeNumber: episode.episodeNumber,
      episodeTitle: episode.title,
      positionSeconds,
      durationSeconds: episode.durationSeconds,
      updatedAt: nowIso(),
    };
    if (existing) Object.assign(existing, entry);
    else progress.unshift(entry);
    await mockDelay(null, 80);
  },
};

export interface UnlockedItem {
  series: Series;
  episode: Episode;
  unlockedAt: string;
}
