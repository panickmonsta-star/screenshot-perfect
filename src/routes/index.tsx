import { createFileRoute, Link } from "@tanstack/react-router";
import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Clock3, Flame, Play, Search, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { SeriesCard } from "@/components/drama/cards";
import { PosterGridSkeleton } from "@/components/shared/states";
import { catalogQueries, libraryQueries, type SeriesFilter } from "@/services";
import { formatDuration, formatViews } from "@/lib/format";

const GENRES = ["Romance", "Thriller", "Fantasy", "Comedy", "Mystery", "Drama", "Horror", "Action"];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Panick Monsta — Short dramas, binge in minutes" },
      { name: "description", content: "Browse trending Indonesian short dramas with 1–5 minute episodes. Free episodes and coin unlocks. Preview build with demo data." },
      { property: "og:title", content: "Panick Monsta — Short dramas, binge in minutes" },
      { property: "og:description", content: "Browse trending Indonesian short dramas with 1–5 minute episodes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(catalogQueries.list({ sort: "trending" })),
      context.queryClient.ensureQueryData(catalogQueries.list({ sort: "popular" })),
      context.queryClient.ensureQueryData(catalogQueries.list({ sort: "newest" })),
      context.queryClient.ensureQueryData(libraryQueries.continueWatching()),
    ]);
  },
  component: Index,
});

function Hero() {
  const { data: seriesList } = useSuspenseQuery(catalogQueries.list({ sort: "trending" }));
  const hero = seriesList.find((s) => s.featured) ?? seriesList[0];
  if (!hero) return null;
  return (
    <section className="relative min-h-[540px] overflow-hidden border-b border-border/40">
      <img src={hero.posterUrl} alt="" className="absolute inset-0 size-full object-cover object-top opacity-60" />
      <div className="hero-fade absolute inset-0" />
      <div className="relative mx-auto flex min-h-[540px] max-w-7xl flex-col justify-end px-4 pb-12 pt-24 sm:px-6">
        <div className="max-w-2xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="gap-1 bg-primary text-primary-foreground"><Flame className="size-3" /> Featured drama</Badge>
            <Badge variant="secondary" className="gap-1"><Clock3 className="size-3" /> 1–5 min episodes</Badge>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl">{hero.title}</h1>
          <p className="max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">{hero.synopsis}</p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link to="/series/$slug" params={{ slug: hero.slug }}>
              <Button size="lg" className="gap-2 rounded-full font-semibold shadow-[var(--shadow-glow)]">
                <Play className="size-4 fill-current" /> Watch now
              </Button>
            </Link>
            <Link to="/explore">
              <Button size="lg" variant="outline" className="gap-2 rounded-full border-white/30 bg-white/5 text-white hover:bg-white/15">
                Browse all dramas <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
          <p className="text-xs text-white/50">{formatViews(hero.totalViews)} views · {hero.genre} · {hero.releaseYear}</p>
        </div>
      </div>
    </section>
  );
}

function HomeSearch() {
  return (
    <form
      className="mx-auto flex max-w-2xl gap-2 px-4 py-8"
      onSubmit={(e) => {
        e.preventDefault();
        const input = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value;
        window.location.assign(`/explore?q=${encodeURIComponent(input)}`);
      }}
      role="search"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input name="q" placeholder="Search for a drama, e.g. Jakarta Midnight…" aria-label="Search dramas" className="h-11 rounded-full bg-card pl-9" />
      </div>
      <Button type="submit" className="rounded-full px-6">Search</Button>
    </form>
  );
}

function GenreChips() {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-2 sm:px-6" aria-label="Browse by genre">
      {GENRES.map((g) => (
        <Link
          key={g}
          to="/explore"
          search={{ genre: g }}
          className="shrink-0 rounded-full border border-border/60 bg-card/70 px-4 py-1.5 text-sm text-foreground/85 transition-colors hover:border-primary/50 hover:text-primary"
        >
          {g}
        </Link>
      ))}
    </div>
  );
}

function Section({ title, icon, moreHref, children }: { title: string; icon?: React.ReactNode; moreHref?: string | undefined; children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
          {icon ? <span className="text-primary">{icon}</span> : null}
          {title}
        </h2>
        {moreHref ? (
          <Link to={moreHref} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
            See all <ArrowRight className="size-3.5" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function ContinueWatching() {
  const { data } = useSuspenseQuery(libraryQueries.continueWatching());
  if (data.length === 0) return null;
  return (
    <Section title="Continue watching">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.map((p) => (
          <Link
            key={p.seriesId}
            to="/watch/$slug/$episode"
            params={{ slug: p.seriesSlug, episode: p.episodeNumber }}
            className="group flex gap-3 rounded-xl border border-border/50 bg-card/70 p-2.5 transition-colors hover:border-primary/40"
          >
            <div className="relative aspect-poster w-16 shrink-0 overflow-hidden rounded-lg">
              <img src={p.posterUrl} alt="" className="size-full object-cover" loading="lazy" />
              <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Play className="size-5 fill-current text-white" />
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{p.seriesTitle}</p>
                <p className="truncate text-xs text-muted-foreground">EP{p.episodeNumber} · {p.episodeTitle}</p>
              </div>
              <div className="mt-1.5">
                <div className="h-1 rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((p.positionSeconds / p.durationSeconds) * 100)}%` }} />
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {formatDuration(p.positionSeconds)} / {formatDuration(p.durationSeconds)}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </Section>
  );
}

function SeriesRow({ filter, icon, moreHref }: { filter: SeriesFilter; icon?: React.ReactNode; moreHref?: string | undefined }) {
  const { data } = useSuspenseQuery(catalogQueries.list(filter));
  return (
    <Section title={filter.sort === "trending" ? "Trending now" : filter.sort === "popular" ? "Popular dramas" : filter.sort === "newest" ? "Recently added" : "Recommended for you"} icon={icon} moreHref={moreHref}>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {data.slice(0, 6).map((s) => (
          <SeriesCard key={s.id} series={s} />
        ))}
      </div>
    </Section>
  );
}

function Index() {
  return (
    <>
      <Hero />
      <HomeSearch />
      <GenreChips />
      <Suspense fallback={<Section title="Continue watching"><PosterGridSkeleton count={4} /></Section>}>
        <ContinueWatching />
      </Suspense>
      <Suspense fallback={<Section title="Trending now"><PosterGridSkeleton count={6} /></Section>}>
        <SeriesRow filter={{ sort: "trending" }} icon={<Flame className="size-5" />} moreHref="/explore" />
      </Suspense>
      <Suspense fallback={<Section title="Popular dramas"><PosterGridSkeleton count={6} /></Section>}>
        <SeriesRow filter={{ sort: "popular" }} icon={<Star className="size-5" />} moreHref="/explore" />
      </Suspense>
      <Suspense fallback={<Section title="Recently added"><PosterGridSkeleton count={6} /></Section>}>
        <SeriesRow filter={{ sort: "newest" }} icon={<Sparkles className="size-5" />} moreHref="/explore" />
      </Suspense>
      <Suspense fallback={<Section title="Recommended for you"><PosterGridSkeleton count={6} /></Section>}>
        <SeriesRow filter={{ sort: "title" }} icon={<Sparkles className="size-5" />} />
      </Suspense>
      <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
        <div className="rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/15 to-transparent p-6">
          <p className="font-display text-lg font-semibold">New episodes every night</p>
          <p className="mt-1 text-sm text-muted-foreground">All content in this preview build is demonstration data for Milestone 1.</p>
        </div>
      </div>
    </>
  );
}
