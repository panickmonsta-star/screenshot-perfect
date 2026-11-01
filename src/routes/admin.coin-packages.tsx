import { createFileRoute } from "@tanstack/react-router";
import { Suspense, useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Eye, Loader2, Package, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Coins, Sparkles } from "lucide-react";
import { AdminPageHeader, AdminTableWrap } from "@/components/admin/admin-shared";
import { adminQueries, adminService } from "@/services";
import { formatCoins, formatIDR } from "@/lib/format";
import type { CoinPackage } from "@/types/domain";

export const Route = createFileRoute("/admin/coin-packages")({
  head: () => ({
    meta: [
      { title: "Coin packages — Panick Admin" },
      { name: "description", content: "Manage coin packages: amounts, IDR prices and active status." },
      { property: "og:title", content: "Coin packages — Panick Admin" },
      { property: "og:description", content: "Manage coin packages: amounts, IDR prices and active status." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(adminQueries.packages()),
  component: AdminPackagesPage,
});

type PackageForm = { id: string | null; name: string; coinAmount: number; bonusCoins: number; priceIdr: number; popular: boolean; active: boolean };

function PackageDialog({ form, onClose }: { form: PackageForm; onClose: () => void }) {
  const qc = useQueryClient();
  const [values, setValues] = useState<PackageForm>(form);
  const [error, setError] = useState<string | null>(null);

  const save = useMutation({
    mutationFn: async () => {
      if (!values.name.trim()) throw new Error("Package name is required.");
      const input = { ...values, name: values.name.trim() };
      if (values.id) return adminService.updatePackage(values.id, input);
      return adminService.createPackage(input);
    },
    onSuccess: () => {
      toast.success(values.id ? "Package updated" : "Package created", { description: "Demo write — in memory only." });
      void qc.invalidateQueries({ queryKey: ["admin", "packages"] });
      onClose();
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Save failed."),
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{values.id ? "Edit package" : "New package"}</DialogTitle>
          <DialogDescription>Set the coin amount and IDR price shown to viewers.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="p-name">Name</Label>
            <Input id="p-name" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-coins">Coins</Label>
              <Input id="p-coins" type="number" min={1} value={values.coinAmount} onChange={(e) => setValues({ ...values, coinAmount: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-bonus">Bonus</Label>
              <Input id="p-bonus" type="number" min={0} value={values.bonusCoins} onChange={(e) => setValues({ ...values, bonusCoins: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-price">IDR price</Label>
              <Input id="p-price" type="number" min={0} value={values.priceIdr} onChange={(e) => setValues({ ...values, priceIdr: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm"><Switch checked={values.popular} onCheckedChange={(c) => setValues({ ...values, popular: c })} /> Mark popular</label>
            <label className="flex items-center gap-2 text-sm"><Switch checked={values.active} onCheckedChange={(c) => setValues({ ...values, active: c })} /> Active</label>
          </div>
          {error ? <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p> : null}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? <Loader2 className="size-4 animate-spin" /> : null} Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function UserPreview({ onBack }: { onBack: () => void }) {
  const { data: packages } = useSuspenseQuery(adminQueries.packages());
  const active = packages.filter((p) => p.active);
  return (
    <div className="rounded-2xl border border-primary/25 bg-primary/5 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-sm font-semibold"><Eye className="size-4 text-primary" /> How viewers will see these</h2>
        <Button variant="ghost" size="sm" onClick={onBack}>Back to table</Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {active.map((pkg) => (
          <div key={pkg.id} className={`relative flex flex-col rounded-2xl border p-5 ${pkg.popular ? "border-primary/60 bg-primary/10" : "border-border/60 bg-card"}`}>
            {pkg.popular ? <Badge className="absolute -top-2.5 left-4 bg-primary text-primary-foreground">Most popular</Badge> : null}
            <p className="font-display font-semibold">{pkg.name}</p>
            <p className="mt-2 flex items-baseline gap-1.5"><Coins className="size-4 text-primary" /><span className="font-display text-2xl font-bold">{formatCoins(pkg.coinAmount)}</span><span className="text-sm text-muted-foreground">coins</span></p>
            {pkg.bonusCoins > 0 ? <p className="mt-1 flex items-center gap-1 text-xs text-primary"><Sparkles className="size-3" /> +{formatCoins(pkg.bonusCoins)} bonus</p> : <p className="mt-1 text-xs text-transparent">.</p>}
            <p className="mt-3 font-semibold">{formatIDR(pkg.priceIdr)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PackagesBody() {
  const { data: packages } = useSuspenseQuery(adminQueries.packages());
  const qc = useQueryClient();
  const [editing, setEditing] = useState<PackageForm | null>(null);
  const [preview, setPreview] = useState(false);

  const del = useMutation({
    mutationFn: (id: string) => adminService.deletePackage(id),
    onSuccess: () => {
      toast.success("Package deleted (demo)");
      void qc.invalidateQueries({ queryKey: ["admin", "packages"] });
    },
  });

  return (
    <>
      <div className="mb-4 flex justify-end gap-2">
        <Button variant="outline" className="gap-2" onClick={() => setPreview(!preview)}><Eye className="size-4" /> {preview ? "Hide viewer preview" : "Preview for viewers"}</Button>
        <Button className="gap-2" onClick={() => setEditing({ id: null, name: "", coinAmount: 100, bonusCoins: 0, priceIdr: 49000, popular: false, active: true })}><Plus className="size-4" /> New package</Button>
      </div>
      {preview ? <UserPreview onBack={() => setPreview(false)} /> : null}
      <div className="mt-4">
        <AdminTableWrap>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="bg-card/80 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Package</th>
                  <th className="px-4 py-3 font-medium text-right">Coins</th>
                  <th className="px-4 py-3 font-medium text-right">Bonus</th>
                  <th className="px-4 py-3 font-medium text-right">Price (IDR)</th>
                  <th className="px-4 py-3 font-medium">Flags</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 bg-card/40">
                {packages.map((p) => (
                  <tr key={p.id} className="transition-colors hover:bg-accent/40">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-right"><Package className="mr-1 inline size-3.5 text-primary" />{formatCoins(p.coinAmount)}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{p.bonusCoins > 0 ? `+${formatCoins(p.bonusCoins)}` : "—"}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatIDR(p.priceIdr)}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {p.popular ? <Badge className="bg-primary text-primary-foreground">Popular</Badge> : null}
                        <Badge variant={p.active ? "secondary" : "outline"} className={p.active ? "" : "text-muted-foreground"}>{p.active ? "Active" : "Inactive"}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Button variant="ghost" size="icon" aria-label={`Edit ${p.name}`} onClick={() => setEditing({ id: p.id, name: p.name, coinAmount: p.coinAmount, bonusCoins: p.bonusCoins, priceIdr: p.priceIdr, popular: p.popular, active: p.active })}><Pencil className="size-4" /></Button>
                        <Button variant="ghost" size="icon" aria-label={`Delete ${p.name}`} onClick={() => del.mutate(p.id)}><Trash2 className="size-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminTableWrap>
      </div>
      {editing ? <PackageDialog form={editing} onClose={() => setEditing(null)} /> : null}
    </>
  );
}

function AdminPackagesPage() {
  return (
    <>
      <AdminPageHeader title="Coin package management" description="Create and edit coin packages priced in IDR." />
      <Suspense fallback={<div className="h-96 animate-pulse rounded-2xl bg-muted" />}><PackagesBody /></Suspense>
    </>
  );
}
