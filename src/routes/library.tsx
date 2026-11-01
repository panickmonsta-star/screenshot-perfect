import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { BookmarkCheck, Clock, Film, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/states";
import { SeriesCard } from "@/components/drama/cards";
import { accessQueries, catalogQueries, libraryQueries } from "@/services";
import { formatDate, formatDuration } from "@/lib/format";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "My library — Panick Monsta" },
      { name: "description", content: "Your unlocked episodes, continue watching and recently watched series." },
      { property: "og:title", content: "My library — Panick Monsta" },
      { property: "og:description", content: "Your unlocked episodes, continue watching and recently watched series." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(accessQueries.unlocked()),
      context.queryClient.ensureQueryData(libraryQueries.continueWatching()),
      context.queryClient.ensureQueryData(libraryQueries.recent()),
      context.queryClient.ensureQueryData(catalogQueries.list({})),
    ]);
  },
  component: LibraryPage,
});

function ContinueWatching() {
  const { data } = useSuspenseQuery(libraryQueries.continueWatching());
  if (data.length === 0) {
    return (
      <EmptyState
        icon={<Play className="size-8" />}
        title="Nothing to continue yet"
        description="Start any episode and it will appear here with your progress."
        action={<Link to="/explore"><Button>Browse dramas</Button></Link>}
      />
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((p) => (
        <Link key={p.seriesId} to="/watch/$slug/$episode" params={{ slug: p.seriesSlug, episode: p.episodeNumber }} className="group flex gap-3 rounded-2xl border border-border/60 bg-card/70 p-3 transition-colors hover:border-primary/40">
          <div className="relative aspect-poster w-20 shrink-0 overflow-hidden rounded-xl">
            <img src={p.posterUrl} alt="" className="size-full object-cover" loading="lazy" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Play className="size-6 fill-current text-white" />
            </span>
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
            <div className="min-w-0">
              <p className="truncate font-medium">{p.seriesTitle}</p>
              <p className="truncate text-xs text-muted-foreground">EP{p.episodeNumber} · {p.episodeTitle}</p>
            </div>
            <div>
              <div className="h-1 rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((p.positionSeconds / p.durationSeconds) * 100)}%` }} /></div>
              <p className="mt-1 text-[10px] text-muted-foreground">{formatDuration(p.positionSeconds)} / {formatDuration(p.durationSeconds)}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function UnlockedSection() {
  const { data: unlocked } = useSuspenseQuery(accessQueries.unlocked());
  const { data: seriesList } = useSuspenseQuery(catalogQueries.list({}));

  if (unlocked.length === 0) {
    return (
      <EmptyState
        icon={<BookmarkCheck className="size-8" />}
        title="No unlocked episodes yet"
        description="Episodes you unlock with coins stay in your library forever."
        action={<Link to="/wallet"><Button>Get coins</Button></Link>}
      />
    );
  }

  const bySeries = new Map<string, typeof unlocked>();
  unlocked.forEach((u) => {
    const list = bySeries.get(u.seriesId) ?? [];
    list.push(u);
    bySeries.set(u.seriesId, list);
  });

  return (
    <div className="space-y-6">
      {[...bySeries.entries()].map(([seriesId, items]) => {
        const series = seriesList.find((s) => s.id === seriesId);
        return (
          <div key={seriesId} className="rounded-2xl border border-border/60 bg-card/60 p-4">
            <div className="flex items-center gap-3">
              {series ? (
                <Link to="/series/$slug" params={{ slug: series.slug }} className="flex items-center gap-3">
                  <img src={series.posterUrl} alt="" className="aspect-poster h-16 w-11 rounded-md object-cover" />
                  <div>
                    <p className="font-medium">{series.title}</p>
                    <p className="text-xs text-muted-foreground">{series.genre}</p>
                  </div>
                </Link>
              ) : null}
            </div>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {items.map((u) => (
                <li key={u.episodeId}>
                  <Link
                    to="/watch/$slug/$episode"
                    params={{ slug: u.seriesSlug, episode: u.episodeNumber }}
                    className="flex items-center justify-between rounded-xl border border-border/50 px-3 py-2 text-sm transition-colors hover:border-primary/40 hover:bg-accent/40"
                  >
                    <span>EP{u.episodeNumber}</span>
                    <span className="text-xs text-muted-foreground">Unlocked {formatDate(u.unlockedAt)} · {u.source === "coins" ? "coins" : "free"}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function RecentlyWatched() {
  const { data } = useSuspenseQuery(libraryQueries.recent());
  if (data.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {data.map((p) => (
        <div key={p.seriesId} className="space-y-1.5">
          <Link to="/watch/$slug/$episode" params={{ slug: p.seriesSlug, episode: p.episodeNumber }} className="block">
            <div className="poster-hover relative aspect-poster overflow-hidden rounded-xl border border-border/50">
              <img src={p.posterUrl} alt="" className="size-full object-cover" loading="lazy" />
              <Badge variant="secondary" className="absolute bottom-2 left-2 gap-1 text-[10px]"><Clock className="size-3" /> {formatDuration(p.positionSeconds)}</Badge>
            </div>
          </Link>
          <p className="truncate text-xs font-medium">{p.seriesTitle}</p>
          <p className="truncate text-[11px] text-muted-foreground">EP{p.episodeNumber}</p>
        </div>
      ))}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 font-display text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function LibraryPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold"><Film className="size-6 text-primary" /> My library</h1>
      <p className="mt-1 text-sm text-muted-foreground">Everything you've unlocked and watched in this demo build.</p>

      <Suspense fallback={<div className="mt-10 h-32 animate-pulse rounded-2xl bg-muted" />}><Section title="Continue watching"><ContinueWatching /></Section></Suspense>
      <Suspense fallback={<div className="mt-10 h-48 animate-pulse rounded-2xl bg-muted" />}><Section title="Unlocked episodes"><UnlockedSection /></Section></Suspense>
      <Suspense fallback={<div className="mt-10 h-48 animate-pulse rounded-2xl bg-muted" />}><Section title="Recently watched"><RecentlyWatched /></Section></Suspense>
    </div>
  );
}
