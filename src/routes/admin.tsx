import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { BarChart3, Clapperboard, Film, ListOrdered, Package, Receipt, Settings, ShieldAlert, Users, ArrowLeft, Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Overview", icon: BarChart3, exact: true },
  { to: "/admin/series", label: "Series", icon: Clapperboard },
  { to: "/admin/episodes", label: "Episodes", icon: ListOrdered },
  { to: "/admin/coin-packages", label: "Coin packages", icon: Package },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/transactions", label: "Transactions", icon: Receipt },
  { to: "/admin/downloads", label: "Downloads & watermark", icon: Film },
  { to: "/admin/settings", label: "Platform settings", icon: Settings },
];

function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="flex flex-col gap-1" aria-label="Admin">
      {NAV.map((item) => {
        const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active ? "bg-primary/15 text-primary" : "text-foreground/80 hover:bg-accent/60 hover:text-foreground",
            )}
          >
            <item.icon className="size-4.5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/50 bg-card/40 p-4 lg:flex">
        <Link to="/admin" className="mb-6 flex items-center gap-2 px-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><ShieldAlert className="size-4" /></span>
          <span className="font-display text-sm font-bold tracking-widest uppercase">Panick Admin</span>
        </Link>
        <AdminNav />
        <div className="mt-auto space-y-2">
          <Badge variant="outline" className="w-full justify-center border-primary/40 text-[10px] text-primary">Preview data · demo build</Badge>
          <Link to="/" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="size-4" /> Back to site
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/50 bg-background/90 px-4 backdrop-blur-md lg:px-8">
          <div className="lg:hidden">
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Open admin menu"><Menu className="size-5" /></Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-background p-4">
                <SheetHeader className="mb-3 p-0 text-left">
                  <SheetTitle>Panick Admin</SheetTitle>
                </SheetHeader>
                <AdminNav onNavigate={() => setOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
          <p className="text-sm font-medium text-muted-foreground">Milestone 1 admin · all data is demonstration preview data</p>
          <Link to="/" className="ml-auto text-sm text-primary hover:underline">View site</Link>
        </header>
        <div className="min-w-0 flex-1 p-4 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
