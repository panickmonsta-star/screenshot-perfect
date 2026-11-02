import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useMemo, useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Ban, CheckCircle2, Receipt, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminPageHeader, AdminTableWrap } from "@/components/admin/admin-shared";
import { adminQueries, adminService, transactionQueries } from "@/services";
import { formatDate, formatDateTime, formatCoins, formatIDR } from "@/lib/format";
import type { UserProfile } from "@/types/domain";

export const Route = createFileRoute("/admin/users")({
  head: () => ({
    meta: [
      { title: "User management — Panick Admin" },
      { name: "description", content: "Browse users, account status, balances and transactions." },
      { property: "og:title", content: "User management — Panick Admin" },
      { property: "og:description", content: "Browse users, account status, balances and transactions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(adminQueries.users()),
  component: AdminUsersPage,
});

function UserTxPreview({ user, onClose }: { user: UserProfile; onClose: () => void }) {
  const { data } = useSuspenseQuery(transactionQueries.page({ pageSize: 100 }));
  const rows = data.rows.slice(0, 8);
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transactions preview</DialogTitle>
          <DialogDescription>
            Sample history shown for {user.name} ({user.email}). In Milestone 2 this lists that user's real records.
          </DialogDescription>
        </DialogHeader>
        <ul className="divide-y divide-border/50 rounded-xl border border-border/60">
          {rows.map((t) => (
            <li key={t.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{t.title}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(t.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${t.coinAmount >= 0 ? "text-primary" : ""}`}>{t.coinAmount >= 0 ? "+" : ""}{formatCoins(t.coinAmount)}</p>
                {t.amountIdr ? <p className="text-xs text-muted-foreground">{formatIDR(t.amountIdr)}</p> : null}
              </div>
            </li>
          ))}
        </ul>
        <DialogFooter><Button variant="outline" onClick={onClose}>Close</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UsersBody() {
  const { data: users } = useSuspenseQuery(adminQueries.users());
  const qc = useQueryClient();
  const [query, setQuery] = useState("");
  const [previewUser, setPreviewUser] = useState<UserProfile | null>(null);

  const rows = useMemo(() => users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase())), [users, query]);

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserProfile["status"] }) => adminService.setUserStatus(id, status),
    onSuccess: () => {
      toast.success("Account status updated (demo)");
      void qc.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });

  return (
    <>
      <div className="mb-4 relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search users…" aria-label="Search users" className="pl-9" />
      </div>
      <AdminTableWrap>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-card/80 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Coin balance</th>
                <th className="px-4 py-3 font-medium text-right">Spent</th>
                <th className="px-4 py-3 font-medium">Registered</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 bg-card/40">
              {rows.map((u) => (
                <tr key={u.id} className="transition-colors hover:bg-accent/40">
                  <td className="px-4 py-3">
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={u.status === "active" ? "border-emerald-500/30 text-emerald-400" : "border-destructive/30 text-destructive"}>
                      {u.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{formatCoins(u.coinBalance)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{formatIDR(u.totalSpentIdr)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(u.joinedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <Button variant="ghost" size="icon" aria-label={`Transaction preview for ${u.name}`} onClick={() => setPreviewUser(u)}><Receipt className="size-4" /></Button>
                      {u.status === "active" ? (
                        <Button variant="ghost" size="icon" aria-label={`Suspend ${u.name}`} onClick={() => setStatus.mutate({ id: u.id, status: "suspended" })}><Ban className="size-4" /></Button>
                      ) : (
                        <Button variant="ghost" size="icon" aria-label={`Reactivate ${u.name}`} onClick={() => setStatus.mutate({ id: u.id, status: "active" })}><CheckCircle2 className="size-4" /></Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminTableWrap>
      <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Users className="size-3.5" /> {rows.length} demo accounts shown; real user management needs a backend.</p>
      {previewUser ? <UserTxPreview user={previewUser} onClose={() => setPreviewUser(null)} /> : null}
    </>
  );
}

function AdminUsersPage() {
  return (
    <>
      <AdminPageHeader title="User management" description="Demo accounts with balances and transaction previews." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}><UsersBody /></Suspense>
    </>
  );
}
