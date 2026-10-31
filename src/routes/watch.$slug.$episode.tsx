import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import { useQuery, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Download, Loader2, List, Lock, Play, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { EpisodeRow } from "@/components/drama/cards";
import { MockPlayer } from "@/components/watch/mock-player";
import { UnlockDialog } from "@/components/watch/unlock-dialog";
import { accessQueries, catalogQueries, mediaService, walletQueries } from "@/services";
import { formatCoins } from "@/lib/format";

export const Route = createFileRoute("/watch/$slug/$episode")({
  params: {
    parse: (p) => ({ slug: p.slug, episode: Number(p.episode) }),
    stringify: (p) => ({ slug: p.slug, episode: String(p.episode) }),
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: loaderData ? `${loaderData.series.title} · EP${loaderData.episode.episodeNumber} — Panick Monsta` : "Watch — Panick Monsta" },
      { name: "description", content: loaderData ? `Watch episode ${loaderData.episode.episodeNumber} of ${loaderData.series.title}.` : "Watch a short drama episode." },
      { property: "og:title", content: loaderData ? `${loaderData.series.title} · EP${loaderData.episode.episodeNumber}` : "Watch — Panick Monsta" },
      { property: "og:description", content: loaderData ? `Watch episode ${loaderData.episode.episodeNumber} of ${loaderData.series.title}.` : "Watch a short drama episode." },
      { property: "og:type", content: "video.other" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(catalogQueries.watch(params.slug, params.episode));
    if (!data) throw notFound();
    await Promise.all([
      context.queryClient.ensureQueryData(accessQueries.check(data.episode.id)),
      context.queryClient.ensureQueryData(catalogQueries.episodes(params.slug)),
      context.queryClient.ensureQueryData(walletQueries.balance()),
    ]);
    return data;
  },
  component: WatchPage,
});

function WatchBody() {
  const { series, episode, neighbours } = Route.useLoaderData();
  const { data: access } = useSuspenseQuery(accessQueries.check(episode.id));
  const { data: wallet } = useQuery(walletQueries.balance());
  const { data: episodes } = useSuspenseQuery(catalogQueries.episodes(series.slug));
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const unlocked = access.reason === "free" || access.reason === "unlocked";

  const goTo = (n: number | null) => {
    if (n === null) return;
    void navigate({ to: "/watch/$slug/$episode", params: { slug: series.slug, episode: n } });
  };

  const download = async () => {
    setDownloading(true);
    try {
      const res = await mediaService.requestDownload(episode.id);
      toast.info("Download queued (demo)", { description: `${res.jobReference} — ${res.message}` });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <div>
          <Link to="/series/$slug" params={{ slug: series.slug }} className="text-sm text-muted-foreground hover:text-primary">
            ← Back to {series.title}
          </Link>
          <h1 className="mt-2 font-display text-xl font-bold sm:text-2xl">
            {series.title} <span className="text-muted-foreground">· EP{episode.episodeNumber} {episode.title}</span>
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant={unlocked ? "secondary" : "outline"} className="gap-1">
              {unlocked ? <Play className="size-3" /> : <Lock className="size-3" />}
              {episode.isFree ? "Free episode" : access.reason === "unlocked" ? "Unlocked" : `${episode.coinPrice} coins to unlock`}
            </Badge>
            {episode.downloadEnabled ? <Badge variant="outline" className="gap-1"><Download className="size-3" /> Download available</Badge> : null}
          </div>
        </div>

        {unlocked ? (
          <MockPlayer
            posterUrl={episode.thumbnailUrl}
            episodeId={episode.id}
            seriesId={series.id}
            durationSeconds={episode.durationSeconds}
            title={episode.title}
          />
        ) : (
          <div className="relative mx-auto w-full max-w-[430px]">
            <div className="relative aspect-[9/16] overflow-hidden rounded-2xl border border-border/60 bg-black">
              <img src={episode.thumbnailUrl} alt="" className="size-full object-cover opacity-40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-8 text-center">
                <span className="flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Lock className="size-7" />
                </span>
                <div>
                  <p className="font-display text-lg font-semibold text-white">This episode is locked</p>
                  <p className="mt-1 text-sm text-white/70">
                    Unlock for {formatCoins(episode.coinPrice)} coins. Balance: {formatCoins(wallet?.balance ?? 0)} coins.
                  </p>
                </div>
                <Button className="gap-2 rounded-full font-semibold" onClick={() => setUnlockOpen(true)}>
                  <Lock className="size-4" /> Unlock episode
                </Button>
                <p className="max-w-xs text-[11px] leading-relaxed text-white/50">
                  Access control in this preview is illustrative only — real authorization is enforced server-side in Milestone 2.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto flex w-full max-w-[430px] items-center justify-between gap-3">
          <Button variant="outline" className="gap-1" disabled={neighbours.prev === null} onClick={() => goTo(neighbours.prev?.episodeNumber ?? null)}>
            <ChevronLeft className="size-4" /> Prev
          </Button>
          <div className="flex gap-2">
            {episode.downloadEnabled ? (
              <Button variant="outline" className="gap-2" onClick={download} disabled={downloading}>
                {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />} Download
              </Button>
            ) : null}
          </div>
          <Button variant="outline" className="gap-1" disabled={neighbours.next === null} onClick={() => goTo(neighbours.next?.episodeNumber ?? null)}>
            Next <ChevronRight className="size-4" />
          </Button>
        </div>

        <p className="mx-auto max-w-[430px] text-xs leading-relaxed text-muted-foreground">{episode.description}</p>
      </div>

      <aside className="space-y-4">
        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/70 px-4 py-3">
          <span className="flex items-center gap-2 text-sm text-muted-foreground"><WalletIcon className="size-4 text-primary" /> Coin balance</span>
          <Link to="/wallet" className="font-semibold text-primary hover:underline">{formatCoins(wallet?.balance ?? 0)} coins</Link>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/60">
          <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
            <h2 className="font-display text-sm font-semibold">Episodes</h2>
            <div className="lg:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open episode list"><List className="size-4" /></Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 overflow-y-auto bg-background">
                  <SheetHeader><SheetTitle>Episodes of {series.title}</SheetTitle></SheetHeader>
                  <EpisodePicker slug={series.slug} current={episode.episodeNumber} onPick={(n) => { goTo(n); }} />
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <div className="hidden max-h-[70vh] space-y-2 overflow-y-auto p-3 lg:block">
            <EpisodePicker slug={series.slug} current={episode.episodeNumber} onPick={(n) => goTo(n)} />
          </div>
        </div>
      </aside>

      {unlockOpen ? (
        <UnlockDialog
          open
          onOpenChange={setUnlockOpen}
          episodeId={episode.id}
          episodeTitle={episode.title}
          seriesTitle={series.title}
          coinPrice={episode.coinPrice}
          coinBalance={wallet?.balance ?? 0}
          onUnlocked={() => {
            void qc.invalidateQueries({ queryKey: ["access"] });
            void qc.invalidateQueries({ queryKey: ["wallet"] });
          }}
        />
      ) : null}
    </div>
  );
}

function EpisodePicker({ slug, current, onPick }: { slug: string; current: number; onPick: (n: number) => void }) {
  const { data: episodes } = useSuspenseQuery(catalogQueries.episodes(slug));
  const { data: unlockedIds } = useSuspenseQuery(accessQueries.unlockedIds());
  return (
    <>
      {episodes.map((e) => (
        <EpisodeRow
          key={e.id}
          episode={e}
          active={e.episodeNumber === current}
          locked={!e.isFree && !unlockedIds.includes(e.id)}
          onPlay={() => onPick(e.episodeNumber)}
        />
      ))}
    </>
  );
}

export function WatchPage() {
  return (
    <Suspense fallback={<div className="flex h-[70vh] items-center justify-center"><Loader2 className="size-8 animate-spin text-primary" /></div>}>
      <WatchBody />
    </Suspense>
  );
}
