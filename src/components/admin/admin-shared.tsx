import { Badge } from "@/components/ui/badge";
import type { PublicationStatus, TransactionStatus } from "@/types/domain";
import { cn } from "@/lib/utils";

export function AdminPageHeader({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-2xl font-bold">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/70 p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
        {icon ? <span className="text-primary">{icon}</span> : null}
      </div>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
      {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
    </div>
  );
}

const statusStyles: Record<PublicationStatus, string> = {
  published: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  draft: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  archived: "bg-muted text-muted-foreground border-border",
};

export function PublicationBadge({ status }: { status: PublicationStatus }) {
  return <Badge variant="outline" className={cn("capitalize", statusStyles[status])}>{status}</Badge>;
}

const txStyles: Record<TransactionStatus, string> = {
  completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
};

export function TxStatusBadge({ status }: { status: TransactionStatus }) {
  return <Badge variant="outline" className={cn("capitalize", txStyles[status])}>{status}</Badge>;
}

export function AdminTableWrap({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden rounded-2xl border border-border/60">{children}</div>;
}
