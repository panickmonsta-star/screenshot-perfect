import { Loader2 } from "lucide-react";

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card/60 px-6 py-14 text-center">
      {icon ? <div className="mb-4 text-muted-foreground">{icon}</div> : null}
      <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title = "Something went wrong", description, onRetry }: { title?: string; description?: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-destructive/30 bg-card/60 px-6 py-14 text-center">
      <h3 className="font-display text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {description ?? "The data could not be loaded. This is a preview build with demo data."}
      </p>
      {onRetry ? (
        <button onClick={onRetry} className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function Spinner() {
  return <Loader2 className="size-5 animate-spin text-primary" aria-label="Loading" />;
}

export function PosterGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="aspect-poster animate-pulse rounded-xl bg-muted" />
          <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

export function DemoNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-primary/25 bg-primary/10 px-4 py-3 text-xs leading-relaxed text-primary-foreground/90">
      <span className="font-semibold text-primary">Preview data · </span>
      {children}
    </div>
  );
}
