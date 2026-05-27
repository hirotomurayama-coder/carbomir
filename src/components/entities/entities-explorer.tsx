"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpRight, X, Tag, BookOpenText } from "lucide-react";
import { carbonCreditsUrl } from "@/lib/data/glossary-links";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import type { Entity, EntityType } from "@/lib/types";
import { ENTITY_TYPE_LABEL } from "@/lib/types";
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
import { STICKY_TH } from "@/components/explorer/use-sticky-toolbar";

type Props = {
  entities: Entity[];
};

type TypeFilter = "all" | EntityType;

export function EntitiesExplorer({ entities }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");

  const [view, setView] = React.useState<ViewMode>("list");
  const [density, setDensity] = React.useState<Density>("compact");
  const [filter, setFilter] = React.useState<TypeFilter>("all");

  // tag (URL) + type (タブ) で pre-filter
  const tagFiltered = React.useMemo(() => {
    if (!activeTag) return entities;
    return entities.filter((e) => e.tags.includes(activeTag));
  }, [entities, activeTag]);

  const availableTypes = React.useMemo(() => {
    const set = new Set<EntityType>();
    for (const e of tagFiltered) set.add(e.type);
    return Array.from(set);
  }, [tagFiltered]);

  const typeFiltered = React.useMemo(() => {
    if (filter === "all") return tagFiltered;
    return tagFiltered.filter((e) => e.type === filter);
  }, [tagFiltered, filter]);

  React.useEffect(() => {
    if (filter !== "all" && !availableTypes.includes(filter as EntityType)) {
      setFilter("all");
    }
  }, [availableTypes, filter]);

  // 共通 controls (検索 + ソート) を適用
  const controls = useTableControls<Entity>({
    items: typeFiltered,
    searchText: (e) =>
      [
        e.name_ja,
        e.name_en ?? "",
        e.abbreviation ?? "",
        e.summary ?? "",
        ENTITY_TYPE_LABEL[e.type],
        ...(e.tags ?? []),
      ].join(" "),
    sortableColumns: [
      { key: "name", sortValue: (e) => e.name_en ?? e.name_ja },
      { key: "type", sortValue: (e) => ENTITY_TYPE_LABEL[e.type] },
      { key: "reviewed", sortValue: (e) => e.last_reviewed_at },
    ],
    defaultSort: { key: "name", dir: "asc" },
  });

  const clearTag = React.useCallback(() => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete("tag");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }, [pathname, router, searchParams]);

  // Tab filter (left-slot in toolbar)
  const tabFilter = (
    <Tabs
      value={filter}
      onValueChange={(v) => setFilter(v as TypeFilter)}
      className="min-w-0"
    >
      <TabsList className="h-8">
        <TabsTrigger value="all" className="text-xs px-2.5">
          すべて
          <span className="ml-1.5 metric-number text-[10px] text-muted-foreground">
            {tagFiltered.length}
          </span>
        </TabsTrigger>
        {availableTypes.map((t) => {
          const count = tagFiltered.filter((e) => e.type === t).length;
          return (
            <TabsTrigger key={t} value={t} className="text-xs px-2.5">
              {ENTITY_TYPE_LABEL[t]}
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
      {/* Active tag chip */}
      {activeTag && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="label-mono text-muted-foreground">Filtered by tag</span>
          <button
            type="button"
            onClick={clearTag}
            className="inline-flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-2 py-1 text-xs text-accent hover:bg-accent/20 transition-colors"
            aria-label={`tag フィルタ ${activeTag} を解除`}
          >
            <Tag className="h-3 w-3" />
            {activeTag}
            <X className="h-3 w-3 opacity-70" />
          </button>
        </div>
      )}

      <ExplorerToolbar
        query={controls.query}
        onQueryChange={controls.setQuery}
        view={view}
        onViewChange={setView}
        density={density}
        onDensityChange={setDensity}
        matchCount={controls.visible.length}
        totalCount={entities.length}
        itemLabel="entities"
        placeholder="名称・別名・タグで絞り込み..."
        leftSlot={tabFilter}
        sticky
      />

      {controls.visible.length === 0 ? (
        <Card className="p-12">
          <p className="text-center label-mono text-muted-foreground">
            {activeTag
              ? `No entities tagged "${activeTag}" in this view`
              : controls.query
                ? `"${controls.query}" にヒットするエンティティはありません`
                : "No entities in this filter"}
          </p>
        </Card>
      ) : view === "list" ? (
        <ListView
          entities={controls.visible}
          activeTag={activeTag}
          density={density}
          sort={controls.sort}
          onToggleSort={controls.toggleSort}
        />
      ) : (
        <GridView entities={controls.visible} activeTag={activeTag} />
      )}
    </div>
  );
}

/* ============================================================
 * Tag chip (active-aware Link)
 * ============================================================ */

function TagChip({
  tag,
  active,
  variant = "muted",
}: {
  tag: string;
  active?: boolean;
  variant?: "muted" | "background";
}) {
  const base =
    "inline-flex items-center rounded border px-1.5 py-0 text-[10px] leading-[16px] transition-colors";
  const palette = active
    ? "border-accent/50 bg-accent/15 text-accent"
    : variant === "background"
      ? "border-border bg-background text-muted-foreground hover:border-accent/40 hover:text-accent"
      : "border-border bg-muted/40 text-foreground/80 hover:border-accent/40 hover:text-accent";
  return (
    <Link
      href={`/entities?tag=${encodeURIComponent(tag)}`}
      className={`${base} ${palette}`}
      aria-label={`tag ${tag} で絞り込む`}
    >
      {tag}
    </Link>
  );
}

/* ============================================================
 * List view (DB-style compact table)
 * ============================================================ */

function ListView({
  entities,
  activeTag,
  density,
  sort,
  onToggleSort,
}: {
  entities: Entity[];
  activeTag: string | null;
  density: Density;
  sort: { key: string; dir: "asc" | "desc" } | null;
  onToggleSort: (key: string) => void;
}) {
  const rowPad = density === "compact" ? "py-2" : "py-3";
  const tagLimit = density === "compact" ? 2 : 4;

  return (
    <Card className="p-0 overflow-clip">
      <table className="w-full text-sm border-separate border-spacing-0">
          <thead>
            <tr className="border-b border-border">
              <SortableHeader
                sortKey="name"
                current={sort}
                onToggle={onToggleSort}
                minWidth="260px"
                className={STICKY_TH}
              >
                Name
              </SortableHeader>
              <SortableHeader
                sortKey="type"
                current={sort}
                onToggle={onToggleSort}
                minWidth="100px"
                className={STICKY_TH}
              >
                Type
              </SortableHeader>
              <StaticHeader minWidth="200px" className={STICKY_TH}>
                Tags
              </StaticHeader>
              <SortableHeader
                sortKey="reviewed"
                current={sort}
                onToggle={onToggleSort}
                minWidth="100px"
                className={`hidden md:table-cell ${STICKY_TH}`}
              >
                Reviewed
              </SortableHeader>
              <th
                className={`w-9 px-2 py-2 text-center ${STICKY_TH}`}
                title="carboncredits.jp 用語集との対応"
              >
                <span className="label-mono text-[9px] text-muted-foreground/70">
                  CC.jp
                </span>
              </th>
              <th className={`w-10 px-3 py-2 ${STICKY_TH}`}></th>
            </tr>
          </thead>
          <tbody>
            {entities.map((e) => (
              <tr
                key={e.slug}
                className="border-b border-border last:border-0 group hover:bg-muted/30 transition-colors"
              >
                <td className={`px-3 ${rowPad} align-top`}>
                  <Link href={`/entities/${e.slug}`} className="block">
                    <p className="font-medium text-foreground group-hover:text-accent leading-tight">
                      {e.name_ja}
                    </p>
                    {e.name_en && (
                      <p className="font-mono text-[10.5px] text-muted-foreground mt-0.5 truncate max-w-[420px]">
                        {e.name_en}
                        {e.abbreviation && (
                          <span className="ml-2 opacity-70">({e.abbreviation})</span>
                        )}
                      </p>
                    )}
                  </Link>
                </td>
                <td className={`px-3 ${rowPad} align-top`}>
                  <span className="inline-flex items-center rounded border border-border bg-muted/50 px-1.5 py-0 text-[10px] leading-[16px] text-foreground/80">
                    {ENTITY_TYPE_LABEL[e.type]}
                  </span>
                </td>
                <td className={`px-3 ${rowPad} align-top`}>
                  <div className="flex flex-wrap gap-1">
                    {e.tags.slice(0, tagLimit).map((t) => (
                      <TagChip
                        key={t}
                        tag={t}
                        variant="background"
                        active={t === activeTag}
                      />
                    ))}
                    {e.tags.length > tagLimit && (
                      <span className="label-mono text-muted-foreground text-[10px] leading-[16px]">
                        +{e.tags.length - tagLimit}
                      </span>
                    )}
                  </div>
                </td>
                <td className={`px-3 ${rowPad} align-top hidden md:table-cell`}>
                  <span className="metric-number text-[11px] text-muted-foreground">
                    {e.last_reviewed_at}
                  </span>
                </td>
                <td className={`px-2 ${rowPad} align-top text-center`}>
                  {(() => {
                    const cc = carbonCreditsUrl(e.slug);
                    return cc ? (
                      <a
                        href={cc}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="carboncredits.jp の用語集記事を開く"
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md text-sky-600 dark:text-sky-300 hover:bg-sky-500/15 transition-colors"
                        aria-label="carboncredits.jp で読む"
                      >
                        <BookOpenText className="h-3.5 w-3.5" />
                      </a>
                    ) : null;
                  })()}
                </td>
                <td className={`px-3 ${rowPad} align-top text-right`}>
                  <Link
                    href={`/entities/${e.slug}`}
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
    </Card>
  );
}

/* ============================================================
 * Grid view (galleries)
 * ============================================================ */

function GridView({
  entities,
  activeTag,
}: {
  entities: Entity[];
  activeTag: string | null;
}) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {entities.map((e) => (
        <Card
          key={e.slug}
          className="h-full p-3.5 hover:border-accent/60 hover:shadow-[0_4px_24px_-8px_rgba(14,165,233,0.18)] transition-all group"
        >
          <Link href={`/entities/${e.slug}`} className="block">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="inline-flex items-center rounded border border-border bg-muted/50 px-1.5 py-0 text-[10px] leading-[16px] text-foreground/80">
                {ENTITY_TYPE_LABEL[e.type]}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-accent transition-colors" />
            </div>
            <h3 className="text-[14px] font-semibold text-foreground mb-0.5 leading-tight group-hover:text-accent">
              {e.name_ja}
            </h3>
            {e.name_en && (
              <p className="font-mono text-[10.5px] text-muted-foreground mb-2 truncate">
                {e.name_en}
              </p>
            )}
            <p className="text-[12.5px] text-muted-foreground leading-relaxed line-clamp-2 mb-2">
              {e.summary}
            </p>
          </Link>
          {e.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {e.tags.slice(0, 3).map((t) => (
                <TagChip
                  key={t}
                  tag={t}
                  variant="background"
                  active={t === activeTag}
                />
              ))}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
