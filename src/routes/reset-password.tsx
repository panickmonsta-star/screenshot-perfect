import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { KeyRound, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, AuthFooterLink } from "@/components/site/auth-shell";
import { authService } from "@/services";

const schema = z.object({
  token: z.string().min(4, "Paste the reset code from your (demo) email."),
  password: z.string().min(6, "Use at least 6 characters."),
  confirm: z.string(),
}).refine((v) => v.confirm === v.password, { path: ["confirm"], message: "Passwords do not match." });
type FormValues = z.infer<typeof schema>;

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Panick Monsta" },
      { name: "description", content: "Set a new password using your reset code." },
      { property: "og:title", content: "Reset password — Panick Monsta" },
      { property: "og:description", content: "Set a new password using your reset code." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { token: "", password: "", confirm: "" } });

  const submit = form.handleSubmit(async (values) => {
    setFormError(null);
    const res = await authService.resetPassword(values.token, values.password);
    if (res.ok) {
      toast.success("Password updated", { description: "Demo reset — sign in with your new password." });
      await navigate({ to: "/login" });
    }
  });

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Paste the reset code and choose a new password."
      footer={<AuthFooterLink text="No code yet?" to="/forgot-password" linkText="Request a reset" />}
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="token">Reset code</Label>
          <Input id="token" placeholder="PM-RESET-XXXX" {...form.register("token")} />
          {form.formState.errors.token ? <p className="text-xs text-destructive">{form.formState.errors.token.message}</p> : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="password">New password</Label>
            <Input id="password" type="password" placeholder="••••••••" {...form.register("password")} />
            {form.formState.errors.password ? <p className="text-xs text-destructive">{form.formState.errors.password.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm</Label>
            <Input id="confirm" type="password" placeholder="••••••••" {...form.register("confirm")} />
            {form.formState.errors.confirm ? <p className="text-xs text-destructive">{form.formState.errors.confirm.message}</p> : null}
          </div>
        </div>
        {formError ? <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive">{formError}</p> : null}
        <Button type="submit" className="w-full gap-2 rounded-xl" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />} Update password
        </Button>
      </form>
    </AuthShell>
  );
}
