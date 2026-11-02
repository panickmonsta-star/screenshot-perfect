import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Save, ShieldCheck, Video, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageHeader } from "@/components/admin/admin-shared";
import { adminQueries, adminService } from "@/services";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({
    meta: [
      { title: "Platform settings — Panick Admin" },
      { name: "description", content: "Branding, currency and provider configuration placeholders." },
      { property: "og:title", content: "Platform settings — Panick Admin" },
      { property: "og:description", content: "Branding, currency and provider configuration placeholders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(adminQueries.platformSettings()),
  component: AdminSettingsPage,
});

function SettingsBody() {
  const { data: settings } = useSuspenseQuery(adminQueries.platformSettings());
  const qc = useQueryClient();
  const [values, setValues] = useState({
    platformName: settings.platformName,
    tagline: settings.tagline,
    coinName: settings.coinName,
    coinSymbol: settings.coinSymbol,
    supportEmail: settings.supportEmail,
  });

  const save = useMutation({
    mutationFn: () => adminService.updatePlatformSettings(values),
    onSuccess: () => {
      toast.success("Platform settings saved (demo)");
      void qc.invalidateQueries({ queryKey: ["admin", "platform-settings"] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
        <h2 className="font-display text-sm font-semibold">Branding</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="set-name">Platform name</Label>
            <Input id="set-name" value={values.platformName} onChange={(e) => setValues({ ...values, platformName: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="set-tagline">Tagline</Label>
            <Input id="set-tagline" value={values.tagline} onChange={(e) => setValues({ ...values, tagline: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="set-coin">Coin name</Label>
            <Input id="set-coin" value={values.coinName} onChange={(e) => setValues({ ...values, coinName: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="set-symbol">Coin symbol</Label>
            <Input id="set-symbol" value={values.coinSymbol} onChange={(e) => setValues({ ...values, coinSymbol: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="set-email">Support email</Label>
            <Input id="set-email" type="email" value={values.supportEmail} onChange={(e) => setValues({ ...values, supportEmail: e.target.value })} />
          </div>
        </div>
        <Button className="mt-5 gap-2" onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save settings
        </Button>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold"><Wallet className="size-4 text-primary" /> Currency & coins</h2>
        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-xl border border-border/50 px-4 py-3"><span className="text-muted-foreground">Default currency</span><span className="font-semibold">IDR (fixed)</span></div>
          <div className="flex items-center justify-between rounded-xl border border-border/50 px-4 py-3"><span className="text-muted-foreground">Coin display</span><span className="font-semibold">Number + symbol</span></div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Currency is pinned to IDR for the Indonesia launch; additional markets come with international expansion.</p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold"><Video className="size-4 text-primary" /> Providers</h2>
        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl border border-dashed border-border px-4 py-3"><p className="text-muted-foreground">Video provider</p><p className="mt-1 font-medium">{settings.videoProvider}</p></div>
          <div className="rounded-xl border border-dashed border-border px-4 py-3"><p className="text-muted-foreground">Payment provider</p><p className="mt-1 font-medium">{settings.paymentProvider}</p></div>
        </div>
        <p className="mt-3 flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-primary" />
          API keys and provider secrets are configured server-side, never in this frontend. Placeholder configuration only in Milestone 1.
        </p>
      </div>
    </div>
  );
}

function AdminSettingsPage() {
  return (
    <>
      <AdminPageHeader title="Platform settings" description="Branding, currency defaults and provider placeholders." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}><SettingsBody /></Suspense>
    </>
  );
}
