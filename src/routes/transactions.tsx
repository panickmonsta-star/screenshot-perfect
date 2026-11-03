import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight, ChevronLeft, ChevronRight, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/states";
import { transactionQueries, type TransactionFilter } from "@/services";
import { formatCoins, formatDateTime, formatIDR } from "@/lib/format";
import type { TransactionStatus, TransactionType } from "@/types/domain";


export const Route = createFileRoute("/transactions")({
  validateSearch: (search: Record<string, string>) => {
    const page = Number(search.page);
    return {
      type: (["all", "coin_purchase", "episode_unlock"] as const).includes(search.type as TransactionType)
        ? (search.type as TransactionType | "all")
        : undefined,
      status: (["all", "completed", "pending", "failed"] as const).includes(search.status as TransactionStatus)
        ? (search.status as TransactionStatus | "all")
        : undefined,
      page: Number.isInteger(page) && page >= 1 ? page : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Transaction history — Panick Monsta" },
      { name: "description", content: "Your coin purchases and episode unlocks, with filters and pagination." },
      { property: "og:title", content: "Transaction history — Panick Monsta" },
      { property: "og:description", content: "Your coin purchases and episode unlocks, with filters and pagination." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context, search }) => {
    await context.queryClient.ensureQueryData(
      transactionQueries.page({
        type: (search.type as TransactionFilter["type"]) ?? "all",
        status: (search.status as TransactionFilter["status"]) ?? "all",
        page: search.page ?? 1,
      }),
    );
  },
  component: TransactionsPage,
});

const PAGE_SIZE = 10;

function StatusBadge({ status }: { status: TransactionStatus }) {
  const styles: Record<TransactionStatus, string> = {
    completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    failed: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return <Badge variant="outline" className={`capitalize ${styles[status]}`}>{status}</Badge>;
}

function TransactionsTable({ filter }: { filter: { type?: TransactionType | "all"; status?: TransactionStatus | "all"; page?: number } }) {
  const page = filter.page ?? 1;
  const { data } = useSuspenseQuery(transactionQueries.page({ ...filter, page, pageSize: PAGE_SIZE }));
  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));

  if (data.rows.length === 0) {
    return (
      <EmptyState
        icon={<ReceiptText className="size-10" />}
        title="No transactions yet"
        description="Coin purchases and episode unlocks will show up here once they happen."
        action={<Link to="/wallet"><Badge variant="secondary">Open wallet</Badge></Link>}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-border/60">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-card/80 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Reference</th>
              <th className="px-4 py-3 font-medium">Item</th>
              <th className="px-4 py-3 font-medium text-right">Coins</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 bg-card/40">
            {data.rows.map((t) => (
              <tr key={t.id} className="transition-colors hover:bg-accent/40">
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDateTime(t.createdAt)}</td>
                <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">{t.reference}</td>
                <td className="px-4 py-3">
                  <p className="flex items-center gap-1.5 font-medium">
                    {t.type === "coin_purchase" ? <ArrowUpRight className="size-3.5 text-primary" /> : <ArrowDownLeft className="size-3.5 text-muted-foreground" />}
                    {t.title}
                  </p>
                  {t.seriesTitle ? <p className="text-xs text-muted-foreground">{t.seriesTitle}{t.episodeNumber ? ` · EP${t.episodeNumber}` : ""}</p> : null}
                </td>
                <td className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${t.coinAmount >= 0 ? "text-primary" : "text-foreground"}`}>
                  {t.coinAmount >= 0 ? "+" : ""}{formatCoins(t.coinAmount)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-right text-muted-foreground">{t.amountIdr ? formatIDR(t.amountIdr) : "—"}</td>
                <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Page {page} of {totalPages} · {data.total} records</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} asChild><Link to="/transactions" search={(prev) => ({ ...prev, page: page - 1 })}><ChevronLeft className="size-4" /> Prev</Link></Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} asChild><Link to="/transactions" search={(prev) => ({ ...prev, page: page + 1 })}>Next <ChevronRight className="size-4" /></Link></Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TransactionsPage() {
  const search = Route.useSearch();
  const filter = {
    type: (search.type as TransactionFilter["type"]) ?? "all",
    status: (search.status as TransactionFilter["status"]) ?? "all",
    page: search.page ?? 1,
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold">Transaction history</h1>
      <p className="mt-1 text-sm text-muted-foreground">Demo records from the mock wallet and unlock flows.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Select value={filter.type} onValueChange={(v) => Route.navigate({ search: (prev) => ({ ...prev, type: v, page: undefined }) })}>
          <SelectTrigger className="w-44" aria-label="Filter by type"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="coin_purchase">Coin purchases</SelectItem>
            <SelectItem value="episode_unlock">Episode unlocks</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filter.status} onValueChange={(v) => Route.navigate({ search: (prev) => ({ ...prev, status: v, page: undefined }) })}>
          <SelectTrigger className="w-40" aria-label="Filter by status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-6">
        <Suspense key={`${filter.type}|${filter.status}|${filter.page}`} fallback={<div className="h-72 animate-pulse rounded-2xl bg-muted" />}>
          <TransactionsTable filter={filter} />
        </Suspense>
      </div>
    </div>
  );
}
