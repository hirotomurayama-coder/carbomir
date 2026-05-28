"use client";

import * as React from "react";
import {
  isSameWatchItem,
  parseWatchlist,
  WATCHLIST_STORAGE_KEY,
  type WatchItem,
  type WatchKind,
} from "@/lib/watchlist";

type WatchlistContextValue = {
  items: WatchItem[];
  /** localStorage 読み込み後 true。SSR/初回描画では false (hydration 安全) */
  mounted: boolean;
  isWatched: (kind: WatchKind, slug: string) => boolean;
  toggle: (item: WatchItem) => void;
  remove: (kind: WatchKind, slug: string) => void;
};

const WatchlistContext = React.createContext<WatchlistContextValue | null>(null);

export function WatchlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<WatchItem[]>([]);
  const [mounted, setMounted] = React.useState(false);

  // 初回マウント時に localStorage から復元
  React.useEffect(() => {
    setItems(parseWatchlist(localStorage.getItem(WATCHLIST_STORAGE_KEY)));
    setMounted(true);
  }, []);

  // 変更を localStorage に永続化 (復元完了後のみ)
  React.useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(items));
  }, [items, mounted]);

  // 別タブでの変更を反映
  React.useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === WATCHLIST_STORAGE_KEY) {
        setItems(parseWatchlist(e.newValue));
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = React.useMemo<WatchlistContextValue>(
    () => ({
      items,
      mounted,
      isWatched: (kind, slug) =>
        items.some((i) => isSameWatchItem(i, { kind, slug })),
      toggle: (item) =>
        setItems((prev) =>
          prev.some((i) => isSameWatchItem(i, item))
            ? prev.filter((i) => !isSameWatchItem(i, item))
            : [...prev, item]
        ),
      remove: (kind, slug) =>
        setItems((prev) => prev.filter((i) => !isSameWatchItem(i, { kind, slug }))),
    }),
    [items, mounted]
  );

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist(): WatchlistContextValue {
  const ctx = React.useContext(WatchlistContext);
  if (!ctx) {
    throw new Error("useWatchlist must be used within WatchlistProvider");
  }
  return ctx;
}
