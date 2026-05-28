"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Check,
  ExternalLink,
} from "lucide-react";
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
import { PaywallBadge } from "@/components/paywall-badge";

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

  // Horizontal scroll state: detect when the table overflows the container so we
  // can render fade gradients + a scroll hint chip. Without this the rightmost
  // entity columns can silently fall off the viewport.
  const scrollContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [scrollState, setScrollState] = React.useState({
    canScrollLeft: false,
    canScrollRight: false,
    overflows: false,
  });

  React.useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const update = () => {
      const overflows = el.scrollWidth > el.clientWidth + 1;
      setScrollState({
        canScrollLeft: el.scrollLeft > 1,
        canScrollRight:
          overflows && el.scrollLeft + el.clientWidth < el.scrollWidth - 1,
        overflows,
      });
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [visibleDimensions.length, matrix.entities.length]);

  const toggleDim = (key: string) => {
    setHiddenDims((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const clearHidden = () => setHiddenDims(new Set());

  /**
   * 行列の網羅性 (cell fill rate) を集計.
   * - 全体: filled / total / percentage
   * - dimension 別: 各行が何 entity 分埋まっているか
   * UI に「Z% filled」+ 各 dimension の行内バーで表示.
   */
  const fillStats = React.useMemo(() => {
    const totalCells = matrix.entities.length * matrix.dimensions.length;
    let filledCells = 0;
    const perDimension = new Map<string, number>();
    const perEntity = new Map<string, number>();
    for (const d of matrix.dimensions) {
      let count = 0;
      for (const e of matrix.entities) {
        const cell = matrix.cells[e.slug]?.[d.key];
        if (cell && cell.value && cell.value.trim().length > 0) {
          count++;
          filledCells++;
          perEntity.set(e.slug, (perEntity.get(e.slug) ?? 0) + 1);
        }
      }
      perDimension.set(d.key, count);
    }
    return {
      totalCells,
      filledCells,
      percent:
        totalCells === 0 ? 0 : Math.round((filledCells / totalCells) * 100),
      perDimension,
      perEntity,
    };
  }, [matrix.cells, matrix.dimensions, matrix.entities]);

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

        <div className="flex items-center gap-3">
          {/* Coverage metric: filled / total cells + percentage */}
          <div
            className="hidden sm:flex items-center gap-2 label-mono text-muted-foreground"
            title="このマトリックスのセル充填率"
          >
            <span>
              <span className="metric-number text-foreground">
                {fillStats.filledCells}
              </span>
              <span className="mx-1 opacity-50">/</span>
              <span className="metric-number">{fillStats.totalCells}</span>
              <span className="ml-1">cells</span>
            </span>
            {/* Inline progress bar */}
            <div className="w-16 h-1 rounded-full bg-muted/40 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  fillStats.percent >= 80
                    ? "bg-emerald-500"
                    : fillStats.percent >= 50
                      ? "bg-accent"
                      : "bg-amber-500"
                }`}
                style={{ width: `${fillStats.percent}%` }}
              />
            </div>
            <span
              className={`metric-number ${
                fillStats.percent >= 80
                  ? "text-emerald-600 dark:text-emerald-300"
                  : fillStats.percent >= 50
                    ? "text-accent"
                    : "text-amber-600 dark:text-amber-300"
              }`}
            >
              {fillStats.percent}%
            </span>
          </div>

          <span className="label-mono text-muted-foreground hidden sm:inline opacity-50">
            ·
          </span>

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
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="relative overflow-x-auto rounded-lg border border-border bg-card scrollbar-thin"
        >
          <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-muted/60 border-b border-r border-border px-4 py-3 text-left min-w-[200px]">
                <span className="label-mono text-muted-foreground">Dimension</span>
              </th>
              {matrix.entities.map((e) => {
                const entityExists = publishedSet.has(e.slug);
                const entityFilled = fillStats.perEntity.get(e.slug) ?? 0;
                const totalDims = matrix.dimensions.length;
                const entityPct =
                  totalDims === 0 ? 0 : (entityFilled / totalDims) * 100;
                return (
                  <th
                    key={e.slug}
                    className="border-b border-r border-border bg-muted/60 px-4 py-3 text-left min-w-[260px] last:border-r-0 align-top"
                  >
                    {/* Top row: entity label badge + coverage chip */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="label-mono text-accent">Entity</span>
                      <span
                        className="metric-number text-[10px] text-muted-foreground"
                        title={`${entityFilled}/${totalDims} dimensions filled for this entity`}
                      >
                        {entityFilled}/{totalDims}
                      </span>
                    </div>

                    {/* Per-entity coverage bar */}
                    <div
                      className="h-0.5 rounded-full bg-muted/40 mb-2 overflow-hidden"
                      aria-hidden
                    >
                      <div
                        className={`h-full transition-all ${
                          entityPct >= 80
                            ? "bg-emerald-500/70"
                            : entityPct >= 50
                              ? "bg-accent/60"
                              : "bg-amber-500/60"
                        }`}
                        style={{ width: `${entityPct}%` }}
                      />
                    </div>

                    {entityExists ? (
                      <Link
                        href={`/entities/${e.slug}`}
                        className="group inline-flex items-baseline gap-1.5 text-foreground font-semibold hover:text-accent"
                      >
                        {e.name_ja}
                        <ExternalLink className="h-3 w-3 text-accent opacity-0 group-hover:opacity-100 transition-opacity" />
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
              visibleDimensions.map((d, dIdx) => {
                const filled = fillStats.perDimension.get(d.key) ?? 0;
                const total = matrix.entities.length;
                const dimPct = total === 0 ? 0 : (filled / total) * 100;
                return (
                <tr key={d.key} className="group">
                  <th
                    scope="row"
                    className="sticky left-0 z-10 bg-card border-b border-r border-border px-4 py-4 text-left align-top group-hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="label-mono text-muted-foreground metric-number">
                        {(dIdx + 1).toString().padStart(2, "0")}
                      </span>
                      <span
                        className="metric-number text-[10px] text-muted-foreground"
                        title={`${filled}/${total} entities have data`}
                      >
                        {filled}/{total}
                      </span>
                    </div>
                    {/* Fill bar (horizontal mini bar showing how much of this dimension is covered) */}
                    <div
                      className="h-0.5 rounded-full bg-muted/40 mb-2 overflow-hidden"
                      aria-hidden
                    >
                      <div
                        className="h-full bg-accent/50 transition-all"
                        style={{ width: `${dimPct}%` }}
                      />
                    </div>
                    <div className="font-semibold text-foreground text-sm flex items-center gap-2 flex-wrap">
                      {d.label_ja}
                      <PaywallBadge tier={d.paywall_tier} compact />
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
                );
              })
            )}
          </tbody>
        </table>
        </div>

        {/* Fade gradient + scroll hint when content overflows.
            pointer-events-none so they never block scroll/click on the table. */}
        {scrollState.canScrollLeft && (
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 bottom-0 left-0 w-8 rounded-l-lg bg-gradient-to-r from-background/95 to-transparent"
          />
        )}
        {scrollState.canScrollRight && (
          <div
            aria-hidden
            className="pointer-events-none absolute top-0 bottom-0 right-0 w-10 rounded-r-lg bg-gradient-to-l from-background/95 to-transparent"
          />
        )}
        {scrollState.overflows && scrollState.canScrollRight && (
          <div
            aria-hidden
            className="pointer-events-none absolute top-2 right-2 inline-flex items-center gap-1 rounded-full border border-accent/40 bg-background/90 px-2 py-0.5 label-mono text-[10px] text-accent shadow-sm"
          >
            横スクロール →
          </div>
        )}
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
    <div className="space-y-1.5">
      {/* Primary value */}
      <p className="leading-relaxed text-[13.5px] text-foreground">
        <ReviewMarkedText>{cell.value}</ReviewMarkedText>
      </p>

      {/* Note: 編集部の補足. 主値より弱く、左サイドの border で区別 */}
      {cell.note && (
        <p className="text-[11.5px] text-muted-foreground/85 leading-relaxed border-l-2 border-accent/30 pl-2 italic">
          <ReviewMarkedText>{cell.note}</ReviewMarkedText>
        </p>
      )}

      {/* Source: 出典. インラインリンクで控えめに */}
      {cell.source_url && (
        <a
          href={cell.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 label-mono text-[10px] text-accent/80 hover:text-accent hover:underline transition-colors"
        >
          <ExternalLink className="h-2.5 w-2.5" />
          {cell.source_label ?? "出典"}
        </a>
      )}
    </div>
  );
}

/** 値なしセル. N/A よりは "未収載" と明示的に表現し、視覚的に弱める */
function UnknownCell() {
  return (
    <span
      className="inline-flex items-center gap-1 label-mono text-[10px] text-muted-foreground/50 italic"
      title="この組合せはまだ Carbomir 編集部で扱っていません"
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full border border-muted-foreground/30" />
      未収載
    </span>
  );
}
