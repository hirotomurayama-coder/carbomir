"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/components/watchlist/watchlist-provider";
import type { WatchItem } from "@/lib/watchlist";

/**
 * ウォッチ追加/解除ボタン (STRATEGY §10).
 *
 * localStorage 復元前 (mounted=false) は「ウォッチ」(未登録) 表示に固定して
 * hydration mismatch を避け、復元後に実状態へ切り替える。
 */

type Props = {
  item: WatchItem;
  className?: string;
};

export function WatchButton({ item, className }: Props) {
  const { isWatched, toggle, mounted } = useWatchlist();
  const watched = mounted && isWatched(item.kind, item.slug);

  return (
    <button
      type="button"
      onClick={() => toggle(item)}
      aria-pressed={watched}
      aria-label={watched ? "ウォッチを解除" : "ウォッチに追加"}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 h-7 text-xs font-medium transition-colors",
        watched
          ? "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20"
          : "border-border bg-muted/30 text-muted-foreground hover:border-accent/50 hover:text-accent hover:bg-accent/10",
        className
      )}
    >
      <Star
        className={cn("h-3.5 w-3.5", watched && "fill-current")}
        aria-hidden
      />
      {watched ? "ウォッチ中" : "ウォッチ"}
    </button>
  );
}
