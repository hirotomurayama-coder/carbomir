"use client";

import * as React from "react";
import {
  Search,
  X,
  LayoutGrid,
  List,
  Rows3,
  StretchHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

/**
 * 全 explorer 共通のツールバー (検索ボックス + 表示モード + 密度 + 件数表示).
 *
 * フィルタタブは explorer ごとに異なるので、ここでは扱わず children として
 * 上 (タブ等) と 中 (検索) を分離するレイアウトを提供.
 */

export type ViewMode = "list" | "grid";
export type Density = "compact" | "comfortable";

type Props = {
  /** 検索クエリ */
  query: string;
  onQueryChange: (s: string) => void;
  /** 表示モード */
  view: ViewMode;
  onViewChange: (m: ViewMode) => void;
  /** 行密度 (list view 時のみ意味あり) */
  density?: Density;
  onDensityChange?: (d: Density) => void;
  /** 件数表示 (例: "12 / 56") */
  matchCount: number;
  totalCount: number;
  itemLabel?: string;
  /** 検索 placeholder */
  placeholder?: string;
  /** フィルタタブ等を toolbar 内左側に表示する場合 */
  leftSlot?: React.ReactNode;
  /** 右端追加 (例: 並べ替えメニュー等) */
  rightSlot?: React.ReactNode;
  /**
   * true なら toolbar をビューポートの上部 (app topbar 直下) に固定.
   * 長いリストをスクロールしても検索・フィルタが常に見える.
   * AppTopBar の高さは 52px なので top-[52px] で配置.
   */
  sticky?: boolean;
};

export function ExplorerToolbar({
  query,
  onQueryChange,
  view,
  onViewChange,
  density,
  onDensityChange,
  matchCount,
  totalCount,
  itemLabel = "items",
  placeholder = "検索...",
  leftSlot,
  rightSlot,
  sticky = false,
}: Props) {
  return (
    <div
      className={
        sticky
          ? "sticky top-[52px] z-20 space-y-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 -mx-2 px-2 py-3 border-b border-border"
          : "space-y-3"
      }
    >
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="relative min-w-[260px] flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={placeholder}
            className="h-8 pl-8 pr-8 text-sm"
            aria-label="検索"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQueryChange("")}
              aria-label="検索クリア"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 inline-flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted/60"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Filter tabs (left side, supplied by caller) */}
        {leftSlot && <div className="flex items-center gap-2 flex-wrap">{leftSlot}</div>}

        <div className="ml-auto flex items-center gap-2">
          {rightSlot}

          {/* Density toggle (only for list view) */}
          {view === "list" && onDensityChange && (
            <ToggleGroup
              type="single"
              value={density ?? "compact"}
              onValueChange={(v) => v && onDensityChange(v as Density)}
              className="h-8"
              aria-label="行密度"
            >
              <ToggleGroupItem
                value="compact"
                aria-label="密"
                className="h-8 px-2.5"
                title="密 (compact)"
              >
                <Rows3 className="h-3.5 w-3.5" />
              </ToggleGroupItem>
              <ToggleGroupItem
                value="comfortable"
                aria-label="疎"
                className="h-8 px-2.5"
                title="疎 (comfortable)"
              >
                <StretchHorizontal className="h-3.5 w-3.5" />
              </ToggleGroupItem>
            </ToggleGroup>
          )}

          {/* View mode toggle */}
          <ToggleGroup
            type="single"
            value={view}
            onValueChange={(v) => v && onViewChange(v as ViewMode)}
            className="h-8"
            aria-label="表示モード"
          >
            <ToggleGroupItem
              value="list"
              aria-label="リスト"
              className="h-8 px-2.5"
              title="リスト"
            >
              <List className="h-3.5 w-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="grid"
              aria-label="グリッド"
              className="h-8 px-2.5"
              title="グリッド"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      {/* Count line */}
      <div className="flex items-center justify-between label-mono text-muted-foreground px-1 text-[11px]">
        <span>
          <span className="metric-number text-foreground">
            {matchCount.toString().padStart(2, "0")}
          </span>
          <span className="mx-1 opacity-50">/</span>
          <span className="metric-number">
            {totalCount.toString().padStart(2, "0")}
          </span>
          <span className="ml-1">{itemLabel}</span>
          {query && (
            <span className="ml-2 opacity-70">
              (検索: <span className="text-accent">{query}</span>)
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
