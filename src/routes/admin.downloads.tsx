import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download, Film, Loader2, Save, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminPageHeader, AdminTableWrap } from "@/components/admin/admin-shared";
import { adminQueries, adminService } from "@/services";
import type { DownloadProcessingStatus } from "@/types/domain";

export const Route = createFileRoute("/admin/downloads")({
  head: () => ({
    meta: [
      { title: "Downloads & watermark — Panick Admin" },
      { name: "description", content: "Choose downloadable episodes and configure the watermark." },
      { property: "og:title", content: "Downloads & watermark — Panick Admin" },
      { property: "og:description", content: "Choose downloadable episodes and configure the watermark." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(adminQueries.downloadRows()),
      context.queryClient.ensureQueryData(adminQueries.downloadSettings()),
      context.queryClient.ensureQueryData(adminQueries.series()),
    ]);
  },
  component: AdminDownloadsPage,
});

const statusLabel: Record<DownloadProcessingStatus, { text: string; className: string }> = {
  not_started: { text: "Not started", className: "border-border text-muted-foreground" },
  processing: { text: "Processing", className: "border-amber-500/30 text-amber-400" },
  ready: { text: "Ready", className: "border-emerald-500/30 text-emerald-400" },
  failed: { text: "Failed", className: "border-destructive/30 text-destructive" },
};

function WatermarkForm() {
  const { data: settings } = useSuspenseQuery(adminQueries.downloadSettings());
  const qc = useQueryClient();
  const [values, setValues] = useState({ platformName: settings.platformName, watermarkText: settings.watermarkText, watermarkLogoUrl: settings.watermarkLogoUrl ?? "", positions: settings.positions, bulkFirstFiveEpisodes: settings.bulkFirstFiveEpisodes });

  const save = useMutation({
    mutationFn: () => adminService.updateDownloadSettings(values),
    onSuccess: () => {
      toast.success("Download settings saved (demo)", { description: "Actual watermark processing is built in a later milestone." });
      void qc.invalidateQueries({ queryKey: ["admin", "download-settings"] });
      void qc.invalidateQueries({ queryKey: ["admin", "download-rows"] });
    },
  });

  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
      <h2 className="flex items-center gap-2 font-display text-sm font-semibold"><Wand2 className="size-4 text-primary" /> Watermark configuration</h2>
      <p className="mt-1 text-xs text-muted-foreground">Downloaded files will carry a permanently embedded, moving watermark. Processing itself is not implemented in this milestone.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="w-platform">Platform name</Label>
          <Input id="w-platform" value={values.platformName} onChange={(e) => setValues({ ...values, platformName: e.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="w-text">Watermark text</Label>
          <Input id="w-text" value={values.watermarkText} onChange={(e) => setValues({ ...values, watermarkText: e.target.value })} />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="w-logo">Watermark logo URL (optional)</Label>
          <Input id="w-logo" placeholder="https://…" value={values.watermarkLogoUrl} onChange={(e) => setValues({ ...values, watermarkLogoUrl: e.target.value })} />
          <p className="text-xs text-muted-foreground">Never paste private keys or tokens here — public URLs only.</p>
        </div>
      </div>
      <div className="mt-4">
        <Label>Duration-based positioning</Label>
        <div className="mt-2 space-y-2">
          {values.positions.map((pos, i) => (
            <div key={i} className="grid grid-cols-[80px_80px_1fr] items-center gap-3">
              <Input type="number" min={0} aria-label={`Start second ${i + 1}`} value={pos.fromSecond} onChange={(e) => { const next = [...values.positions]; next[i] = { ...pos, fromSecond: Number(e.target.value) }; setValues({ ...values, positions: next }); }} />
              <Input type="number" min={0} aria-label={`End second ${i + 1}`} value={pos.toSecond} onChange={(e) => { const next = [...values.positions]; next[i] = { ...pos, toSecond: Number(e.target.value) }; setValues({ ...values, positions: next }); }} />
              <Select value={pos.position} onValueChange={(v) => { const next = [...values.positions]; next[i] = { ...pos, position: v }; setValues({ ...values, positions: next }); }}>
                <SelectTrigger aria-label={`Watermark position ${i + 1}`}><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="top-left">Top left</SelectItem>
                  <SelectItem value="top-right">Top right</SelectItem>
                  <SelectItem value="bottom-left">Bottom left</SelectItem>
                  <SelectItem value="bottom-center">Bottom center</SelectItem>
                  <SelectItem value="bottom-right">Bottom right</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">Each row is a second-range and where the watermark moves during it.</p>
      </div>
      <label className="mt-4 flex items-center gap-2 text-sm">
        <Switch checked={values.bulkFirstFiveEpisodes} onCheckedChange={(c) => setValues({ ...values, bulkFirstFiveEpisodes: c })} />
        Automatically mark the first five episodes of selected series as downloadable
      </label>
      <Button className="mt-5 gap-2" onClick={() => save.mutate()} disabled={save.isPending}>
        {save.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save settings
      </Button>
    </div>
  );
}

function BulkFirstFive() {
  const { data: seriesList } = useSuspenseQuery(adminQueries.series());
  const qc = useQueryClient();
  const apply = useMutation({
    mutationFn: (slug: string) => adminService.applyBulkFirstFive(slug),
    onSuccess: () => {
      toast.success("First five episodes marked downloadable (demo)");
      void qc.invalidateQueries({ queryKey: ["admin", "download-rows"] });
    },
  });
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
      <h2 className="font-display text-sm font-semibold">Quick action: first five episodes</h2>
      <p className="mt-1 text-xs text-muted-foreground">Marks episodes 1–5 of a chosen series as downloadable in one step.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {seriesList.map((s) => (
          <Button key={s.id} variant="outline" size="sm" onClick={() => apply.mutate(s.slug)}>{s.title}</Button>
        ))}
      </div>
    </div>
  );
}

function DownloadsBody() {
  const { data: rows } = useSuspenseQuery(adminQueries.downloadRows());
  const qc = useQueryClient();
  const toggle = useMutation({
    mutationFn: ({ episodeId, eligible }: { episodeId: string; eligible: boolean }) => adminService.setEpisodeEligibility(episodeId, eligible),
    onSuccess: () => {
      toast.success("Eligibility updated (demo)");
      void qc.invalidateQueries({ queryKey: ["admin", "download-rows"] });
    },
  });

  return (
    <AdminTableWrap>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-card/80 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Series / Episode</th>
              <th className="px-4 py-3 font-medium text-center">Eligible</th>
              <th className="px-4 py-3 font-medium">Processing status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 bg-card/40">
            {rows.map((r) => (
              <tr key={r.episodeId} className="transition-colors hover:bg-accent/40">
                <td className="px-4 py-3">
                  <p className="font-medium"><span className="text-muted-foreground">EP{r.episodeNumber}</span> · {r.episodeTitle}</p>
                  <p className="text-xs text-muted-foreground">{r.seriesTitle}</p>
                </td>
                <td className="px-4 py-3 text-center"><Switch checked={r.eligible} onCheckedChange={(c) => toggle.mutate({ episodeId: r.episodeId, eligible: c })} aria-label={`Toggle download eligibility for ${r.episodeTitle}`} /></td>
                <td className="px-4 py-3"><Badge variant="outline" className={statusLabel[r.processingStatus].className}>{statusLabel[r.processingStatus].text}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminTableWrap>
  );
}

function AdminDownloadsPage() {
  return (
    <>
      <AdminPageHeader title="Promotional downloads" description="Choose which episodes can be downloaded and configure the embedded watermark." />
      <div className="space-y-6">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}><WatermarkForm /></Suspense>
        <Suspense fallback={<div className="h-32 animate-pulse rounded-2xl bg-muted" />}><BulkFirstFive /></Suspense>
        <div>
          <h2 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold"><Download className="size-4 text-primary" /> Episode eligibility</h2>
          <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}><DownloadsBody /></Suspense>
        </div>
        <p className="flex items-center gap-2 text-xs text-muted-foreground"><Film className="size-3.5" /> Files, watermark rendering and signed download URLs arrive with the real processing pipeline in a later milestone.</p>
      </div>
    </>
  );
}
