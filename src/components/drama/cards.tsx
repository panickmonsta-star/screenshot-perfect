import { Link } from "@tanstack/react-router";
import { Eye, Lock, Play, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatViews } from "@/lib/format";
import type { Episode, Series } from "@/types/domain";

export function SeriesCard({ series, unlockedCount, totalEpisodes }: { series: Series; unlockedCount?: number; totalEpisodes?: number }) {
  return (
    <Link to="/series/$slug" params={{ slug: series.slug }} className="group block">
      <div className="poster-hover relative aspect-poster overflow-hidden rounded-xl border border-border/50 bg-card">
        <img src={series.posterUrl} alt={`${series.title} poster`} loading="lazy" className="size-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 to-transparent" />
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          {series.trending ? (
            <Badge className="gap-1 bg-primary text-primary-foreground">
              <Flame className="size-3" /> Trending
            </Badge>
          ) : null}
          {series.featured ? <Badge variant="secondary" className="text-xs">Featured</Badge> : null}
        </div>
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-end justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-semibold text-white">{series.title}</p>
            <p className="flex items-center gap-1 text-[11px] text-white/70">
              <Eye className="size-3" /> {formatViews(series.totalViews)} · {series.genre}
            </p>
          </div>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100">
            <Play className="size-4 fill-current" />
          </span>
        </div>
        {typeof unlockedCount === "number" && typeof totalEpisodes === "number" ? (
          <Badge variant="secondary" className="absolute right-2 top-2 text-[10px]">
            {unlockedCount}/{totalEpisodes} unlocked
          </Badge>
        ) : null}
      </div>
    </Link>
  );
}

export function EpisodeRow({
  episode,
  locked,
  active,
  onPlay,
}: {
  episode: Episode;
  locked: boolean;
  active?: boolean;
  onPlay?: () => void;
}) {
  return (
    <button
      onClick={onPlay}
      className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition-colors ${
        active ? "border-primary/60 bg-primary/10" : "border-border/50 bg-card/60 hover:bg-accent/60"
      }`}
    >
      <div className="relative aspect-poster w-14 shrink-0 overflow-hidden rounded-md">
        <img src={episode.thumbnailUrl} alt="" className="size-full object-cover" loading="lazy" />
        {locked ? (
          <span className="absolute inset-0 flex items-center justify-center bg-black/60">
            <Lock className="size-3.5 text-primary" />
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          <span className="text-muted-foreground">EP{episode.episodeNumber}</span> · {episode.title}
        </p>
        <p className="text-xs text-muted-foreground">
          {episode.isFree ? "Free" : `${episode.coinPrice} coins to unlock`}
        </p>
      </div>
      {episode.downloadEnabled ? <span className="shrink-0 text-[10px] uppercase tracking-wide text-muted-foreground">Downloadable</span> : null}
      {locked ? <Badge variant="secondary" className="shrink-0 gap-1"><Lock className="size-3" />{episode.coinPrice}</Badge> : null}
    </button>
  );
}
