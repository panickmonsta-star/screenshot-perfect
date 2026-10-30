import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, Search, Wallet, LogIn, LogOut, Film, Library, Compass, Home } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { authService, walletQueries } from "@/services";
import { useMockSession } from "@/hooks/use-mock-session";
import { formatCoins } from "@/lib/format";

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`} aria-label="Panick Monsta home">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Film className="size-4.5" />
      </span>
      <span className="font-display text-base font-bold tracking-widest uppercase">
        <span className="gold-text">Panick</span> Monsta
      </span>
    </Link>
  );
}

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/library", label: "My Library", icon: Library },
];

export function SiteHeader() {
  const [query, setQuery] = useState("");
  const [signOutOpen, setSignOutOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const session = useMockSession();
  const { data: wallet } = useQuery({ ...walletQueries.balance(), enabled: true });

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    window.location.assign(`/explore${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-background p-0">
              <SheetHeader className="border-b border-border/50 px-5 py-4 text-left">
                <SheetTitle asChild>
                  <div><BrandMark /></div>
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 p-3">
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/90 hover:bg-accent hover:text-accent-foreground"
                  >
                    <item.icon className="size-4.5 text-primary" />
                    {item.label}
                  </Link>
                ))}
                <Link to="/wallet" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/90 hover:bg-accent">
                  <Wallet className="size-4.5 text-primary" /> Coin Wallet
                </Link>
                {session.user ? (
                  <>
                    <Link to="/profile" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent">
                      Profile
                    </Link>
                    <button
                      onClick={() => setSignOutOpen(true)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-accent"
                    >
                      <LogOut className="size-4.5 text-muted-foreground" /> Sign out
                    </button>
                  </>
                ) : (
                  <Link to="/login" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent">
                    <LogIn className="size-4.5 text-primary" /> Sign in
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <BrandMark />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.to ? "text-primary" : "text-foreground/80"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden w-64 items-center lg:flex" role="search">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dramas…"
              aria-label="Search dramas"
              className="h-9 rounded-full border-border/60 bg-card pl-9"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <Link to="/wallet">
            <Button variant="outline" size="sm" className="gap-2 rounded-full border-primary/40 bg-primary/10 hover:bg-primary/20">
              <Wallet className="size-4 text-primary" />
              <span className="font-semibold text-primary">{formatCoins(wallet?.balance ?? 0)}</span>
            </Button>
          </Link>
          {session.user ? (
            <Link to="/profile" className="hidden md:block">
              <Button variant="ghost" size="sm" className="rounded-full">
                {session.user.name.split(" ")[0]}
              </Button>
            </Link>
          ) : (
            <Link to="/login" className="hidden md:block">
              <Button size="sm" className="rounded-full">Sign in</Button>
            </Link>
          )}
        </div>
      </div>

      <Dialog open={signOutOpen} onOpenChange={setSignOutOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>
              Demo account only — no real session exists in this preview build, signing out just clears the mock profile.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setSignOutOpen(false)}>Cancel</Button>
            <Button
              onClick={async () => {
                await authService.signOut();
                setSignOutOpen(false);
              }}
            >
              Sign out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/50 bg-card/40">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div className="space-y-3">
          <BrandMark />
          <p className="max-w-xs text-sm text-muted-foreground">
            Short dramas made in Indonesia. Original demonstration platform — not affiliated with any existing streaming service.
          </p>
        </div>
        <nav className="grid grid-cols-2 gap-2 text-sm" aria-label="Footer">
          <Link to="/explore" className="text-muted-foreground hover:text-primary">Explore</Link>
          <Link to="/library" className="text-muted-foreground hover:text-primary">My Library</Link>
          <Link to="/wallet" className="text-muted-foreground hover:text-primary">Coin Wallet</Link>
          <Link to="/transactions" className="text-muted-foreground hover:text-primary">Transactions</Link>
          <Link to="/profile" className="text-muted-foreground hover:text-primary">Profile</Link>
          <Link to="/admin" className="text-muted-foreground hover:text-primary">Admin Dashboard</Link>
        </nav>
        <div className="text-xs leading-relaxed text-muted-foreground">
          <p>All series, analytics and transactions in this build are demonstration data.</p>
          <p className="mt-2">Coins are a demo virtual currency priced in IDR. No real payments are processed in this milestone.</p>
          <p className="mt-2">© 2026 Panick Monsta (demo).</p>
        </div>
      </div>
    </footer>
  );
}
