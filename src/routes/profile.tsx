import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Coins, LogOut, ShieldCheck, UserRound, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DemoNotice, EmptyState } from "@/components/shared/states";
import { useMockSession } from "@/hooks/use-mock-session";
import { authService } from "@/services";
import { formatDate, formatNumber } from "@/lib/format";

const profileSchema = z.object({
  name: z.string().min(2, "Name is too short."),
  email: z.string().email("Enter a valid email address."),
});
type ProfileValues = z.infer<typeof profileSchema>;

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Panick Monsta" },
      { name: "description", content: "Manage your demo profile and sign out." },
      { property: "og:title", content: "Your profile — Panick Monsta" },
      { property: "og:description", content: "Manage your demo profile and sign out." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const session = useMockSession();
  const qc = useQueryClient();
  const [signOutOpen, setSignOutOpen] = useState(false);
  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: { name: session.user?.name ?? "", email: session.user?.email ?? "" },
  });

  if (!session.user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <EmptyState
          icon={<UserRound className="size-10" />}
          title="You're not signed in"
          description="This preview uses a mock profile. Sign in with any email and a 6+ character password to try it."
          action={<Link to="/login"><Button>Sign in</Button></Link>}
        />
      </div>
    );
  }

  const user = session.user;

  const submit = form.handleSubmit(async (values) => {
    await authService.updateProfile(values);
    toast.success("Profile updated", { description: "Demo profile saved locally." });
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-bold">Your profile</h1>
      <p className="mt-1 text-sm text-muted-foreground">Demo viewer profile — stored only in this browser.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card/70 p-4 text-center">
          <Coins className="mx-auto size-5 text-primary" />
          <p className="mt-2 font-display text-2xl font-bold">{formatNumber(user.coinBalance)}</p>
          <p className="text-xs text-muted-foreground">Coins</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/70 p-4 text-center">
          <Video className="mx-auto size-5 text-primary" />
          <p className="mt-2 font-display text-2xl font-bold">{formatNumber(user.totalUnlocks)}</p>
          <p className="text-xs text-muted-foreground">Episodes unlocked</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/70 p-4 text-center">
          <ShieldCheck className="mx-auto size-5 text-primary" />
          <p className="mt-2 text-sm font-semibold text-foreground">{formatDate(user.joinedAt)}</p>
          <p className="text-xs text-muted-foreground">Member since</p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-border/60 bg-card/70 p-6">
        <h2 className="font-display text-lg font-semibold">Account details</h2>
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input id="name" {...form.register("name")} />
          {form.formState.errors.name ? <p className="text-xs text-destructive">{form.formState.errors.name.message}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register("email")} />
          {form.formState.errors.email ? <p className="text-xs text-destructive">{form.formState.errors.email.message}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={form.formState.isSubmitting}>Save changes</Button>
          <Button type="button" variant="outline" className="gap-2" onClick={() => setSignOutOpen(true)}>
            <LogOut className="size-4" /> Sign out
          </Button>
        </div>
      </form>

      <div className="mt-6 space-y-3">
        <DemoNotice>Real authentication, password changes and account deletion arrive with your own backend in Milestone 2.</DemoNotice>
        <div className="flex gap-3 text-sm">
          <Link to="/wallet" className="text-primary hover:underline">Coin wallet →</Link>
          <Link to="/transactions" className="text-primary hover:underline">Transaction history →</Link>
          <Link to="/library" className="text-primary hover:underline">My library →</Link>
        </div>
      </div>

      <Dialog open={signOutOpen} onOpenChange={setSignOutOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>Demo session only — this clears the mock profile from this browser.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSignOutOpen(false)}>Cancel</Button>
            <Button onClick={async () => { await authService.signOut(); setSignOutOpen(false); }}>Sign out</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
