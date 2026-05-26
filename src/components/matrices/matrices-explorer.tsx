"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MATRIX_CATEGORY_LABEL,
  type ComparisonMatrix,
  type MatrixCategory,
} from "@/lib/types";
import { useTableControls } from "@/components/explorer/use-table-controls";
import {
  SortableHeader,
  StaticHeader,
} from "@/components/explorer/sortable-header";
import {
  ExplorerToolbar,
  type Density,
  type ViewMode,
} from "@/components/explorer/explorer-toolbar";

type Props = {
  matrices: ComparisonMatrix[];
};

type CategoryFilter = "all" | MatrixCategory;

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

export function MatricesExplorer({ matrices }: Props) {
  const [view, setView] = React.useState<ViewMode>("list");
  const [density, setDensity] = React.useState<Density>("compact");
  const [category, setCategory] = React.useState<CategoryFilter>("all");

  const availableCategories = React.useMemo(() => {
    const set = new Set<MatrixCategory>();
    for (const m of matrices) if (m.category) set.add(m.category);
    return Array.from(set);
  }, [matrices]);

  const categoryFiltered = React.useMemo(() => {
    if (category === "all") return matrices;
    return matrices.filter((m) => m.category === category);
  }, [matrices, category]);

  const controls = useTableControls<ComparisonMatrix>({
    items: categoryFiltered,
    searchText: (m) => {
      const parts: string[] = [m.title, m.description];
      for (const e of m.entities) parts.push(e.name_ja, e.name_en ?? "");
      for (const d of m.dimensions) parts.push(d.label_ja);
      if (m.tags) parts.push(...m.tags);
      if (m.category) parts.push(MATRIX_CATEGORY_LABEL[m.category]);
      return parts.join(" ");
    },
    sortableColumns: [
      { key: "title", sortValue: (m) => m.title },
      { key: "category", sortValue: (m) => (m.category ? MATRIX_CATEGORY_LABEL[m.category] : "zzz") },
      { key: "entities", sortValue: (m) => m.entities.length },
      { key: "dimensions", sortValue: (m) => m.dimensions.length },
      { key: "reviewed", sortValue: (m) => m.last_reviewed_at },
    ],
    defaultSort: { key: "reviewed", dir: "desc" },
  });

  const tabFilter = (
    <Tabs
      value={category}
      onValueChange={(v) => setCategory(v as CategoryFilter)}
      className="min-w-0"
    >
      <TabsList className="h-8">
        <TabsTrigger value="all" className="text-xs px-2.5">
          すべて
          <span className="ml-1.5 metric-number text-[10px] text-muted-foreground">
            {matrices.length}
          </span>
        </TabsTrigger>
        {availableCategories.map((c) => {
          const count = matrices.filter((m) => m.category === c).length;
          return (
            <TabsTrigger key={c} value={c} className="text-xs px-2.5">
              {MATRIX_CATEGORY_LABEL[c]}
              <span className="ml-1.5 metric-number text-[10px] text-muted-foreground">
                {count}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );

  return (
    <div className="space-y-3">
      <ExplorerToolbar
        query={controls.query}
        onQueryChange={controls.setQuery}
        view={view}
        onViewChange={setView}
        density={density}
        onDensityChange={setDensity}
        matchCount={controls.visible.length}
        totalCount={matrices.length}
        itemLabel="matrices"
        placeholder="行列タイトル・エンティティ名・軸・タグで絞り込み..."
        leftSlot={tabFilter}
        sticky
      />

      {controls.visible.length === 0 ? (
        <Card className="p-12">
          <p className="text-center label-mono text-muted-foreground">
            該当する比較行列はありません
          </p>
        </Card>
      ) : view === "list" ? (
        <ListView
          matrices={controls.visible}
          density={density}
          sort={controls.sort}
          onToggleSort={controls.toggleSort}
        />
      ) : (
        <GridView matrices={controls.visible} />
      )}
    </div>
  );
}

/* ============================================================
 * List view (DB-style compact table)
 * ============================================================ */

function ListView({
  matrices,
  density,
  sort,
  onToggleSort,
}: {
  matrices: ComparisonMatrix[];
  density: Density;
  sort: { key: string; dir: "asc" | "desc" } | null;
  onToggleSort: (key: string) => void;
}) {
  const rowPad = density === "compact" ? "py-2" : "py-3";

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <SortableHeader
                sortKey="title"
                current={sort}
                onToggle={onToggleSort}
                minWidth="320px"
              >
                行列タイトル
              </SortableHeader>
              <SortableHeader
                sortKey="category"
                current={sort}
                onToggle={onToggleSort}
                minWidth="110px"
              >
                カテゴリ
              </SortableHeader>
              <SortableHeader
                sortKey="entities"
                current={sort}
                onToggle={onToggleSort}
                minWidth="70px"
                className="text-right"
              >
                Entities
              </SortableHeader>
              <SortableHeader
                sortKey="dimensions"
                current={sort}
                onToggle={onToggleSort}
                minWidth="60px"
                className="text-right"
              >
                Dims
              </SortableHeader>
              <StaticHeader
                minWidth="60px"
                className="text-right hidden md:table-cell"
              >
                Cells
              </StaticHeader>
              <StaticHeader minWidth="160px" className="hidden lg:table-cell">
                エンティティ抜粋
              </StaticHeader>
              <SortableHeader
                sortKey="reviewed"
                current={sort}
                onToggle={onToggleSort}
                minWidth="100px"
                className="hidden md:table-cell"
              >
                Reviewed
              </SortableHeader>
              <th className="w-10 px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {matrices.map((m) => (
              <tr
                key={m.slug}
                className="border-b border-border last:border-0 group hover:bg-muted/30 transition-colors"
              >
                <td className={`px-3 ${rowPad} align-top`}>
                  <Link href={`/matrices/${m.slug}`} className="block">
                    <p className="font-medium text-foreground group-hover:text-accent leading-tight">
                      {m.title}
                    </p>
                    <p className="text-[11.5px] text-muted-foreground leading-snug mt-0.5 line-clamp-1">
                      {m.description}
                    </p>
                  </Link>
                </td>
                <td className={`px-3 ${rowPad} align-top`}>
                  {m.category ? (
                    <span className="inline-flex items-center rounded border border-accent/30 bg-accent/5 px-1.5 py-0 text-[10px] leading-[16px] text-accent">
                      {MATRIX_CATEGORY_LABEL[m.category]}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td
                  className={`px-3 ${rowPad} align-top text-right metric-number text-[12px] text-foreground/85`}
                >
                  {m.entities.length}
                </td>
                <td
                  className={`px-3 ${rowPad} align-top text-right metric-number text-[12px] text-foreground/85`}
                >
                  {m.dimensions.length}
                </td>
                <td
                  className={`px-3 ${rowPad} align-top text-right metric-number text-[12px] text-muted-foreground hidden md:table-cell`}
                >
                  {countCells(m)}
                </td>
                <td
                  className={`px-3 ${rowPad} align-top hidden lg:table-cell`}
                >
                  <div className="flex flex-wrap gap-1">
                    {m.entities.slice(0, 3).map((e) => (
                      <span
                        key={e.slug}
                        className="inline-flex items-center rounded border border-border bg-background px-1.5 py-0 text-[10px] leading-[16px] text-muted-foreground"
                      >
                        {e.name_ja}
                      </span>
                    ))}
                    {m.entities.length > 3 && (
                      <span className="label-mono text-[10px] leading-[16px] text-muted-foreground">
                        +{m.entities.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td
                  className={`px-3 ${rowPad} align-top hidden md:table-cell metric-number text-[11px] text-muted-foreground`}
                >
                  {m.last_reviewed_at}
                </td>
                <td className={`px-3 ${rowPad} align-top text-right`}>
                  <Link
                    href={`/matrices/${m.slug}`}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-accent transition-colors"
                    aria-label="開く"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ============================================================
 * Grid view (compact thumbnail cards, NO mini-table preview)
 * ============================================================ */

function GridView({ matrices }: { matrices: ComparisonMatrix[] }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {matrices.map((m) => (
        <Card
          key={m.slug}
          className="h-full p-3.5 hover:border-accent/60 hover:shadow-[0_4px_24px_-8px_rgba(14,165,233,0.18)] transition-all group"
        >
          <Link href={`/matrices/${m.slug}`} className="block">
            <div className="flex items-start justify-between gap-2 mb-2">
              {m.category ? (
                <span className="inline-flex items-center rounded border border-accent/30 bg-accent/5 px-1.5 py-0 text-[10px] leading-[16px] text-accent">
                  {MATRIX_CATEGORY_LABEL[m.category]}
                </span>
              ) : (
                <span />
              )}
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-accent transition-colors" />
            </div>
            <h3 className="text-[14px] font-semibold text-foreground mb-1 leading-tight group-hover:text-accent">
              {m.title}
            </h3>
            <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2 mb-2">
              {m.description}
            </p>
          </Link>

          {/* Compact stats line (entities × dims = cells) */}
          <div className="flex items-center gap-2 label-mono text-[10.5px] text-muted-foreground mb-1.5 border-t border-border/60 pt-1.5">
            <span>
              <span className="metric-number text-foreground/85">
                {m.entities.length}
              </span>
              <span className="opacity-50 mx-0.5">×</span>
              <span className="metric-number text-foreground/85">
                {m.dimensions.length}
              </span>
              <span className="opacity-50 mx-1">=</span>
              <span className="metric-number text-foreground/85">
                {countCells(m)}
              </span>
              <span className="ml-1 opacity-70">cells</span>
            </span>
            <span className="ml-auto metric-number">{m.last_reviewed_at}</span>
          </div>

          {m.tags && m.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {m.tags.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center rounded border border-border bg-background px-1.5 py-0 text-[10px] leading-[16px] text-muted-foreground"
                >
                  {t}
                </span>
              ))}
              {m.tags.length > 3 && (
                <span className="label-mono text-[10px] leading-[16px] text-muted-foreground">
                  +{m.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
