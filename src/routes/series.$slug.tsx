import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import { useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Clock3, Download, Eye, Flame, Lock, Play, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EpisodeRow } from "@/components/drama/cards";
import { DemoNotice } from "@/components/shared/states";
import { UnlockDialog } from "@/components/watch/unlock-dialog";
import { accessQueries, catalogQueries, walletQueries } from "@/services";
import { formatViews } from "@/lib/format";

export const Route = createFileRoute("/series/$slug")({
  head: () => ({
    meta: [
      { title: "Series — Panick Monsta" },
      { name: "description", content: "Short drama series details, episodes and unlock options." },
      { property: "og:title", content: "Series — Panick Monsta" },
      { property: "og:description", content: "Short drama series details, episodes and unlock options." },
      { property: "og:type", content: "video.tv_show" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context, params }) => {
    const series = await context.queryClient.ensureQueryData(catalogQueries.bySlug(params.slug));
    if (!series) throw notFound();
    await context.queryClient.ensureQueryData(catalogQueries.episodes(params.slug));
    return { series };
  },
  component: SeriesPage,
});

function EpisodeList({ slug }: { slug: string }) {
  const { data: series } = useSuspenseQuery(catalogQueries.bySlug(slug));
  const { data: episodes } = useSuspenseQuery(catalogQueries.episodes(slug));
  const { data: unlockedIds } = useSuspenseQuery(accessQueries.unlockedIds());
  const { data: wallet } = useQuery(walletQueries.balance());
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [unlockTarget, setUnlockTarget] = useState<string | null>(null);

  if (!series) return null;
  const target = episodes.find((e) => e.id === unlockTarget) ?? null;

  return (
    <>
      <div className="space-y-2">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Episodes ({episodes.length})</h2>
          <p className="text-xs text-muted-foreground">{episodes.filter((e) => e.isFree || unlockedIds.includes(e.id)).length} ready to watch</p>
        </div>
        {episodes.map((e) => (
          <EpisodeRow
            key={e.id}
            episode={e}
            locked={!e.isFree && !unlockedIds.includes(e.id)}
            onPlay={() => {
              if (!e.isFree && !unlockedIds.includes(e.id)) setUnlockTarget(e.id);
              else void navigate({ to: "/watch/$slug/$episode", params: { slug, episode: e.episodeNumber } });
            }}
          />
        ))}
      </div>
      {target ? (
        <UnlockDialog
          open
          onOpenChange={(open) => !open && setUnlockTarget(null)}
          episodeId={target.id}
          episodeTitle={target.title}
          seriesTitle={series.title}
          coinPrice={target.coinPrice}
          coinBalance={wallet?.balance ?? 0}
          onUnlocked={() => {
            void qc.invalidateQueries({ queryKey: ["access"] });
            void qc.invalidateQueries({ queryKey: ["wallet"] });
          }}
        />
      ) : null}
    </>
  );
}

function SeriesPage() {
  const { slug } = Route.useParams();
  const { data: series } = useSuspenseQuery(catalogQueries.bySlug(slug));
  const { data: episodes } = useSuspenseQuery(catalogQueries.episodes(slug));
  if (!series) return null;
  const freeCount = episodes.filter((e) => e.isFree).length;
  const downloadableCount = episodes.filter((e) => e.downloadEnabled).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <img src={series.posterUrl} alt={`${series.title} poster`} className="aspect-poster w-full max-w-[300px] rounded-2xl border border-border/60 object-cover shadow-[var(--shadow-cinema)]" />
          <div className="mt-4 space-y-2">
            <Link to="/watch/$slug/$episode" params={{ slug: series.slug, episode: 1 }}>
              <Button size="lg" className="w-full gap-2 rounded-xl font-semibold">
                <Play className="size-4 fill-current" /> Start watching
              </Button>
            </Link>
            <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CalendarDays className="size-3.5" /> {series.releaseYear}</span>
              <span className="flex items-center gap-1"><Clock3 className="size-3.5" /> ~{Math.round(episodes.reduce((a, e) => a + e.durationSeconds, 0) / 60)} min total</span>
              <span className="flex items-center gap-1"><Download className="size-3.5" /> {downloadableCount} downloadable</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {series.trending ? <Badge className="gap-1 bg-primary text-primary-foreground"><Flame className="size-3" /> Trending</Badge> : null}
              {series.featured ? <Badge variant="secondary" className="gap-1"><Sparkles className="size-3" /> Featured</Badge> : null}
              <Badge variant="outline">{series.genre}</Badge>
            </div>
            <h1 className="font-display text-3xl font-bold sm:text-4xl">{series.title}</h1>
            <p className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1"><Eye className="size-4" /> {formatViews(series.totalViews)} views</span>
              <span>{episodes.length} episodes</span>
              <span>{freeCount} free · {episodes.length - freeCount} coin-unlocked</span>
            </p>
            <p className="max-w-3xl leading-relaxed text-foreground/85">{series.synopsis}</p>
          </div>

          <DemoNotice>Episode prices, unlock states and downloads in this build are demonstration data.</DemoNotice>

          <Suspense fallback={<div className="h-64 animate-pulse rounded-2xl bg-muted" />}>
            <EpisodeList slug={series.slug} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
