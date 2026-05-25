"use client";

import * as React from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import type { SortDir } from "./use-table-controls";

type SortableHeaderProps = {
  /** ソート対象列キー */
  sortKey: string;
  /** 現在のソート状態 (use-table-controls から) */
  current: { key: string; dir: SortDir } | null;
  /** クリックハンドラ */
  onToggle: (key: string) => void;
  /** 表示ラベル */
  children: React.ReactNode;
  /** th 追加クラス */
  className?: string;
  /** th の min-width 指定. compact 表示で列幅崩れを防ぐ. */
  minWidth?: string;
};

export function SortableHeader({
  sortKey,
  current,
  onToggle,
  children,
  className = "",
  minWidth,
}: SortableHeaderProps) {
  const isActive = current?.key === sortKey;
  const dir = isActive ? current?.dir : undefined;

  return (
    <th
      className={`text-left label-mono text-muted-foreground font-normal px-3 py-2 ${className}`}
      style={minWidth ? { minWidth } : undefined}
    >
      <button
        type="button"
        onClick={() => onToggle(sortKey)}
        className="inline-flex items-center gap-1 cursor-pointer hover:text-foreground transition-colors group"
        aria-sort={isActive ? (dir === "asc" ? "ascending" : "descending") : "none"}
      >
        {children}
        {isActive ? (
          dir === "asc" ? (
            <ChevronUp className="h-3 w-3 text-accent" />
          ) : (
            <ChevronDown className="h-3 w-3 text-accent" />
          )
        ) : (
          <ChevronsUpDown className="h-3 w-3 opacity-40 group-hover:opacity-80" />
        )}
      </button>
    </th>
  );
}

/** クリック不可の通常 th (ソート列でない場合) */
export function StaticHeader({
  children,
  className = "",
  minWidth,
}: {
  children: React.ReactNode;
  className?: string;
  minWidth?: string;
}) {
  return (
    <th
      className={`text-left label-mono text-muted-foreground font-normal px-3 py-2 ${className}`}
      style={minWidth ? { minWidth } : undefined}
    >
      {children}
    </th>
  );
}
