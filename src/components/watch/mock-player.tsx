import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Loader2, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDuration } from "@/lib/format";
import { libraryService } from "@/services";

/**
 * Demo player for Milestone 1. No video provider is connected yet, so this
 * renders a simulated stream over the episode poster: it plays, pauses,
 * tracks progress and offers explicit loading/failure states, and is clearly
 * labelled as a demo.
 */
export function MockPlayer({
  posterUrl,
  episodeId,
  seriesId,
  durationSeconds,
  title,
  onEnded,
}: {
  posterUrl: string;
  episodeId: string;
  seriesId: string;
  durationSeconds: number;
  title: string;
  onEnded?: () => void;
}) {
  const [phase, setPhase] = useState<"loading" | "ready" | "error">("loading");
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [position, setPosition] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setPhase("loading");
    setPlaying(false);
    const t = setTimeout(() => setPhase("ready"), 900);
    return () => clearTimeout(t);
  }, [episodeId]);

  useEffect(() => {
    if (timer.current) clearInterval(timer.current);
    if (playing && phase === "ready") {
      timer.current = setInterval(() => {
        setPosition((p) => {
          if (p + 1 >= durationSeconds) {
            setPlaying(false);
            onEnded?.();
            return durationSeconds;
          }
          return p + 1;
        });
      }, 250);
    }
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, phase, durationSeconds, onEnded]);

  useEffect(() => {
    if (position > 0 && position % 16 === 0) {
      void libraryService.saveProgress({ seriesId, episodeId, positionSeconds: position });
    }
  }, [position, seriesId, episodeId]);

  const togglePlay = () => {
    if (phase !== "ready") return;
    setPlaying((p) => !p);
  };

  return (
    <div className="mx-auto w-full max-w-[430px]">
      <div
        className="relative aspect-[9/16] w-full overflow-hidden rounded-2xl border border-border/60 bg-black shadow-[var(--shadow-cinema)]"
        role="region"
        aria-label={`Video player for ${title}`}
      >
        <img src={posterUrl} alt="" className={`size-full object-cover transition-opacity ${phase === "ready" && playing ? "opacity-60" : "opacity-35"}`} />
        {phase === "loading" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-xs text-white/70">Buffering episode…</p>
          </div>
        ) : null}
        {phase === "error" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 px-6 text-center">
            <AlertTriangle className="size-8 text-destructive" />
            <p className="text-sm font-medium text-white">Stream failed to load</p>
            <p className="text-xs text-white/60">The video provider returned an error. (Demo failure state.)</p>
            <Button size="sm" variant="outline" className="gap-2 border-white/30 bg-white/10 text-white hover:bg-white/20" onClick={() => setPhase("ready")}>
              <RotateCcw className="size-4" /> Retry playback
            </Button>
          </div>
        ) : null}
        {phase === "ready" && !playing ? (
          <button
            onClick={togglePlay}
            aria-label="Play episode"
            className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors hover:bg-black/40"
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
              <Play className="size-7 fill-current" />
            </span>
          </button>
        ) : null}

        <Badge variant="secondary" className="absolute left-3 top-3 bg-black/60 text-[10px] text-white/80">
          Demo player · no real stream
        </Badge>

        <div className="absolute inset-x-0 bottom-0 space-y-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 pb-3 pt-8">
          <div
            role="slider"
            aria-label="Playback position"
            aria-valuemin={0}
            aria-valuemax={durationSeconds}
            aria-valuenow={position}
            tabIndex={0}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const ratio = (e.clientX - rect.left) / rect.width;
              setPosition(Math.round(ratio * durationSeconds));
            }}
            className="h-1.5 w-full cursor-pointer rounded-full bg-white/20"
          >
            <div className="h-full rounded-full bg-primary transition-[width] duration-250" style={{ width: `${(position / durationSeconds) * 100}%` }} />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Button size="icon" variant="ghost" className="size-8 text-white hover:bg-white/15" onClick={togglePlay} aria-label={playing ? "Pause" : "Play"}>
                {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              </Button>
              <Button size="icon" variant="ghost" className="size-8 text-white hover:bg-white/15" onClick={() => setMuted((m) => !m)} aria-label={muted ? "Unmute" : "Mute"}>
                {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              </Button>
              <span className="ml-1 font-mono text-[11px] text-white/80">
                {formatDuration(position)} / {formatDuration(durationSeconds)}
              </span>
            </div>
            <button
              onClick={() => setPhase("error")}
              className="text-[10px] uppercase tracking-wide text-white/50 hover:text-white"
            >
              Simulate failure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
