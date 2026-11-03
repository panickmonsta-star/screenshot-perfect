import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Suspense, useEffect, useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Compass, SearchX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SeriesCard } from "@/components/drama/cards";
import { EmptyState, PosterGridSkeleton } from "@/components/shared/states";
import { catalogQueries, type SeriesSort } from "@/services";


export const Route = createFileRoute("/explore")({
  validateSearch: (search: Record<string, string>) => {
    const out: { q?: string; genre?: string; sort?: SeriesSort } = {};
    const qVal = search["q"];
    if (qVal) out.q = qVal;
    const genreVal = search["genre"];
    if (genreVal) out.genre = genreVal;
    const sortVal = search["sort"];
    if ((["trending", "newest", "popular", "title"] as const).includes(sortVal as SeriesSort)) {
      out.sort = sortVal as SeriesSort;
    }
    return out;
  },
  loaderDeps: ({ search }) => ({ q: search.q, genre: search.genre, sort: search.sort }),
  head: () => ({
    meta: [
      { title: "Explore dramas — Panick Monsta" },
      { name: "description", content: "Search and filter all short dramas by title, genre, popularity and release date." },
      { property: "og:title", content: "Explore dramas — Panick Monsta" },
      { property: "og:description", content: "Search and filter all short dramas by title, genre, popularity and release date." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(
      catalogQueries.list({ query: deps.q, genre: deps.genre, sort: deps.sort ?? "trending" }),
    );
  },
  component: ExplorePage,
});

const GENRES = ["all", "Romance", "Thriller", "Fantasy", "Comedy", "Mystery", "Drama", "Horror", "Action"];
const SORTS: Array<{ value: SeriesSort; label: string }> = [
  { value: "trending", label: "Trending" },
  { value: "popular", label: "Most viewed" },
  { value: "newest", label: "Newest releases" },
  { value: "title", label: "Title A–Z" },
];

function ExploreGrid({ query, genre, sort }: { query?: string; genre?: string; sort?: SeriesSort }) {
  const { data } = useSuspenseQuery(catalogQueries.list({ query, genre, sort }));
  if (data.length === 0) {
    return (
      <EmptyState
        icon={<SearchX className="size-10" />}
        title="No dramas match your search"
        description="Try a different title or clear the filters to see every series in the catalogue."
      />
    );
  }
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {data.map((s) => (
        <SeriesCard key={s.id} series={s} />
      ))}
    </div>
  );
}

function ExplorePage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const [input, setInput] = useState(search.q ?? "");

  useEffect(() => setInput(search.q ?? ""), [search.q]);

  const push = (patch: Partial<{ q: string; genre: string; sort: SeriesSort }>) => {
    navigate({ to: "/explore", search: (prev) => ({ ...prev, ...patch }) });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold">Explore dramas</h1>
      <p className="mt-1 text-sm text-muted-foreground">Every series in the demo catalogue — filter by genre or sort the grid.</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form
          className="relative flex-1"
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            push({ q: input.trim() || undefined });
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search by title or synopsis…"
            aria-label="Search dramas"
            className="h-10 bg-card pr-24"
          />
          <button type="submit" className="absolute right-1.5 top-1.5 h-7 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground">
            Search
          </button>
        </form>
        <Select value={search.genre ?? "all"} onValueChange={(v) => push({ genre: v === "all" ? undefined : v })}>
          <SelectTrigger className="w-full sm:w-40" aria-label="Filter by genre">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            {GENRES.map((g) => (
              <SelectItem key={g} value={g}>{g === "all" ? "All genres" : g}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={search.sort ?? "trending"} onValueChange={(v) => push({ sort: v as SeriesSort })}>
          <SelectTrigger className="w-full sm:w-44" aria-label="Sort results">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-8">
        <Suspense key={`${search.q ?? ""}|${search.genre ?? ""}|${search.sort ?? ""}`} fallback={<PosterGridSkeleton count={12} />}>
          <ExploreGrid query={search.q} genre={search.genre} sort={search.sort} />
        </Suspense>
      </div>

      <p className="mt-10 flex items-center gap-2 text-xs text-muted-foreground">
        <Compass className="size-3.5" /> Showing demonstration content only.
      </p>
    </div>
  );
}
