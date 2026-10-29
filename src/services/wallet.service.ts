/**
 * Mock coin wallet service. Balances and purchases are demonstration-only:
 * no payment provider is contacted and no real money moves.
 */
import { seedCoinPackages, seedTransactions, seedUser } from "@/data/mock/seed";
import type { CoinPackage, Transaction, Wallet } from "@/types/domain";
import { mockDelay, nowIso } from "./mock";

export interface WalletService {
  getWallet(): Promise<Wallet>;
  listPackages(): Promise<CoinPackage[]>;
  purchaseCoins(packageId: string): Promise<{ wallet: Wallet; transaction: Transaction }>;
  /** Internal spend used by the mock unlock flow. Negative coinAmount transaction. */
  spendCoins(amount: number, title: string, seriesTitle: string, episodeNumber: number): Promise<Transaction>;
}

const wallet: Wallet = { balance: seedUser.coinBalance, updatedAt: nowIso() };
const packages: CoinPackage[] = [...seedCoinPackages];
let refCounter = 100;

export const walletService: WalletService = {
  async getWallet() {
    return mockDelay({ ...wallet }, 150);
  },

  async listPackages() {
    return mockDelay(packages.filter((p) => p.active), 200);
  },

  async purchaseCoins(packageId) {
    const pkg = packages.find((p) => p.id === packageId && p.active);
    if (!pkg) return Promise.reject(new Error("Package not available."));
    await mockDelay(null, 600);

    const totalCoins = pkg.coinAmount + pkg.bonusCoins;
    wallet.balance += totalCoins;
    wallet.updatedAt = nowIso();

    refCounter += 1;
    const transaction: Transaction = {
      id: `tx-local-${refCounter}`,
      reference: `PM-TX-${(refCounter * 7919).toString(36).toUpperCase().slice(0, 6)}`,
      type: "coin_purchase",
      title: pkg.name,
      seriesTitle: null,
      episodeNumber: null,
      coinAmount: totalCoins,
      amountIdr: pkg.priceIdr,
      status: "completed",
      createdAt: nowIso(),
    };
    seedTransactions.unshift(transaction);

    return mockDelay({ wallet: { ...wallet }, transaction }, 40);
  },
};
