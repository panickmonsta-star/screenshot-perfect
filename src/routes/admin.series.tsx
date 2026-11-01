import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense, useMemo, useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Archive, Loader2, Pencil, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminPageHeader, AdminTableWrap, PublicationBadge } from "@/components/admin/admin-shared";
import { adminQueries, adminService } from "@/services";
import { posters } from "@/assets/posters";
import { formatViews, slugify } from "@/lib/format";
import type { PublicationStatus, Series } from "@/types/domain";

export const Route = createFileRoute("/admin/series")({
  head: () => ({
    meta: [
      { title: "Series management — Panick Admin" },
      { name: "description", content: "Create, edit and archive drama series." },
      { property: "og:title", content: "Series management — Panick Admin" },
      { property: "og:description", content: "Create, edit and archive drama series." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(adminQueries.series()),
  component: AdminSeriesPage,
});

const GENRES = ["Romance", "Thriller", "Fantasy", "Comedy", "Mystery", "Drama", "Horror", "Action"];

interface SeriesFormValues {
  id: string | null;
  title: string;
  slug: string;
  synopsis: string;
  genre: string;
  releaseYear: number;
  status: PublicationStatus;
  featured: boolean;
  trending: boolean;
}

const emptyForm: SeriesFormValues = {
  id: null,
  title: "",
  slug: "",
  synopsis: "",
  genre: "Romance",
  releaseYear: 2026,
  status: "draft",
  featured: false,
  trending: false,
};

function SeriesDialog({ form, onClose }: { form: SeriesFormValues | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [values, setValues] = useState<SeriesFormValues>(form ?? emptyForm);
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      const input = {
        title: values.title.trim(),
        slug: values.slug.trim() || slugify(values.title),
        synopsis: values.synopsis.trim(),
        genre: values.genre as Series["genre"],
        releaseYear: Number(values.releaseYear) || 2026,
        posterUrl: posters.cintaDiBalikKaca, // placeholder poster until real uploads exist
        status: values.status,
        featured: values.featured,
        trending: values.trending,
      };
      if (!input.title) throw new Error("Title is required.");
      if (values.id) return adminService.updateSeries(values.id, input);
      return adminService.createSeries(input);
    },
    onSuccess: () => {
      toast.success(values.id ? "Series updated" : "Series created", { description: "Saved to in-memory demo data — resets on reload." });
      void qc.invalidateQueries({ queryKey: ["admin", "series"] });
      onClose();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Save failed."),
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{values.id ? "Edit series" : "New series"}</DialogTitle>
          <DialogDescription>Demo write — changes live in memory only for this session.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="s-title">Title</Label>
            <Input id="s-title" value={values.title} onChange={(e) => setValues({ ...values, title: e.target.value, slug: values.id ? values.slug : slugify(e.target.value) })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-slug">Slug</Label>
            <Input id="s-slug" value={values.slug} onChange={(e) => setValues({ ...values, slug: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="s-syn">Synopsis</Label>
            <Textarea id="s-syn" rows={3} value={values.synopsis} onChange={(e) => setValues({ ...values, synopsis: e.target.value })} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Genre</Label>
              <Select value={values.genre} onValueChange={(v) => setValues({ ...values, genre: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{GENRES.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
              </Select>
            </div>
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
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="s-year">Release year</Label>
              <Input id="s-year" type="number" value={values.releaseYear} onChange={(e) => setValues({ ...values, releaseYear: Number(e.target.value) })} />
            </div>
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-sm"><Switch checked={values.featured} onCheckedChange={(c) => setValues({ ...values, featured: c })} /> Featured</label>
              <label className="flex items-center gap-2 text-sm"><Switch checked={values.trending} onCheckedChange={(c) => setValues({ ...values, trending: c })} /> Trending</label>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Poster/cover upload arrives with real storage in Milestone 2; new demo series reuse a placeholder poster.</p>
          {error ? <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p> : null}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null} Save series
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SeriesTable() {
  const { data: seriesList } = useSuspenseQuery(adminQueries.series());
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<SeriesFormValues | null>(null);
  const PAGE_SIZE = 8;

  const rows = useMemo(() => {
    let list = seriesList.filter((s) => s.title.toLowerCase().includes(query.toLowerCase()));
    if (sort === "title") list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === "views") list = [...list].sort((a, b) => b.totalViews - a.totalViews);
    return list;
  }, [seriesList, query, sort]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const archive = useMutation({
    mutationFn: (id: string) => adminService.archiveSeries(id),
    onSuccess: () => {
      toast.success("Series archived (demo)");
      void qc.invalidateQueries({ queryKey: ["admin", "series"] });
    },
  });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search series…" aria-label="Search series" className="pl-9" />
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-40" aria-label="Sort"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="title">Title A–Z</SelectItem>
            <SelectItem value="views">Most viewed</SelectItem>
          </SelectContent>
        </Select>
        <Button className="gap-2" onClick={() => setEditing({ ...emptyForm })}><Plus className="size-4" /> New series</Button>
      </div>

      <AdminTableWrap>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-card/80 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Series</th>
                <th className="px-4 py-3 font-medium">Genre</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Views</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-card/40">
              {paged.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-accent/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={s.posterUrl} alt="" className="h-12 w-8 rounded object-cover" />
                      <div className="min-w-0">
                        <Link to="/series/$slug" params={{ slug: s.slug }} className="truncate font-medium hover:text-primary">{s.title}</Link>
                        <p className="font-mono text-xs text-muted-foreground">/{s.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{s.genre}</td>
                  <td className="px-4 py-3"><PublicationBadge status={s.status} /></td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatViews(s.totalViews)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="ghost" size="icon" aria-label={`Edit ${s.title}`} onClick={() => setEditing({ id: s.id, title: s.title, slug: s.slug, synopsis: s.synopsis, genre: s.genre, releaseYear: s.releaseYear, status: s.status, featured: s.featured, trending: s.trending })}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" aria-label={`Archive ${s.title}`} disabled={s.status === "archived" || archive.isPending} onClick={() => archive.mutate(s.id)}>
                        <Archive className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminTableWrap>
      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        </div>
      ) : null}
      {editing ? <SeriesDialog form={editing} onClose={() => setEditing(null)} /> : null}
    </>
  );
}

function AdminSeriesPage() {
  return (
    <>
      <AdminPageHeader title="Series management" description="Create, edit and archive drama series (demo data)." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}><SeriesTable /></Suspense>
    </>
  );
}
