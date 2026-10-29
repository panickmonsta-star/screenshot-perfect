/**
 * Transaction history service. Mock rows only; Milestone 2 replaces reads
 * with Supabase queries and adds server-verified writes.
 */
import { seedTransactions } from "@/data/mock/seed";
import type { Transaction, TransactionStatus, TransactionType } from "@/types/domain";
import { mockDelay } from "./mock";

export interface TransactionFilter {
  type?: TransactionType | "all";
  status?: TransactionStatus | "all";
  page?: number;
  pageSize?: number;
}

export interface TransactionPage {
  rows: Transaction[];
  total: number;
  page: number;
  pageSize: number;
}

export interface TransactionService {
  list(filter?: TransactionFilter): Promise<TransactionPage>;
}

export const transactionService: TransactionService = {
  async list(filter = {}) {
    const { type = "all", status = "all", page = 1, pageSize = 10 } = filter;
    let rows = [...seedTransactions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    if (type !== "all") rows = rows.filter((t) => t.type === type);
    if (status !== "all") rows = rows.filter((t) => t.status === status);
    const total = rows.length;
    const start = (page - 1) * pageSize;
    return mockDelay({ rows: rows.slice(start, start + pageSize), total, page, pageSize }, 260);
  },
};
