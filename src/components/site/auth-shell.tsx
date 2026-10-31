import { Link } from "@tanstack/react-router";
import { DemoNotice } from "@/components/shared/states";
import { BrandMark } from "@/components/site/site-chrome";

export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer?: React.ReactNode }) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md space-y-5">
        <div className="text-center">
          <div className="flex justify-center"><BrandMark /></div>
          <h1 className="mt-4 font-display text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-card/70 p-6 shadow-[var(--shadow-cinema)]">{children}</div>
        {footer ? <p className="text-center text-sm text-muted-foreground">{footer}</p> : null}
        <DemoNotice>
          Mock authentication for Milestone 1: no credentials are sent anywhere, no real account is created, and any email/password combination with a 6+ character password will sign in.
        </DemoNotice>
      </div>
    </div>
  );
}

export function AuthFooterLink({ text, to, linkText }: { text: string; to: "/login" | "/signup" | "/forgot-password" | "/reset-password"; linkText: string }) {
  return (
    <span>
      {text}{" "}
      <Link to={to} className="font-medium text-primary hover:underline">{linkText}</Link>
    </span>
  );
}
