/**
 * TanStack Query options for the mock services. Routes call
 * `queryClient.ensureQueryData(...)` in their loaders and components read
 * with `useSuspenseQuery`, so loading states are handled by Suspense.
 */
import { queryOptions } from "@tanstack/react-query";
import { accessService } from "./access.service";
import { adminService } from "./admin.service";
import { catalogService, type SeriesFilter } from "./catalog.service";
import { libraryService } from "./library.service";
import { transactionService, type TransactionFilter } from "./transactions.service";
import { walletService } from "./wallet.service";

const q = <T>(key: unknown[], fn: () => Promise<T>) => queryOptions({ queryKey: key, queryFn: fn });

export const catalogQueries = {
  list: (filter: SeriesFilter = {}) => q(["series", filter], () => catalogService.listSeries(filter)),
  bySlug: (slug: string) => q(["series", "detail", slug], () => catalogService.getSeriesBySlug(slug)),
  episodes: (slug: string) =>
    q(["episodes", slug], async () => {
      const series = await catalogService.getSeriesBySlug(slug);
      if (!series) throw new Error("Series not found.");
      return catalogService.listPublishedEpisodes(series.id);
    }),
  watch: (slug: string, n: number) =>
    q(["watch", slug, n], () => catalogService.getEpisodeBySlugAndNumber(slug, n)),
};

export const walletQueries = {
  balance: () => q(["wallet"], () => walletService.getWallet()),
  packages: () => q(["coin-packages"], () => walletService.listPackages()),
};

export const accessQueries = {
  unlockedIds: () =>
    q(["access", "unlocked-ids"], async () => (await accessService.listUnlocked()).map((u) => u.episodeId)),
  unlocked: () => q(["access", "unlocked"], () => accessService.listUnlocked()),
  check: (episodeId: string) => q(["access", "check", episodeId], () => accessService.checkAccess(episodeId)),
};

export const libraryQueries = {
  continueWatching: () => q(["library", "continue"], () => libraryService.listContinueWatching()),
  recent: () => q(["library", "recent"], () => libraryService.listRecentlyWatched()),
};

export const transactionQueries = {
  page: (filter: TransactionFilter = {}) => q(["transactions", filter], () => transactionService.list(filter)),
};

export const adminQueries = {
  analytics: (rangeDays: number) => q(["admin", "analytics", rangeDays], () => adminService.getAnalytics(rangeDays)),
  series: () => q(["admin", "series"], () => adminService.listAllSeries()),
  episodes: () => q(["admin", "episodes"], () => adminService.listAllEpisodes()),
  packages: () => q(["admin", "packages"], () => adminService.listPackages()),
  users: () => q(["admin", "users"], () => adminService.listUsers()),
  transactions: () => q(["admin", "transactions"], () => adminService.listAllTransactions()),
  downloadRows: () => q(["admin", "download-rows"], () => adminService.listDownloadRows()),
  downloadSettings: () => q(["admin", "download-settings"], () => adminService.getDownloadSettings()),
  platformSettings: () => q(["admin", "platform-settings"], () => adminService.getPlatformSettings()),
};
