import { Link } from "@tanstack/react-router";
import { Coins, Loader2, Lock, Wallet } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { accessService } from "@/services";
import { formatCoins } from "@/lib/format";

export function UnlockDialog({
  open,
  onOpenChange,
  episodeId,
  episodeTitle,
  seriesTitle,
  coinPrice,
  coinBalance,
  onUnlocked,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  episodeId: string;
  episodeTitle: string;
  seriesTitle: string;
  coinPrice: number;
  coinBalance: number;
  onUnlocked: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const enough = coinBalance >= coinPrice;

  const confirm = async () => {
    setBusy(true);
    try {
      await accessService.unlockWithCoins(episodeId);
      toast.success("Episode unlocked", { description: `${seriesTitle} · ${episodeTitle}` });
      onUnlocked();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unlock failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="size-4 text-primary" /> Unlock this episode
          </DialogTitle>
          <DialogDescription>
            “{episodeTitle}” from {seriesTitle} costs {formatCoins(coinPrice)} coins. Demo coins only — no real payment is processed in this milestone.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card/60 px-4 py-3 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Wallet className="size-4 text-primary" /> Your balance
          </span>
          <span className={`font-semibold ${enough ? "text-foreground" : "text-destructive"}`}>{formatCoins(coinBalance)} coins</span>
        </div>
        {!enough ? (
          <div className="flex items-center gap-2 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            <Coins className="size-4 shrink-0" />
            <span>
              You need {formatCoins(coinPrice - coinBalance)} more coins.{" "}
              <Link to="/wallet" className="underline underline-offset-2">Top up your wallet</Link>
            </span>
          </div>
        ) : null}
        <DialogFooter className="gap-2 sm:justify-start">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={confirm} disabled={busy || !enough} className="gap-2">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Coins className="size-4" />}
            Unlock for {formatCoins(coinPrice)} coins
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
