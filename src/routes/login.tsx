import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, AuthFooterLink } from "@/components/site/auth-shell";
import { authService } from "@/services";
import { useQueryClient } from "@tanstack/react-query";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});
type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Panick Monsta" },
      { name: "description", content: "Sign in to continue watching your short dramas." },
      { property: "og:title", content: "Sign in — Panick Monsta" },
      { property: "og:description", content: "Sign in to continue watching your short dramas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  const submit = form.handleSubmit(async (values) => {
    setFormError(null);
    try {
      const user = await authService.signIn(values);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}`, { description: "Demo session — no real account was used." });
      void qc.invalidateQueries({ queryKey: ["wallet"] });
      await navigate({ to: "/" });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Sign in failed.");
    }
  });

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to keep watching where you left off."
      footer={<AuthFooterLink text="New to Panick Monsta?" to="/signup" linkText="Create an account" />}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="you@example.com" {...form.register("email")} />
          {form.formState.errors.email ? <p className="text-xs text-destructive">{form.formState.errors.email.message}</p> : null}
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <a href="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</a>
          </div>
          <Input id="password" type="password" autoComplete="current-password" placeholder="••••••••" {...form.register("password")} />
          {form.formState.errors.password ? <p className="text-xs text-destructive">{form.formState.errors.password.message}</p> : null}
        </div>
        {formError ? <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">{formError}</p> : null}
        <Button type="submit" className="w-full gap-2 rounded-xl" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />} Sign in
        </Button>
      </form>
    </AuthShell>
  );
}
