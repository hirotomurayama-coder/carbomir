"use client";

import * as React from "react";

/**
 * sticky な toolbar の自分の高さを CSS 変数 --explorer-toolbar-h として
 * documentElement に publish するための ref hook.
 *
 * table header 等を toolbar 直下に貼り付ける用途で参照される
 * ([[STICKY_TH]] で `top-[var(--explorer-toolbar-h,0px)]` として利用).
 *
 * 想定: 同じページに sticky toolbar は 1 個まで.
 *
 * @param active false なら何もしない (sticky でない toolbar 用)
 */
export function useStickyToolbarHeight(
  active: boolean
): React.RefObject<HTMLDivElement | null> {
  const ref = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const apply = () => {
      const h = el.getBoundingClientRect().height;
      root.style.setProperty("--explorer-toolbar-h", `${Math.round(h)}px`);
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => {
      ro.disconnect();
      root.style.removeProperty("--explorer-toolbar-h");
    };
  }, [active]);
  return ref;
}

/**
 * table の <th> に当てる sticky 用 className.
 * - 直上の sticky toolbar の高さに合わせて貼り付く
 * - 下のコンテンツがスクロールしてきたときに透けないよう solid bg
 *
 * 適用条件:
 * - 親の Card は `overflow-clip` であること (`overflow-hidden` は sticky
 *   の scroll port を作ってしまうので NG)
 * - <table> は `border-separate border-spacing-0` であること
 *   (border-collapse: collapse 環境では Chrome で sticky <th> が機能
 *    しない既知バグ)
 */
export const STICKY_TH =
  "sticky top-[var(--explorer-toolbar-h,0px)] z-10 bg-muted";
