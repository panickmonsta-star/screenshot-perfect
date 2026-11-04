import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useMemo, useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Loader2, Lock, Pencil, Plus, Search, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AdminPageHeader, AdminTableWrap, PublicationBadge } from "@/components/admin/admin-shared";
import { adminQueries, adminService } from "@/services";
import { formatDuration } from "@/lib/format";
import type { PublicationStatus } from "@/types/domain";

export const Route = createFileRoute("/admin/episodes")({
  head: () => ({
    meta: [
      { title: "Episode management — Panick Admin" },
      { name: "description", content: "Create and edit episodes, free/paid settings and ordering." },
      { property: "og:title", content: "Episode management — Panick Admin" },
      { property: "og:description", content: "Create and edit episodes, free/paid settings and ordering." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(adminQueries.episodes()),
  component: AdminEpisodesPage,
});

interface EpisodeFormValues {
  id: string | null;
  seriesId: string;
  episodeNumber: number;
  title: string;
  description: string;
  durationSeconds: number;
  isFree: boolean;
  coinPrice: number;
  status: PublicationStatus;
  downloadEnabled: boolean;
}

function EpisodesDialog({ form, onClose }: { form: EpisodeFormValues; onClose: () => void }) {
  const qc = useQueryClient();
  const { data: seriesList } = useSuspenseQuery(adminQueries.series());
  const [values, setValues] = useState<EpisodeFormValues>(form);
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      const input = { ...values, title: values.title.trim(), description: values.description.trim(), coinPrice: values.isFree ? 0 : Number(values.coinPrice), videoUrl: null };
      if (!input.seriesId) throw new Error("Pick a series first.");
      if (!input.title) throw new Error("Episode title is required.");
      if (values.id) return adminService.updateEpisode(values.id, input);
      return adminService.createEpisode(input);
    },
    onSuccess: () => {
      toast.success(values.id ? "Episode updated" : "Episode created", { description: "Saved to in-memory demo data — resets on reload." });
      void qc.invalidateQueries({ queryKey: ["admin"] });
      onClose();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Save failed."),
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{values.id ? "Edit episode" : "New episode"}</DialogTitle>
          <DialogDescription>Demo write — changes live in memory only for this session.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Series</Label>
            <Select value={values.seriesId} onValueChange={(v) => setValues({ ...values, seriesId: v })} disabled={Boolean(values.id)}>
              <SelectTrigger><SelectValue placeholder="Choose a series" /></SelectTrigger>
              <SelectContent>{seriesList.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="e-num">Episode number</Label>
              <Input id="e-num" type="number" min={1} value={values.episodeNumber} onChange={(e) => setValues({ ...values, episodeNumber: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-dur">Duration (seconds)</Label>
              <Input id="e-dur" type="number" min={30} value={values.durationSeconds} onChange={(e) => setValues({ ...values, durationSeconds: Number(e.target.value) })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-title">Title</Label>
            <Input id="e-title" value={values.title} onChange={(e) => setValues({ ...values, title: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="e-desc">Description</Label>
            <Textarea id="e-desc" rows={2} value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={values.status} onValueChange={(v) => setValues({ ...values, status: v as PublicationStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="e-price">Coin price (paid episodes)</Label>
              <Input id="e-price" type="number" min={0} value={values.coinPrice} disabled={values.isFree} onChange={(e) => setValues({ ...values, coinPrice: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm"><Switch checked={values.isFree} onCheckedChange={(c) => setValues({ ...values, isFree: c, coinPrice: c ? 0 : 20 })} /> Free episode</label>
            <label className="flex items-center gap-2 text-sm"><Switch checked={values.downloadEnabled} onCheckedChange={(c) => setValues({ ...values, downloadEnabled: c })} /> Download enabled</label>
          </div>
          <p className="text-xs text-muted-foreground">Thumbnail reuses the series poster and video reference stays a placeholder until a provider is connected in Milestone 2.</p>
          {error ? <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p> : null}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null} Save episode
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EpisodesTable() {
  const { data: episodes } = useSuspenseQuery(adminQueries.episodes());
  const { data: seriesList } = useSuspenseQuery(adminQueries.series());
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [seriesFilter, setSeriesFilter] = useState("all");
  const [editing, setEditing] = useState<EpisodeFormValues | null>(null);
  const seriesTitle = (id: string) => seriesList.find((s) => s.id === id)?.title ?? "—";

  const rows = useMemo(() => {
    return episodes.filter(
      (e) =>
        (seriesFilter === "all" || e.seriesId === seriesFilter) &&
        (e.title.toLowerCase().includes(query.toLowerCase()) || String(e.episodeNumber).includes(query)),
    );
  }, [episodes, query, seriesFilter]);

  const update = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof adminService.updateEpisode>[1] }) => adminService.updateEpisode(id, patch),
    onSuccess: () => {
      toast.success("Episode updated (demo)");
      void qc.invalidateQueries({ queryKey: ["admin"] });
    },
  });

  const reorder = (episodeId: string, dir: "up" | "down") => {
    const current = episodes.find((e) => e.id === episodeId);
    if (!current) return;
    const sibling = episodes
      .filter((e) => e.seriesId === current.seriesId)
      .find((e) => e.episodeNumber === (dir === "up" ? current.episodeNumber - 1 : current.episodeNumber + 1));
    if (!sibling) return;
    void update.mutateAsync({ id: current.id, patch: { episodeNumber: sibling.episodeNumber } });
    void update.mutateAsync({ id: sibling.id, patch: { episodeNumber: current.episodeNumber } });
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search episodes…" aria-label="Search episodes" className="pl-9" />
        </div>
        <Select value={seriesFilter} onValueChange={setSeriesFilter}>
          <SelectTrigger className="w-56" aria-label="Filter by series"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All series</SelectItem>
            {seriesList.map((s) => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button
          className="gap-2"
          onClick={() =>
            setEditing({ id: null, seriesId: seriesList[0]?.id ?? "", episodeNumber: 1, title: "", description: "", durationSeconds: 240, isFree: true, coinPrice: 0, status: "draft", downloadEnabled: false })
          }
        >
          <Plus className="size-4" /> New episode
        </Button>
      </div>

      <AdminTableWrap>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="bg-card/80 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Series / Episode</th>
                <th className="px-4 py-3 font-medium">Access</th>
                <th className="px-4 py-3 font-medium text-right">Duration</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-center">Download</th>
                <th className="px-4 py-3 font-medium text-right">Order / Edit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-card/40">
              {rows.map((e) => (
                <tr key={e.id} className="transition-colors hover:bg-accent/40">
                  <td className="px-4 py-3">
                    <p className="font-medium"><span className="text-muted-foreground">EP{e.episodeNumber}</span> · {e.title}</p>
                    <p className="text-xs text-muted-foreground">{seriesTitle(e.seriesId)}</p>
                  </td>
                  <td className="px-4 py-3">
                    {e.isFree ? (
                      <Badge variant="outline" className="gap-1 text-emerald-400 border-emerald-500/30"><Unlock className="size-3" /> Free</Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-primary border-primary/40"><Lock className="size-3" /> {e.coinPrice} coins</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatDuration(e.durationSeconds)}</td>
                  <td className="px-4 py-3"><PublicationBadge status={e.status} /></td>
                  <td className="px-4 py-3 text-center">
                    <Switch checked={e.downloadEnabled} onCheckedChange={(c) => update.mutate({ id: e.id, patch: { downloadEnabled: c } })} aria-label={`Toggle download for ${e.title}`} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" aria-label={`Move episode up`} onClick={() => reorder(e.id, "up")}><ArrowUp className="size-4" /></Button>
                      <Button variant="ghost" size="icon" aria-label={`Move episode down`} onClick={() => reorder(e.id, "down")}><ArrowDown className="size-4" /></Button>
                      <Button variant="ghost" size="icon" aria-label={`Edit ${e.title}`} onClick={() => setEditing({ id: e.id, seriesId: e.seriesId, episodeNumber: e.episodeNumber, title: e.title, description: e.description, durationSeconds: e.durationSeconds, isFree: e.isFree, coinPrice: e.coinPrice, status: e.status, downloadEnabled: e.downloadEnabled })}>
                        <Pencil className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminTableWrap>
      {editing ? <EpisodesDialog form={editing} onClose={() => setEditing(null)} /> : null}
    </>
  );
}

function AdminEpisodesPage() {
  return (
    <>
      <AdminPageHeader title="Episode management" description="Associate episodes with series, set free/paid and pricing, order them." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}><EpisodesTable /></Suspense>
    </>
  );
}
