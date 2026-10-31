import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import { useMutation, useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Coins, Loader2, Plus, Sparkles, Wallet } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState, DemoNotice } from "@/components/shared/states";
import { transactionQueries, walletQueries } from "@/services";
import { formatCoins, formatDateTime, formatIDR } from "@/lib/format";
import type { CoinPackage } from "@/types/domain";

export const Route = createFileRoute("/wallet")({
  head: () => ({
    meta: [
      { title: "Coin wallet — Panick Monsta" },
      { name: "description", content: "Check your coin balance and top up with coin packages priced in IDR." },
      { property: "og:title", content: "Coin wallet — Panick Monsta" },
      { property: "og:description", content: "Check your coin balance and top up with coin packages priced in IDR." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(walletQueries.balance()),
      context.queryClient.ensureQueryData(walletQueries.packages()),
      context.queryClient.ensureQueryData(transactionQueries.page({ type: "coin_purchase", pageSize: 5 })),
    ]);
  },
  component: WalletPage,
});

function PurchaseDialog({ pkg, balance, onClose }: { pkg: CoinPackage; balance: number; onClose: () => void }) {
  const qc = useQueryClient();
  const purchase = useMutation({
    mutationFn: () => walletServiceSafe(pkg.id),
    onSuccess: () => {
      toast.success(`+${formatCoins(pkg.coinAmount + pkg.bonusCoins)} coins added`, { description: `Demo purchase — ${formatIDR(pkg.priceIdr)} was not actually charged.` });
      void qc.invalidateQueries({ queryKey: ["wallet"] });
      void qc.invalidateQueries({ queryKey: ["transactions"] });
      onClose();
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Purchase failed."),
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Confirm purchase</DialogTitle>
          <DialogDescription>
            {pkg.name}: {formatCoins(pkg.coinAmount)} coins{pkg.bonusCoins > 0 ? ` + ${formatCoins(pkg.bonusCoins)} bonus` : ""} for {formatIDR(pkg.priceIdr)}.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Balance now</span><span>{formatCoins(balance)}</span></div>
          <div className="mt-1 flex justify-between font-semibold"><span className="text-muted-foreground">After purchase</span><span>{formatCoins(balance + pkg.coinAmount + pkg.bonusCoins)}</span></div>
        </div>
        <p className="text-xs text-muted-foreground">
          Demo only — no payment provider is connected in this milestone and nothing is charged.
        </p>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => purchase.mutate()} disabled={purchase.isPending} className="gap-2">
            {purchase.isPending ? <Loader2 className="size-4 animate-spin" /> : <Coins className="size-4" />} Buy for {formatIDR(pkg.priceIdr)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// local wrapper keeps the mutation type simple
import { walletService } from "@/services";
function walletServiceSafe(packageId: string) {
  return walletService.purchaseCoins(packageId).then((r) => r.wallet);
}

function PackageGrid() {
  const { data: packages } = useSuspenseQuery(walletQueries.packages());
  const { data: wallet } = useSuspenseQuery(walletQueries.balance());
  const [selected, setSelected] = useState<CoinPackage | null>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {packages.map((pkg) => (
          <div
            key={pkg.id}
            className={`relative flex flex-col rounded-2xl border p-5 transition-colors ${
              pkg.popular ? "border-primary/60 bg-primary/10" : "border-border/60 bg-card/70 hover:border-primary/40"
            }`}
          >
            {pkg.popular ? <Badge className="absolute -top-2.5 left-4 bg-primary text-primary-foreground">Most popular</Badge> : null}
            <p className="font-display font-semibold">{pkg.name}</p>
            <p className="mt-2 flex items-baseline gap-1.5">
              <Coins className="size-4 text-primary" />
              <span className="font-display text-2xl font-bold">{formatCoins(pkg.coinAmount)}</span>
              <span className="text-sm text-muted-foreground">coins</span>
            </p>
            {pkg.bonusCoins > 0 ? (
              <p className="mt-1 flex items-center gap-1 text-xs text-primary"><Sparkles className="size-3" /> +{formatCoins(pkg.bonusCoins)} bonus coins</p>
            ) : (
              <p className="mt-1 text-xs text-transparent">.</p>
            )}
            <p className="mt-3 font-semibold">{formatIDR(pkg.priceIdr)}</p>
            <Button className="mt-4 gap-2 rounded-xl" variant={pkg.popular ? "default" : "outline"} onClick={() => setSelected(pkg)}>
              <Plus className="size-4" /> Buy coins
            </Button>
          </div>
        ))}
      </div>
      {selected ? <PurchaseDialog pkg={selected} balance={wallet.balance} onClose={() => setSelected(null)} /> : null}
    </>
  );
}

function RecentActivity() {
  const { data } = useSuspenseQuery(transactionQueries.page({ type: "coin_purchase", pageSize: 5 }));
  if (data.rows.length === 0) {
    return <EmptyState icon={<Wallet className="size-8" />} title="No coin purchases yet" description="Your top-ups will appear here after your first package purchase." />;
  }
  return (
    <ul className="divide-y divide-border/50 rounded-2xl border border-border/60 bg-card/70">
      {data.rows.map((t) => (
        <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{t.title}</p>
            <p className="text-xs text-muted-foreground">{formatDateTime(t.createdAt)} · {t.reference}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-primary">+{formatCoins(t.coinAmount)}</p>
            <p className="text-xs text-muted-foreground">{formatIDR(t.amountIdr ?? 0)} · {t.status}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function WalletPage() {
  const { data: wallet } = useQuery(walletQueries.balance());
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Coin wallet</h1>
          <p className="mt-1 text-sm text-muted-foreground">Coins unlock premium episodes. Prices in IDR.</p>
        </div>
        <Link to="/transactions" className="text-sm text-primary hover:underline">Full transaction history →</Link>
      </div>

      <div className="mt-6 rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/15 via-card to-card p-8 text-center">
        <p className="text-sm text-muted-foreground">Current balance</p>
        <p className="mt-2 flex items-center justify-center gap-2 font-display text-5xl font-bold">
          <Coins className="size-9 text-primary" /> {formatCoins(wallet?.balance ?? 0)}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">Monsta Coins · demo balance, resets on reload</p>
      </div>

      <DemoNotice>Purchases in this milestone are demonstrations only — no payment provider is connected and no money moves.</DemoNotice>

      <h2 className="mt-8 mb-4 font-display text-lg font-semibold">Coin packages</h2>
      <Suspense fallback={<div className="grid h-64 grid-cols-4 gap-4"><div className="animate-pulse rounded-2xl bg-muted" /><div className="animate-pulse rounded-2xl bg-muted" /><div className="animate-pulse rounded-2xl bg-muted" /><div className="animate-pulse rounded-2xl bg-muted" /></div>}>
        <PackageGrid />
      </Suspense>

      <h2 className="mt-10 mb-4 font-display text-lg font-semibold">Recent coin activity</h2>
      <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-muted" />}>
        <RecentActivity />
      </Suspense>
    </div>
  );
}
