import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MailCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, AuthFooterLink } from "@/components/site/auth-shell";
import { authService } from "@/services";

const schema = z.object({ email: z.string().email("Enter a valid email address.") });
type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password — Panick Monsta" },
      { name: "description", content: "Request a password reset email." },
      { property: "og:title", content: "Forgot password — Panick Monsta" },
      { property: "og:description", content: "Request a password reset email." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  const submit = form.handleSubmit(async () => {
    await authService.requestPasswordReset("demo");
    setSent(true);
  });

  if (sent) {
    return (
      <AuthShell title="Check your inbox" subtitle="If an account exists for that email, a reset link is on its way.">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <MailCheck className="size-10 text-primary" />
          <p className="text-sm text-muted-foreground">
            Demo flow only: no email is actually sent. In Milestone 2 this hands off to real Supabase auth.
          </p>
          <Button variant="outline" asChild><a href="/login">Back to sign in</a></Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter the email you signed up with and we'll send a reset link."
      footer={<AuthFooterLink text="Remembered it?" to="/login" linkText="Back to sign in" />}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" {...form.register("email")} />
          {form.formState.errors.email ? <p className="text-xs text-destructive">{form.formState.errors.email.message}</p> : null}
        </div>
        <Button type="submit" className="w-full rounded-xl" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null} Send reset link
        </Button>
      </form>
    </AuthShell>
  );
}
