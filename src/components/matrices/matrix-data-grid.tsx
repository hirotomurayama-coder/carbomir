"use client";

import * as React from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ComparisonCell, ComparisonMatrix } from "@/lib/types";
import { ReviewMarkedText } from "@/components/review-marks";

type Props = {
  matrix: ComparisonMatrix;
  publishedEntitySlugs: string[];
};

export function MatrixDataGrid({ matrix, publishedEntitySlugs }: Props) {
  const [filter, setFilter] = React.useState("");
  const [hiddenDims, setHiddenDims] = React.useState<Set<string>>(new Set());
  const publishedSet = React.useMemo(
    () => new Set(publishedEntitySlugs),
    [publishedEntitySlugs]
  );

  const visibleDimensions = React.useMemo(() => {
    const q = filter.trim().toLowerCase();
    return matrix.dimensions.filter((d) => {
      if (hiddenDims.has(d.key)) return false;
      if (!q) return true;
      return (
        d.label_ja.toLowerCase().includes(q) ||
        (d.description?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [matrix.dimensions, filter, hiddenDims]);

  const toggleDim = (key: string) => {
    setHiddenDims((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const clearHidden = () => setHiddenDims(new Set());

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative min-w-[240px] flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="比較軸を絞り込み..."
            className="h-8 pl-8 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="label-mono text-muted-foreground hidden sm:inline">
            {visibleDimensions.length.toString().padStart(2, "0")}/
            {matrix.dimensions.length.toString().padStart(2, "0")} dims
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                軸の表示
                {hiddenDims.size > 0 && (
                  <span className="ml-1 rounded bg-accent/20 px-1 metric-number text-[10px] text-accent">
                    {matrix.dimensions.length - hiddenDims.size}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[280px]">
              <DropdownMenuLabel className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                Toggle Dimensions
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {matrix.dimensions.map((d) => {
                const visible = !hiddenDims.has(d.key);
                return (
                  <DropdownMenuItem
                    key={d.key}
                    onSelect={(e) => {
                      e.preventDefault();
                      toggleDim(d.key);
                    }}
                    className="flex items-start gap-2 py-2 cursor-pointer"
                  >
                    <span className="h-4 w-4 mt-0.5 flex items-center justify-center rounded border border-border bg-background shrink-0">
                      {visible && <Check className="h-3 w-3 text-accent" />}
                    </span>
                    <span className="flex-1 text-sm">{d.label_ja}</span>
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  clearHidden();
                }}
                disabled={hiddenDims.size === 0}
                className="text-xs"
              >
                全て表示
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Data table */}
      <div className="relative overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-muted/60 border-b border-r border-border px-4 py-3 text-left min-w-[200px]">
                <span className="label-mono text-muted-foreground">Dimension</span>
              </th>
              {matrix.entities.map((e) => {
                const entityExists = publishedSet.has(e.slug);
                return (
                  <th
                    key={e.slug}
                    className="border-b border-r border-border bg-muted/60 px-4 py-3 text-left min-w-[260px] last:border-r-0"
                  >
                    <span className="label-mono text-accent block mb-1">
                      Entity
                    </span>
                    {entityExists ? (
                      <Link
                        href={`/entities/${e.slug}`}
                        className="group inline-flex items-baseline gap-1.5 text-foreground font-semibold hover:text-accent"
                      >
                        {e.name_ja}
                        <span className="font-mono text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                          ↗
                        </span>
                      </Link>
                    ) : (
                      <span className="text-foreground font-semibold">
                        {e.name_ja}
                      </span>
                    )}
                    {e.name_en && (
                      <div className="font-mono text-xs text-muted-foreground mt-0.5">
                        {e.name_en}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visibleDimensions.length === 0 ? (
              <tr>
                <td
                  colSpan={matrix.entities.length + 1}
                  className="px-4 py-12 text-center label-mono text-muted-foreground"
                >
                  No dimensions match the filter
                </td>
              </tr>
            ) : (
              visibleDimensions.map((d, dIdx) => (
                <tr key={d.key} className="group">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-card border-b border-r border-border px-4 py-4 text-left align-top group-hover:bg-muted/40 transition-colors"
                  >
                    <span className="label-mono text-muted-foreground block mb-1.5 metric-number">
                      {(dIdx + 1).toString().padStart(2, "0")}
                    </span>
                    <div className="font-semibold text-foreground text-sm">
                      {d.label_ja}
                    </div>
                    {d.description && (
                      <div className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {d.description}
                      </div>
                    )}
                  </th>
                  {matrix.entities.map((e) => {
                    const cell = matrix.cells[e.slug]?.[d.key];
                    return (
                      <td
                        key={e.slug}
                        className="border-b border-r border-border px-4 py-4 align-top text-foreground/95 last:border-r-0 group-hover:bg-muted/30 transition-colors"
                      >
                        {cell ? <CellContent cell={cell} /> : <UnknownCell />}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap px-1 label-mono text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>
            <span className="metric-number text-foreground">
              {visibleDimensions.length.toString().padStart(2, "0")}
            </span>
            <span className="mx-1 opacity-50">/</span>
            <span className="metric-number">
              {matrix.dimensions.length.toString().padStart(2, "0")}
            </span>
            <span className="ml-1">dimensions</span>
          </span>
          <span className="text-border-strong">·</span>
          <span>
            <span className="metric-number text-foreground">
              {matrix.entities.length.toString().padStart(2, "0")}
            </span>
            <span className="ml-1">entities</span>
          </span>
        </div>
        <span className="metric-number">Reviewed {matrix.last_reviewed_at}</span>
      </div>
    </div>
  );
}

function CellContent({ cell }: { cell: ComparisonCell }) {
  return (
    <div className="space-y-2.5">
      <p className="leading-relaxed text-[13.5px]">
        <ReviewMarkedText>{cell.value}</ReviewMarkedText>
      </p>
      {cell.note && (
        <p className="text-xs text-muted-foreground leading-relaxed border-l-2 border-border pl-2.5">
          <ReviewMarkedText>{cell.note}</ReviewMarkedText>
        </p>
      )}
      {cell.source_url && (
        <a
          href={cell.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 label-mono text-accent hover:underline"
        >
          <span className="font-mono">↗</span>
          {cell.source_label ?? "Source"}
        </a>
      )}
    </div>
  );
}

function UnknownCell() {
  return <span className="label-mono text-muted-foreground">N/A</span>;
}
