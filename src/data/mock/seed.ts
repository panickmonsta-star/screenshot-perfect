/**
 * Demonstration dataset for Milestone 1.
 *
 * Every row here is clearly sample content: titles, people, prices, analytics
 * and transaction records are invented for development and preview only.
 * Milestone 2 replaces this file with a real database.
 */
import { posters } from "@/assets/posters";
import type {
  AdminAnalytics,
  CoinPackage,
  DownloadEpisodeRow,
  DownloadSettings,
  Episode,
  EpisodeAccessRecord,
  PlatformSettings,
  Series,
  Transaction,
  UserProfile,
  WatchProgress,
} from "@/types/domain";

const iso = (daysAgo: number, hour = 12) => {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - daysAgo);
  d.setUTCHours(hour, 0, 0, 0);
  return d.toISOString();
};

export const demoNotice =
  "Preview build: all series, people, coins and analytics on this platform are demonstration data.";

interface EpisodeSpec {
  title: string;
  durationSeconds: number;
  isFree: boolean;
  coinPrice: number;
  downloadEnabled?: boolean;
}

interface SeriesSeed {
  series: Omit<Series, "id">;
  episodes: EpisodeSpec[];
}

const SEEDS: SeriesSeed[] = [
  {
    series: {
      slug: "cinta-di-balik-kaca",
      title: "Cinta di Balik Kaca",
      synopsis:
        "A rising jewellery designer falls for her quiet landlord, never suspecting that the antique mirror in her studio shows a truth neither of them is ready to face.",
      genre: "Romance",
      releaseYear: 2026,
      posterUrl: posters.cintaDiBalikKaca,
      status: "published",
      featured: true,
      trending: true,
      totalViews: 2_450_000,
      createdAt: iso(120),
    },
    episodes: [
      { title: "The Studio on Suryo Street", durationSeconds: 232, isFree: true, coinPrice: 0 },
      { title: "A Landlord Named Raka", durationSeconds: 258, isFree: true, coinPrice: 0 },
      { title: "Midnight Delivery", durationSeconds: 241, isFree: false, coinPrice: 20 },
      { title: "What the Mirror Kept", durationSeconds: 275, isFree: false, coinPrice: 25, downloadEnabled: true },
      { title: "Gambir Expo, 8 PM", durationSeconds: 249, isFree: false, coinPrice: 25, downloadEnabled: true },
      { title: "The Second Reflection", durationSeconds: 288, isFree: false, coinPrice: 30 },
      { title: "Everything She Designed", durationSeconds: 264, isFree: false, coinPrice: 30 },
      { title: "Behind the Glass", durationSeconds: 302, isFree: false, coinPrice: 40 },
    ],
  },
  {
    series: {
      slug: "jakarta-midnight",
      title: "Jakarta Midnight",
      synopsis:
        "A rideshare driver picks up the same passenger every night at midnight — and every night the passenger leaves behind one more clue to a crime that hasn't happened yet.",
      genre: "Thriller",
      releaseYear: 2026,
      posterUrl: posters.jakartaMidnight,
      status: "published",
      featured: false,
      trending: true,
      totalViews: 1_830_000,
      createdAt: iso(95),
    },
    episodes: [
      { title: "Pickup at KM Zero", durationSeconds: 224, isFree: true, coinPrice: 0 },
      { title: "The Passenger", durationSeconds: 246, isFree: false, coinPrice: 25 },
      { title: "Sudirman, 00:14", durationSeconds: 238, isFree: false, coinPrice: 25, downloadEnabled: true },
      { title: "Dashcam", durationSeconds: 252, isFree: false, coinPrice: 30 },
      { title: "The Third Night", durationSeconds: 261, isFree: false, coinPrice: 35, downloadEnabled: true },
      { title: "Last Drop-off", durationSeconds: 296, isFree: false, coinPrice: 45 },
    ],
  },
  {
    series: {
      slug: "penjaga-hutan-kabut",
      title: "Penjaga Hutan Kabut",
      synopsis:
        "Sent to survey a mist-locked forest in West Java, a young cartographer discovers a village that appears only when the fog thins — and a guardian who remembers her grandmother.",
      genre: "Fantasy",
      releaseYear: 2025,
      posterUrl: posters.penjagaHutanKabut,
      status: "published",
      featured: true,
      trending: false,
      totalViews: 1_120_000,
      createdAt: iso(210),
    },
    episodes: [
      { title: "The Road Ends Here", durationSeconds: 245, isFree: true, coinPrice: 0 },
      { title: "Fog Thins at Dusk", durationSeconds: 262, isFree: true, coinPrice: 0 },
      { title: "The Village That Waits", durationSeconds: 254, isFree: false, coinPrice: 20 },
      { title: "Grandmother's Map", durationSeconds: 270, isFree: false, coinPrice: 25, downloadEnabled: true },
      { title: "What the Guardian Guards", durationSeconds: 258, isFree: false, coinPrice: 30 },
      { title: "Cartographer's Oath", durationSeconds: 283, isFree: false, coinPrice: 35 },
    ],
  },
  {
    series: {
      slug: "kopi-pahit-cinta-manis",
      title: "Kopi Pahit, Cinta Manis",
      synopsis:
        "Two rival coffee carts share the same campus corner in Yogyakarta. She sells sweetness; he refuses sugar. Their customers have already decided how this ends.",
      genre: "Comedy",
      releaseYear: 2026,
      posterUrl: posters.kopiPahitCintaManis,
      status: "published",
      featured: false,
      trending: true,
      totalViews: 960_000,
      createdAt: iso(40),
    },
    episodes: [
      { title: "Corner Table War", durationSeconds: 218, isFree: true, coinPrice: 0 },
      { title: "No Sugar, Please", durationSeconds: 205, isFree: true, coinPrice: 0 },
      { title: "The Reviewer", durationSeconds: 226, isFree: true, coinPrice: 0 },
      { title: "Gula Jawa", durationSeconds: 234, isFree: false, coinPrice: 15 },
      { title: "Closing Time", durationSeconds: 248, isFree: false, coinPrice: 20, downloadEnabled: true },
    ],
  },
  {
    series: {
      slug: "rahasia-villa-senja",
      title: "Rahasia Villa Senja",
      synopsis:
        "A wedding party books a cliffside villa in Uluwatu for one weekend. By Sunday, the bride is missing and every guest remembers a different sunset.",
      genre: "Mystery",
      releaseYear: 2026,
      posterUrl: posters.rahasiaVillaSenja,
      status: "published",
      featured: false,
      trending: true,
      totalViews: 1_640_000,
      createdAt: iso(62),
    },
    episodes: [
      { title: "Check-in", durationSeconds: 239, isFree: true, coinPrice: 0 },
      { title: "Guest List", durationSeconds: 247, isFree: false, coinPrice: 25 },
      { title: "The Sunset Photograph", durationSeconds: 251, isFree: false, coinPrice: 30, downloadEnabled: true },
      { title: "Who Slept in Room Four", durationSeconds: 244, isFree: false, coinPrice: 30 },
      { title: "The Cliff Path", durationSeconds: 262, isFree: false, coinPrice: 35 },
      { title: "Sunday, Remembered", durationSeconds: 305, isFree: false, coinPrice: 45 },
    ],
  },
  {
    series: {
      slug: "pewaris-bandung",
      title: "The Heir of Bandung",
      synopsis:
        "Her family's textile empire is worth billions and her father's will names three heirs. Only one of them actually worked in the factory — and only one of them forged the will.",
      genre: "Drama",
      releaseYear: 2025,
      posterUrl: posters.pewarisBandung,
      status: "published",
      featured: false,
      trending: false,
      totalViews: 1_390_000,
      createdAt: iso(160),
    },
    episodes: [
      { title: "The Reading", durationSeconds: 258, isFree: true, coinPrice: 0 },
      { title: "Three Signatures", durationSeconds: 266, isFree: false, coinPrice: 25 },
      { title: "Floor Nine", durationSeconds: 272, isFree: false, coinPrice: 30, downloadEnabled: true },
      { title: "Board Meeting", durationSeconds: 255, isFree: false, coinPrice: 30 },
      { title: "Loom Number Twelve", durationSeconds: 278, isFree: false, coinPrice: 35, downloadEnabled: true },
      { title: "The Heir", durationSeconds: 312, isFree: false, coinPrice: 45 },
    ],
  },
  {
    series: {
      slug: "suara-dari-bawah-laut",
      title: "Suara dari Bawah Laut",
      synopsis:
        "A marine acoustics intern records a whale song off Bunaken that answers back in her late brother's voice — and keeps asking her to dive deeper.",
      genre: "Horror",
      releaseYear: 2026,
      posterUrl: posters.suaraDariBawahLaut,
      status: "published",
      featured: false,
      trending: false,
      totalViews: 780_000,
      createdAt: iso(25),
    },
    episodes: [
      { title: "Hydrophone 12", durationSeconds: 236, isFree: true, coinPrice: 0 },
      { title: "It Answers", durationSeconds: 249, isFree: false, coinPrice: 25 },
      { title: "Twenty Meters Down", durationSeconds: 241, isFree: false, coinPrice: 30, downloadEnabled: true },
      { title: "His Voice", durationSeconds: 255, isFree: false, coinPrice: 35 },
      { title: "Deeper", durationSeconds: 298, isFree: false, coinPrice: 45 },
    ],
  },
  {
    series: {
      slug: "detektif-kelas-malam",
      title: "Detektif Kelas Malam",
      synopsis:
        "By day, Ibu Sari teaches mathematics at a crowded state school. By night, the city's most stubborn cold cases meet the person who never stopped doing the maths.",
      genre: "Action",
      releaseYear: 2026,
      posterUrl: posters.detektifKelasMalam,
      status: "published",
      featured: false,
      trending: false,
      totalViews: 1_050_000,
      createdAt: iso(78),
    },
    episodes: [
      { title: "Homework", durationSeconds: 242, isFree: true, coinPrice: 0 },
      { title: "Case of the Missing Ledger", durationSeconds: 250, isFree: false, coinPrice: 20 },
      { title: "Night Shift", durationSeconds: 247, isFree: false, coinPrice: 25, downloadEnabled: true },
      { title: "Detention", durationSeconds: 263, isFree: false, coinPrice: 30 },
      { title: "Final Exam", durationSeconds: 290, isFree: false, coinPrice: 40 },
    ],
  },
];

export const seedSeries: Series[] = SEEDS.map((s, i) => ({
  id: `sr-${String(i + 1).padStart(3, "0")}`,
  ...s.series,
}));

const seriesBySlug = new Map(seedSeries.map((s) => [s.slug, s]));

export const seedEpisodes: Episode[] = SEEDS.flatMap((s, i) => {
  const series = seriesBySlug.get(s.series.slug)!;
  return s.episodes.map((e, n) => ({
    id: `ep-${series.id}-${String(n + 1).padStart(2, "0")}`,
    seriesId: series.id,
    seriesSlug: series.slug,
    episodeNumber: n + 1,
    title: e.title,
    description: `Episode ${n + 1} of ${series.title}. ${series.synopsis.slice(0, 90)}…`,
    thumbnailUrl: series.posterUrl,
    videoUrl: null, // real provider is connected in Milestone 2
    durationSeconds: e.durationSeconds,
    isFree: e.isFree,
    coinPrice: e.coinPrice,
    status: "published" as const,
    downloadEnabled: e.downloadEnabled ?? false,
    aspectRatio: "portrait" as const,
    createdAt: iso(120 - i * 8, 9 + n),
  }));
});

export const seedCoinPackages: CoinPackage[] = [
  { id: "cp-001", name: "Starter", coinAmount: 30, bonusCoins: 0, priceIdr: 15_000, popular: false, active: true },
  { id: "cp-002", name: "Binge Pack", coinAmount: 100, bonusCoins: 10, priceIdr: 49_000, popular: true, active: true },
  { id: "cp-003", name: "Value Vault", coinAmount: 220, bonusCoins: 30, priceIdr: 99_000, popular: false, active: true },
  { id: "cp-004", name: "Drama Pro", coinAmount: 500, bonusCoins: 80, priceIdr: 199_000, popular: false, active: true },
  { id: "cp-005", name: "Ultimate Fan", coinAmount: 1_200, bonusCoins: 250, priceIdr: 449_000, popular: false, active: false },
];

export const seedUser: UserProfile = {
  id: "usr-000",
  name: "Dewi Larasati",
  email: "dewi@panickmonsta.test",
  joinedAt: iso(88),
  status: "active",
  coinBalance: 120,
  totalUnlocks: 14,
  totalSpentIdr: 213_000,
};

export const seedAdminUsers: UserProfile[] = [
  seedUser,
  { id: "usr-001", name: "Bagas Prakoso", email: "bagas@panickmonsta.test", joinedAt: iso(120), status: "active", coinBalance: 465, totalUnlocks: 52, totalSpentIdr: 594_000 },
  { id: "usr-002", name: "Nadia Ayu", email: "nadia@panickmonsta.test", joinedAt: iso(112), status: "active", coinBalance: 85, totalUnlocks: 21, totalSpentIdr: 148_000 },
  { id: "usr-003", name: "Rizky Hidayat", email: "rizky@panickmonsta.test", joinedAt: iso(96), status: "active", coinBalance: 310, totalUnlocks: 40, totalSpentIdr: 497_000 },
  { id: "usr-004", name: "Putri Maharani", email: "putri@panickmonsta.test", joinedAt: iso(80), status: "suspended", coinBalance: 0, totalUnlocks: 3, totalSpentIdr: 15_000 },
  { id: "usr-005", name: "Andika Wibowo", email: "andika@panickmonsta.test", joinedAt: iso(61), status: "active", coinBalance: 1200, totalUnlocks: 77, totalSpentIdr: 998_000 },
  { id: "usr-006", name: "Sinta Rahmawati", email: "sinta@panickmonsta.test", joinedAt: iso(45), status: "active", coinBalance: 55, totalUnlocks: 12, totalSpentIdr: 99_000 },
  { id: "usr-007", name: "Fajar Nugroho", email: "fajar@panickmonsta.test", joinedAt: iso(33), status: "active", coinBalance: 150, totalUnlocks: 18, totalSpentIdr: 248_000 },
  { id: "usr-008", name: "Melati Cahaya", email: "melati@panickmonsta.test", joinedAt: iso(21), status: "active", coinBalance: 30, totalUnlocks: 2, totalSpentIdr: 49_000 },
  { id: "usr-009", name: "Teguh Santoso", email: "teguh@panickmonsta.test", joinedAt: iso(9), status: "active", coinBalance: 220, totalUnlocks: 8, totalSpentIdr: 99_000 },
];

const bySlug = (slug: string) => seriesBySlug.get(slug)!.title;

export const seedTransactions: Transaction[] = [
  { id: "tx-001", reference: "PM-TX-8F41K2", type: "coin_purchase", title: "Binge Pack", seriesTitle: null, episodeNumber: null, coinAmount: 110, amountIdr: 49_000, status: "completed", createdAt: iso(1, 20) },
  { id: "tx-002", reference: "PM-TX-9D22M7", type: "episode_unlock", title: "What the Mirror Kept", seriesTitle: bySlug("cinta-di-balik-kaca"), episodeNumber: 4, coinAmount: -25, amountIdr: null, status: "completed", createdAt: iso(1, 21) },
  { id: "tx-003", reference: "PM-TX-3A77Q1", type: "episode_unlock", title: "Midnight Delivery", seriesTitle: bySlug("cinta-di-balik-kaca"), episodeNumber: 3, coinAmount: -20, amountIdr: null, status: "completed", createdAt: iso(2, 19) },
  { id: "tx-004", reference: "PM-TX-5B18Z4", type: "coin_purchase", title: "Starter", seriesTitle: null, episodeNumber: null, coinAmount: 30, amountIdr: 15_000, status: "completed", createdAt: iso(3, 11) },
  { id: "tx-005", reference: "PM-TX-7C63N0", type: "episode_unlock", title: "Sudirman, 00:14", seriesTitle: bySlug("jakarta-midnight"), episodeNumber: 3, coinAmount: -25, amountIdr: null, status: "completed", createdAt: iso(3, 23) },
  { id: "tx-006", reference: "PM-TX-2E90P5", type: "episode_unlock", title: "The Sunset Photograph", seriesTitle: bySlug("rahasia-villa-senja"), episodeNumber: 3, coinAmount: -30, amountIdr: null, status: "completed", createdAt: iso(4, 22) },
  { id: "tx-007", reference: "PM-TX-4F55R8", type: "coin_purchase", title: "Value Vault", seriesTitle: null, episodeNumber: null, coinAmount: 250, amountIdr: 99_000, status: "pending", createdAt: iso(5, 14) },
  { id: "tx-008", reference: "PM-TX-6G12T3", type: "episode_unlock", title: "Gula Jawa", seriesTitle: bySlug("kopi-pahit-cinta-manis"), episodeNumber: 4, coinAmount: -15, amountIdr: null, status: "completed", createdAt: iso(6, 16) },
  { id: "tx-009", reference: "PM-TX-8H77W6", type: "episode_unlock", title: "Floor Nine", seriesTitle: bySlug("pewaris-bandung"), episodeNumber: 3, coinAmount: -30, amountIdr: null, status: "completed", createdAt: iso(7, 13) },
  { id: "tx-010", reference: "PM-TX-1J30Y9", type: "coin_purchase", title: "Starter", seriesTitle: null, episodeNumber: null, coinAmount: 30, amountIdr: 15_000, status: "failed", createdAt: iso(8, 10) },
  { id: "tx-011", reference: "PM-TX-3K84U2", type: "episode_unlock", title: "Twenty Meters Down", seriesTitle: bySlug("suara-dari-bawah-laut"), episodeNumber: 3, coinAmount: -30, amountIdr: null, status: "completed", createdAt: iso(9, 21) },
  { id: "tx-012", reference: "PM-TX-9L17A5", type: "episode_unlock", title: "Detention", seriesTitle: bySlug("detektif-kelas-malam"), episodeNumber: 4, coinAmount: -30, amountIdr: null, status: "completed", createdAt: iso(10, 18) },
  { id: "tx-013", reference: "PM-TX-5M61B8", type: "coin_purchase", title: "Drama Pro", seriesTitle: null, episodeNumber: null, coinAmount: 580, amountIdr: 199_000, status: "completed", createdAt: iso(12, 9) },
  { id: "tx-014", reference: "PM-TX-7N49C1", type: "episode_unlock", title: "The Cliff Path", seriesTitle: bySlug("rahasia-villa-senja"), episodeNumber: 5, coinAmount: -35, amountIdr: null, status: "completed", createdAt: iso(13, 20) },
  { id: "tx-015", reference: "PM-TX-2P73D4", type: "episode_unlock", title: "Cartographer's Oath", seriesTitle: bySlug("penjaga-hutan-kabut"), episodeNumber: 6, coinAmount: -35, amountIdr: null, status: "completed", createdAt: iso(14, 17) },
  { id: "tx-016", reference: "PM-TX-4Q28E7", type: "coin_purchase", title: "Binge Pack", seriesTitle: null, episodeNumber: null, coinAmount: 110, amountIdr: 49_000, status: "completed", createdAt: iso(16, 12) },
  { id: "tx-017", reference: "PM-TX-6R85F2", type: "episode_unlock", title: "Last Drop-off", seriesTitle: bySlug("jakarta-midnight"), episodeNumber: 6, coinAmount: -45, amountIdr: null, status: "completed", createdAt: iso(18, 22) },
  { id: "tx-018", reference: "PM-TX-8S52G9", type: "episode_unlock", title: "The Heir", seriesTitle: bySlug("pewaris-bandung"), episodeNumber: 6, coinAmount: -45, amountIdr: null, status: "completed", createdAt: iso(20, 15) },
];

export const seedContinueWatching: WatchProgress[] = [
  { seriesId: "sr-001", seriesSlug: "cinta-di-balik-kaca", seriesTitle: bySlug("cinta-di-balik-kaca"), posterUrl: posters.cintaDiBalikKaca, episodeId: "ep-sr-001-04", episodeNumber: 4, episodeTitle: "What the Mirror Kept", positionSeconds: 96, durationSeconds: 275, updatedAt: iso(0, 14) },
  { seriesId: "sr-005", seriesSlug: "rahasia-villa-senja", seriesTitle: bySlug("rahasia-villa-senja"), posterUrl: posters.rahasiaVillaSenja, episodeId: "ep-sr-005-03", episodeNumber: 3, episodeTitle: "The Sunset Photograph", positionSeconds: 40, durationSeconds: 251, updatedAt: iso(1, 22) },
  { seriesId: "sr-002", seriesSlug: "jakarta-midnight", seriesTitle: bySlug("jakarta-midnight"), posterUrl: posters.jakartaMidnight, episodeId: "ep-sr-002-05", episodeNumber: 5, episodeTitle: "The Third Night", positionSeconds: 205, durationSeconds: 261, updatedAt: iso(2, 23) },
  { seriesId: "sr-004", seriesSlug: "kopi-pahit-cinta-manis", seriesTitle: bySlug("kopi-pahit-cinta-manis"), posterUrl: posters.kopiPahitCintaManis, episodeId: "ep-sr-004-02", episodeNumber: 2, episodeTitle: "No Sugar, Please", positionSeconds: 61, durationSeconds: 205, updatedAt: iso(4, 16) },
];

export const seedUnlocked: EpisodeAccessRecord[] = [
  { episodeId: "ep-sr-001-03", seriesId: "sr-001", seriesSlug: "cinta-di-balik-kaca", episodeNumber: 3, unlockedAt: iso(2, 19), source: "coins" },
  { episodeId: "ep-sr-001-04", seriesId: "sr-001", seriesSlug: "cinta-di-balik-kaca", episodeNumber: 4, unlockedAt: iso(1, 21), source: "coins" },
  { episodeId: "ep-sr-002-02", seriesId: "sr-002", seriesSlug: "jakarta-midnight", episodeNumber: 2, unlockedAt: iso(3, 23), source: "coins" },
  { episodeId: "ep-sr-002-03", seriesId: "sr-002", seriesSlug: "jakarta-midnight", episodeNumber: 3, unlockedAt: iso(3, 23), source: "coins" },
  { episodeId: "ep-sr-005-03", seriesId: "sr-005", seriesSlug: "rahasia-villa-senja", episodeNumber: 3, unlockedAt: iso(4, 22), source: "coins" },
  { episodeId: "ep-sr-004-04", seriesId: "sr-004", seriesSlug: "kopi-pahit-cinta-manis", episodeNumber: 4, unlockedAt: iso(6, 16), source: "coins" },
  { episodeId: "ep-sr-006-03", seriesId: "sr-006", seriesSlug: "pewaris-bandung", episodeNumber: 3, unlockedAt: iso(7, 13), source: "coins" },
];

export const seedAdminAnalytics: AdminAnalytics = {
  totalSalesIdr: 2_347_000,
  totalCoinsSold: 4_930,
  totalCoinsSpent: 1_815,
  userCount: 18_420,
  topSeries: [
    { seriesId: "sr-001", title: bySlug("cinta-di-balik-kaca"), unlocks: 412, revenueIdr: 512_000 },
    { seriesId: "sr-005", title: bySlug("rahasia-villa-senja"), unlocks: 358, revenueIdr: 448_000 },
    { seriesId: "sr-002", title: bySlug("jakarta-midnight"), unlocks: 344, revenueIdr: 431_000 },
    { seriesId: "sr-006", title: bySlug("pewaris-bandung"), unlocks: 290, revenueIdr: 363_000 },
    { seriesId: "sr-007", title: bySlug("suara-dari-bawah-laut"), unlocks: 214, revenueIdr: 268_000 },
  ],
  recentTransactions: [...seedTransactions].reverse().slice(0, 8),
  daily: Array.from({ length: 14 }, (_, i) => {
    const daysAgo = 13 - i;
    const revenueIdr = 60_000 + Math.round(Math.abs(Math.sin(i * 2.7)) * 140_000);
    return {
      date: iso(daysAgo).slice(0, 10),
      revenueIdr,
      unlocks: Math.round(revenueIdr / 1_100),
    };
  }),
};

export const seedDownloadSettings: DownloadSettings = {
  platformName: "Panick Monsta",
  watermarkText: "PANICK MONSTA",
  watermarkLogoUrl: null,
  positions: [
    { fromSecond: 0, toSecond: 5, position: "bottom-left" },
    { fromSecond: 5, toSecond: 20, position: "top-right" },
    { fromSecond: 20, toSecond: 300, position: "bottom-center" },
  ],
  bulkFirstFiveEpisodes: true,
};

export const seedDownloadRows: DownloadEpisodeRow[] = seedEpisodes
  .filter((e) => e.episodeNumber <= 6)
  .map((e) => {
    const series = seedSeries.find((s) => s.id === e.seriesId)!;
    const eligible =
      (seedDownloadSettings.bulkFirstFiveEpisodes && e.episodeNumber <= 5) ||
      e.downloadEnabled;
    const processingStatus: DownloadEpisodeRow["processingStatus"] = !eligible
      ? "not_started"
      : e.id === "ep-sr-001-04"
        ? "ready"
        : e.id === "ep-sr-002-03"
          ? "processing"
          : e.id === "ep-sr-005-05"
            ? "failed"
            : "not_started";
    return {
      episodeId: e.id,
      seriesTitle: series.title,
      seriesSlug: series.slug,
      episodeNumber: e.episodeNumber,
      episodeTitle: e.title,
      eligible,
      processingStatus,
    };
  });

export const seedPlatformSettings: PlatformSettings = {
  platformName: "Panick Monsta",
  tagline: "Drama pendek, setiap malam.",
  currency: "IDR",
  coinName: "Monsta Coins",
  coinSymbol: "MC",
  videoProvider: "Not connected — placeholder for Milestone 2",
  paymentProvider: "Not connected — placeholder for Milestone 2",
  supportEmail: "support@panickmonsta.test",
};
