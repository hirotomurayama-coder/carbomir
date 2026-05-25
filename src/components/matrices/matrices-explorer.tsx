"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Search,
  SlidersHorizontal,
  Layers,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MATRIX_CATEGORY_LABEL,
  type ComparisonMatrix,
  type MatrixCategory,
} from "@/lib/types";
import { MatrixThumbnail } from "./matrix-thumbnail";
import { countReviewMarks } from "@/components/review-marks";

type Props = {
  matrices: ComparisonMatrix[];
};

type SortMode = "recent" | "size" | "dims";

function countCells(m: ComparisonMatrix): number {
  let n = 0;
  for (const e of m.entities) {
    const row = m.cells[e.slug];
    if (!row) continue;
    for (const d of m.dimensions) {
      if (row[d.key]) n++;
    }
  }
  return n;
}

function countMatrixReviewMarks(m: ComparisonMatrix): number {
  let n = countReviewMarks(m.description);
  for (const entity of m.entities) {
    const row = m.cells[entity.slug];
    if (!row) continue;
    for (const dim of m.dimensions) {
      const c = row[dim.key];
      if (!c) continue;
      n += countReviewMarks(c.value);
      if (c.note) n += countReviewMarks(c.note);
    }
  }
  return n;
}

export function MatricesExplorer({ matrices }: Props) {
  const [filter, setFilter] = React.useState("");
  const [sort, setSort] = React.useState<SortMode>("recent");

  const haystack = (m: ComparisonMatrix) => {
    const parts: string[] = [m.title, m.description];
    for (const e of m.entities) parts.push(e.name_ja, e.name_en ?? "");
    for (const d of m.dimensions) parts.push(d.label_ja);
    if (m.tags) parts.push(...m.tags);
    if (m.category) parts.push(MATRIX_CATEGORY_LABEL[m.category]);
    return parts.join(" ").toLowerCase();
  };

  const filtered = React.useMemo(() => {
    const q = filter.trim().toLowerCase();
    let list = matrices;
    if (q) list = list.filter((m) => haystack(m).includes(q));
    return [...list].sort((a, b) => {
      if (sort === "recent")
        return b.last_reviewed_at.localeCompare(a.last_reviewed_at);
      if (sort === "size") return b.entities.length - a.entities.length;
      return b.dimensions.length - a.dimensions.length;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matrices, filter, sort]);

  // カテゴリ別グルーピング (category なしは「その他」)
  const grouped = React.useMemo(() => {
    const map = new Map<MatrixCategory | "other", ComparisonMatrix[]>();
    for (const m of filtered) {
      const key: MatrixCategory | "other" = m.category ?? "other";
      const existing = map.get(key) ?? [];
      existing.push(m);
      map.set(key, existing);
    }
    return map;
  }, [filtered]);

  // 並び順 (カテゴリ表示順)
  const categoryOrder: (MatrixCategory | "other")[] = [
    "scheme",
    "standard",
    "methodology",
    "market",
    "eligibility",
    "other",
  ];

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative min-w-[260px] flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="行列タイトル・エンティティ・軸キーワード・タグで絞り込み..."
            className="h-9 pl-8 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="label-mono text-muted-foreground hidden sm:inline">
            {filtered.length.toString().padStart(2, "0")}/
            {matrices.length.toString().padStart(2, "0")} matrices
          </span>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 text-xs">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                並べ替え
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
                Sort by
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={sort}
                onValueChange={(v) => setSort(v as SortMode)}
              >
                <DropdownMenuRadioItem value="recent">最終更新</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="size">エンティティ数</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dims">軸数</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <Card className="p-12">
          <p className="text-center label-mono text-muted-foreground">
            該当する比較行列はありません
          </p>
        </Card>
      )}

      {/* Grouped sections */}
      {categoryOrder.map((cat) => {
        const items = grouped.get(cat);
        if (!items || items.length === 0) return null;
        const label =
          cat === "other" ? "その他" : MATRIX_CATEGORY_LABEL[cat];
        return (
          <section key={cat} className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Layers className="h-3.5 w-3.5 text-accent" />
              <h2 className="label-mono text-foreground">{label}</h2>
              <span className="metric-number text-[10px] text-muted-foreground">
                {items.length.toString().padStart(2, "0")}
              </span>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {items.map((m) => (
                <MatrixCard key={m.slug} matrix={m} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function MatrixCard({ matrix }: { matrix: ComparisonMatrix }) {
  const cellCount = countCells(matrix);
  const reviewCount = countMatrixReviewMarks(matrix);
  return (
    <Card className="overflow-hidden p-0 group hover:border-accent/60 hover:shadow-[0_4px_24px_-8px_rgba(14,165,233,0.18)] transition-all">
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
          {matrix.category && (
            <Badge
              variant="outline"
              className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
            >
              {MATRIX_CATEGORY_LABEL[matrix.category]}
            </Badge>
          )}
          <span className="metric-number text-[10px] text-muted-foreground">
            {matrix.last_reviewed_at}
          </span>
        </div>
        <Link href={`/matrices/${matrix.slug}`} className="block group">
          <h3 className="text-base font-semibold text-foreground group-hover:text-accent mb-1 leading-snug">
            {matrix.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
            {matrix.description}
          </p>
        </Link>
      </div>

      <div className="px-5">
        <MatrixThumbnail matrix={matrix} />
      </div>

      <div className="px-5 py-3 mt-3 border-t border-border flex items-center justify-between gap-2 flex-wrap label-mono text-muted-foreground">
        <div className="flex items-center gap-3">
          <span>
            <span className="metric-number text-foreground">
              {matrix.entities.length}
            </span>
            <span className="opacity-50 mx-1">×</span>
            <span className="metric-number text-foreground">
              {matrix.dimensions.length}
            </span>
            <span className="ml-1">=</span>
            <span className="metric-number text-foreground ml-1">{cellCount}</span>
            <span className="ml-1">cells</span>
          </span>
          {reviewCount > 0 && (
            <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-300">
              <span className="metric-number">{reviewCount}</span>
              要確認
            </span>
          )}
        </div>
        <Link
          href={`/matrices/${matrix.slug}`}
          className="inline-flex items-center gap-1 text-accent hover:underline"
          aria-label={`${matrix.title} を開く`}
        >
          Open
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Tags */}
      {matrix.tags && matrix.tags.length > 0 && (
        <div className="px-5 pb-4 flex flex-wrap gap-1">
          {matrix.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center rounded border border-border bg-background px-1.5 py-0.5 text-[10.5px] text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
