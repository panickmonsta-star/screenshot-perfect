/**
 * Episode access service — what the signed-in viewer may watch, and the mock
 * unlock flow. No real entitlements are enforced here; authorization moves to
 * the backend in Milestone 2.
 */
import { seedEpisodes, seedTransactions, seedUnlocked } from "@/data/mock/seed";
import type { EpisodeAccessRecord } from "@/types/domain";
import { walletService } from "./wallet.service";
import { mockDelay, nowIso } from "./mock";

export interface AccessCheck {
  episodeId: string;
  locked: boolean;
  reason: "free" | "unlocked" | "needs_coins";
  coinPrice: number;
}

export interface AccessService {
  checkAccess(episodeId: string): Promise<AccessCheck>;
  listUnlocked(): Promise<EpisodeAccessRecord[]>;
  unlockWithCoins(episodeId: string): Promise<EpisodeAccessRecord>;
}

const unlocked: EpisodeAccessRecord[] = [...seedUnlocked];

export const accessService: AccessService = {
  async checkAccess(episodeId) {
    const episode = seedEpisodes.find((e) => e.id === episodeId);
    if (!episode) return Promise.reject(new Error("Episode not found."));
    const has = unlocked.some((u) => u.episodeId === episodeId);
    const locked = !episode.isFree && !has;
    return mockDelay(
      {
        episodeId,
        locked,
        reason: episode.isFree ? "free" : has ? "unlocked" : "needs_coins",
        coinPrice: episode.coinPrice,
      },
      120,
    );
  },

  async listUnlocked() {
    return mockDelay([...unlocked].sort((a, b) => b.unlockedAt.localeCompare(a.unlockedAt)), 200);
  },

  async unlockWithCoins(episodeId) {
    const episode = seedEpisodes.find((e) => e.id === episodeId);
    if (!episode) return Promise.reject(new Error("Episode not found."));
    if (episode.isFree) return Promise.reject(new Error("Episode is already free."));
    const existing = unlocked.find((u) => u.episodeId === episodeId);
    if (existing) return mockDelay(existing, 100);

    const current = await walletService.getWallet();
    if (current.balance < episode.coinPrice) {
      return Promise.reject(new Error("Not enough coins. Top up your wallet to keep watching."));
    }

    await walletService.spendCoins(
      episode.coinPrice,
      episode.title,
      seedEpisodes.find((e) => e.id === episodeId)!.seriesSlug,
      episode.episodeNumber,
    );

    const record: EpisodeAccessRecord = {
      episodeId,
      seriesId: episode.seriesId,
      seriesSlug: episode.seriesSlug,
      episodeNumber: episode.episodeNumber,
      unlockedAt: nowIso(),
      source: "coins",
    };
    unlocked.unshift(record);
    return mockDelay(record, 40);
  },
};
