/**
 * Data-access layer public surface.
 *
 * The UI imports services only through this index, so Milestone 2 can swap
 * every mock implementation for real Supabase-backed ones without touching
 * components: keep the interfaces, replace the exported objects.
 */
export { authService, type AuthService, type AuthSession, type SignInInput, type SignUpInput } from "./auth.service";
export { catalogService, type CatalogService, type SeriesFilter, type SeriesSort } from "./catalog.service";
export { walletService, type WalletService } from "./wallet.service";
export { accessService, type AccessService, type AccessCheck } from "./access.service";
export { transactionService, type TransactionService, type TransactionFilter, type TransactionPage } from "./transactions.service";
export { libraryService, type LibraryService } from "./library.service";
export { mediaService, type MediaService, type PlaybackInfo, type DownloadRequest } from "./media.service";
export { adminService, type AdminService } from "./admin.service";
export { catalogQueries, walletQueries, accessQueries, libraryQueries, transactionQueries, adminQueries } from "./queries";
