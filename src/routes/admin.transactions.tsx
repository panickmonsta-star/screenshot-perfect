import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useMemo, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowDownLeft, ArrowUpRight, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminPageHeader, AdminTableWrap, TxStatusBadge } from "@/components/admin/admin-shared";
import { adminQueries } from "@/services";
import { formatCoins, formatDateTime, formatIDR } from "@/lib/format";
import type { TransactionStatus, TransactionType } from "@/types/domain";

export const Route = createFileRoute("/admin/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — Panick Admin" },
      { name: "description", content: "Payment records, coin purchases and episode unlocks." },
      { property: "og:title", content: "Transactions — Panick Admin" },
      { property: "og:description", content: "Payment records, coin purchases and episode unlocks." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(adminQueries.transactions()),
  component: AdminTransactionsPage,
});

function TxBody() {
  const { data: rows } = useSuspenseQuery(adminQueries.transactions());
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"all" | TransactionType>("all");
  const [status, setStatus] = useState<"all" | TransactionStatus>("all");

  const filtered = useMemo(
    () =>
      rows.filter(
        (t) =>
          (type === "all" || t.type === type) &&
          (status === "all" || t.status === status) &&
          (t.title.toLowerCase().includes(query.toLowerCase()) || t.reference.toLowerCase().includes(query.toLowerCase())),
      ),
    [rows, query, type, status],
  );

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title or reference…" aria-label="Search transactions" className="pl-9" />
        </div>
        <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
          <SelectTrigger className="w-44" aria-label="Filter by type"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="coin_purchase">Coin purchases</SelectItem>
            <SelectItem value="episode_unlock">Episode unlocks</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
          <SelectTrigger className="w-40" aria-label="Filter by status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <AdminTableWrap>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-card/80 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Reference</th>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium text-right">Coins</th>
                <th className="px-4 py-3 font-medium text-right">IDR</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-card/40">
              {filtered.map((t) => (
                <tr key={t.id} className="transition-colors hover:bg-accent/40">
                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{formatDateTime(t.createdAt)}</td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{t.reference}</td>
                  <td className="px-4 py-3">
                    <p className="flex items-center gap-1.5 font-medium">
                      {t.type === "coin_purchase" ? <ArrowUpRight className="size-3.5 text-primary" /> : <ArrowDownLeft className="size-3.5 text-muted-foreground" />}
                      {t.title}
                    </p>
                    {t.seriesTitle ? <p className="text-xs text-muted-foreground">{t.seriesTitle}{t.episodeNumber ? ` · EP${t.episodeNumber}` : ""}</p> : null}
                  </td>
                  <td className={`whitespace-nowrap px-4 py-3 text-right font-semibold ${t.coinAmount >= 0 ? "text-primary" : ""}`}>{t.coinAmount >= 0 ? "+" : ""}{formatCoins(t.coinAmount)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-muted-foreground">{t.amountIdr ? formatIDR(t.amountIdr) : "—"}</td>
                  <td className="px-4 py-3"><TxStatusBadge status={t.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminTableWrap>
      <p className="mt-3 text-xs text-muted-foreground">{filtered.length} of {rows.length} records shown.</p>
    </>
  );
}

function AdminTransactionsPage() {
  return (
    <>
      <AdminPageHeader title="Transactions" description="Demo payment records, coin purchases and unlocks." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}><TxBody /></Suspense>
    </>
  );
}
