/**
 * Catalog service — series and episode reads.
 * Mock implementation over seed data; swap for Supabase queries in Milestone 2.
 */
import { seedEpisodes, seedSeries } from "@/data/mock/seed";
import type { Episode, Series } from "@/types/domain";
import { mockDelay } from "./mock";

export type SeriesSort = "trending" | "newest" | "popular" | "title";

export interface SeriesFilter {
  query?: string;
  genre?: string;
  sort?: SeriesSort;
}

export interface CatalogService {
  listSeries(filter?: SeriesFilter): Promise<Series[]>;
  getSeriesBySlug(slug: string): Promise<Series | null>;
  listPublishedEpisodes(seriesId: string): Promise<Episode[]>;
  getEpisodeBySlugAndNumber(slug: string, episodeNumber: number): Promise<{ series: Series; episode: Episode; neighbours: { prev: Episode | null; next: Episode | null } } | null>;
}

function sortSeries(list: Series[], sort: SeriesSort): Series[] {
  switch (sort) {
    case "newest":
      return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "popular":
      return [...list].sort((a, b) => b.totalViews - a.totalViews);
    case "title":
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    case "trending":
    default:
      return [...list].sort((a, b) => Number(b.trending) - Number(a.trending) || b.totalViews - a.totalViews);
  }
}

export const catalogService: CatalogService = {
  async listSeries(filter = {}) {
    const published = seedSeries.filter((s) => s.status === "published");
    let list = published;
    if (filter.genre && filter.genre !== "all") {
      list = list.filter((s) => s.genre === filter.genre);
    }
    if (filter.query) {
      const q = filter.query.toLowerCase();
      list = list.filter((s) => s.title.toLowerCase().includes(q) || s.synopsis.toLowerCase().includes(q));
    }
    list = sortSeries(list, filter.sort ?? "trending");
    return mockDelay(list, 250);
  },

  async getSeriesBySlug(slug) {
    const found = seedSeries.find((s) => s.slug === slug && s.status === "published") ?? null;
    return mockDelay(found, 200);
  },

  async listPublishedEpisodes(seriesId) {
    const list = seedEpisodes
      .filter((e) => e.seriesId === seriesId && e.status === "published")
      .sort((a, b) => a.episodeNumber - b.episodeNumber);
    return mockDelay(list, 200);
  },

  async getEpisodeBySlugAndNumber(slug, episodeNumber) {
    const series = seedSeries.find((s) => s.slug === slug && s.status === "published") ?? null;
    if (!series) return mockDelay(null, 150);
    const published = seedEpisodes
      .filter((e) => e.seriesId === series.id && e.status === "published")
      .sort((a, b) => a.episodeNumber - b.episodeNumber);
    const idx = published.findIndex((e) => e.episodeNumber === episodeNumber);
    const episode = idx === -1 ? undefined : published[idx];
    if (!episode) return mockDelay(null, 150);
    return mockDelay(
      {
        series,
        episode,
        neighbours: { prev: published[idx - 1] ?? null, next: published[idx + 1] ?? null },
      },
      150,
    );
  },
};
