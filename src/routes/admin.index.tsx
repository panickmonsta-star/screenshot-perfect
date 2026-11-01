import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Coins, Film, ShoppingBag, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminPageHeader, AdminTableWrap, StatCard, TxStatusBadge } from "@/components/admin/admin-shared";
import { adminQueries } from "@/services";
import { formatCoins, formatDateTime, formatIDR, formatNumber } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin overview — Panick Monsta" },
      { name: "description", content: "Preview analytics dashboard for the short-drama platform." },
      { property: "og:title", content: "Admin overview — Panick Monsta" },
      { property: "og:description", content: "Preview analytics dashboard for the short-drama platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(adminQueries.analytics(14)),
  component: AdminOverview,
});

function OverviewBody() {
  const [range, setRange] = useState("14");
  const { data: a } = useSuspenseQuery(adminQueries.analytics(Number(range)));

  return (
    <>
      <AdminPageHeader
        title="Overview"
        description="Demonstration analytics until a real backend is connected."
        action={
          <Select value={range} onValueChange={(v) => setRange(v)}>
            <SelectTrigger className="w-36" aria-label="Date range"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total sales" value={formatIDR(a.totalSalesIdr)} sub="Demo coin purchases" icon={<ShoppingBag className="size-4" />} />
        <StatCard label="Coins sold" value={formatCoins(a.totalCoinsSold)} sub="Across all packages" icon={<Coins className="size-4" />} />
        <StatCard label="Coins spent" value={formatCoins(a.totalCoinsSpent)} sub="On episode unlocks" icon={<Coins className="size-4" />} />
        <StatCard label="Users" value={formatNumber(a.userCount)} sub="Registered (demo)" icon={<Users className="size-4" />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
          <h2 className="mb-4 font-display text-sm font-semibold">Revenue (IDR)</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={a.daily} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} tickFormatter={(d: string) => d.slice(5)} />
                <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} formatter={(v: number) => [formatIDR(v), "Revenue"]} />
                <Area type="monotone" dataKey="revenueIdr" stroke="var(--color-chart-1)" fill="url(#rev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
          <h2 className="mb-4 font-display text-sm font-semibold">Episode unlocks</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={a.daily} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="date" tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} tickFormatter={(d: string) => d.slice(5)} />
                <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Bar dataKey="unlocks" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
          <h2 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold"><Film className="size-4 text-primary" /> Top-performing series</h2>
          <ol className="space-y-3">
            {a.topSeries.map((s, i) => (
              <li key={s.seriesId} className="flex items-center gap-3">
                <span className="font-display text-sm font-bold text-primary">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{s.title}</span>
                <span className="text-xs text-muted-foreground">{s.unlocks} unlocks</span>
                <span className="text-sm font-semibold">{formatIDR(s.revenueIdr)}</span>
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h2 className="mb-4 font-display text-sm font-semibold">Recent transactions</h2>
          <AdminTableWrap>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border/50 bg-card/40">
                {a.recentTransactions.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-2.5">
                      <p className="font-medium">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDateTime(t.createdAt)}</p>
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold">{t.coinAmount >= 0 ? "+" : ""}{formatCoins(t.coinAmount)}</td>
                    <td className="px-4 py-2.5 text-right"><TxStatusBadge status={t.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminTableWrap>
        </div>
      </div>
    </>
  );
}

function AdminOverview() {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}>
      <OverviewBody />
    </Suspense>
  );
}
