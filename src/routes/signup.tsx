import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, AuthFooterLink } from "@/components/site/auth-shell";
import { authService } from "@/services";

const schema = z.object({
  name: z.string().min(2, "Tell us your name (at least 2 characters)."),
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Use at least 6 characters."),
  confirm: z.string(),
}).refine((v) => v.confirm === v.password, { path: ["confirm"], message: "Passwords do not match." });
type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create account — Panick Monsta" },
      { name: "description", content: "Create a free account and start watching Indonesian short dramas." },
      { property: "og:title", content: "Create account — Panick Monsta" },
      { property: "og:description", content: "Create a free account and start watching Indonesian short dramas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirm: "" },
  });

  const submit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      const user = await authService.signUp(values);
      toast.success(`Welcome, ${user.name.split(" ")[0]}!`, { description: "Demo account created — 30 starter coins added." });
      void qc.invalidateQueries({ queryKey: ["wallet"] });
      await navigate({ to: "/" });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Sign up failed.");
    }
  });

  return (
    <AuthShell
      title="Create your account"
      subtitle="Free to join. Coins are only needed for premium episodes."
      footer={<AuthFooterLink text="Already have an account?" to="/login" linkText="Sign in" />}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" autoComplete="name" placeholder="Dewi Larasati" {...form.register("name")} />
          {form.formState.errors.name ? <p className="text-xs text-destructive">{form.formState.errors.name.message}</p> : null}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...form.register("email")} />
          {form.formState.errors.email ? <p className="text-xs text-destructive">{form.formState.errors.email.message}</p> : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" autoComplete="new-password" placeholder="••••••••" {...form.register("password")} />
            {form.formState.errors.password ? <p className="text-xs text-destructive">{form.formState.errors.password.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm</Label>
            <Input id="confirm" type="password" autoComplete="new-password" placeholder="••••••••" {...form.register("confirm")} />
            {form.formState.errors.confirm ? <p className="text-xs text-destructive">{form.formState.errors.confirm.message}</p> : null}
          </div>
        </div>
        {formError ? <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">{formError}</p> : null}
        <Button type="submit" className="w-full gap-2 rounded-xl" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />} Create account
        </Button>
      </form>
    </AuthShell>
  );
}
