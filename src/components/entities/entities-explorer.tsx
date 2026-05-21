"use client";

import * as React from "react";
import Link from "next/link";
import { LayoutGrid, List, ArrowUpRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card } from "@/components/ui/card";
import type { Entity, EntityType } from "@/lib/types";
import { ENTITY_TYPE_LABEL } from "@/lib/types";

type Props = {
  entities: Entity[];
};

type ViewMode = "list" | "grid";
type TypeFilter = "all" | EntityType;

export function EntitiesExplorer({ entities }: Props) {
  const [view, setView] = React.useState<ViewMode>("list");
  const [filter, setFilter] = React.useState<TypeFilter>("all");

  // 実際にエンティティが存在するタイプのみタブ表示
  const availableTypes = React.useMemo(() => {
    const set = new Set<EntityType>();
    for (const e of entities) set.add(e.type);
    return Array.from(set);
  }, [entities]);

  const filtered = React.useMemo(() => {
    if (filter === "all") return entities;
    return entities.filter((e) => e.type === filter);
  }, [entities, filter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as TypeFilter)}
          className="min-w-0"
        >
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs px-3">
              すべて
              <span className="ml-1.5 metric-number text-[10px] text-muted-foreground">
                {entities.length}
              </span>
            </TabsTrigger>
            {availableTypes.map((t) => {
              const count = entities.filter((e) => e.type === t).length;
              return (
                <TabsTrigger key={t} value={t} className="text-xs px-3">
                  {ENTITY_TYPE_LABEL[t]}
                  <span className="ml-1.5 metric-number text-[10px] text-muted-foreground">
                    {count}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        <ToggleGroup
          type="single"
          value={view}
          onValueChange={(v) => v && setView(v as ViewMode)}
          className="h-8"
        >
          <ToggleGroupItem value="list" aria-label="リスト" className="h-8 px-2.5">
            <List className="h-3.5 w-3.5" />
          </ToggleGroupItem>
          <ToggleGroupItem value="grid" aria-label="グリッド" className="h-8 px-2.5">
            <LayoutGrid className="h-3.5 w-3.5" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12">
          <p className="text-center label-mono text-muted-foreground">
            No entities in this filter
          </p>
        </Card>
      ) : view === "list" ? (
        <ListView entities={filtered} />
      ) : (
        <GridView entities={filtered} />
      )}

      <div className="flex items-center justify-between label-mono text-muted-foreground px-1">
        <span>
          <span className="metric-number text-foreground">
            {filtered.length.toString().padStart(2, "0")}
          </span>
          <span className="mx-1 opacity-50">/</span>
          <span className="metric-number">
            {entities.length.toString().padStart(2, "0")}
          </span>
          <span className="ml-1">entities</span>
        </span>
        <span>{view === "list" ? "List view" : "Grid view"}</span>
      </div>
    </div>
  );
}

function ListView({ entities }: { entities: Entity[] }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5 min-w-[280px]">
                Name
              </th>
              <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5">
                Type
              </th>
              <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5 min-w-[200px]">
                Tags
              </th>
              <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5">
                Reviewed
              </th>
              <th className="w-12 px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {entities.map((e) => (
              <tr
                key={e.slug}
                className="border-b border-border last:border-0 group hover:bg-muted/30 transition-colors"
              >
                <td className="px-4 py-3 align-top">
                  <Link href={`/entities/${e.slug}`} className="block">
                    <p className="font-medium text-foreground group-hover:text-accent">
                      {e.name_ja}
                    </p>
                    {e.name_en && (
                      <p className="font-mono text-[11px] text-muted-foreground mt-0.5">
                        {e.name_en}
                        {e.abbreviation && (
                          <span className="ml-2 opacity-70">({e.abbreviation})</span>
                        )}
                      </p>
                    )}
                  </Link>
                </td>
                <td className="px-4 py-3 align-top">
                  <span className="inline-flex items-center rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10.5px] text-foreground/80">
                    {ENTITY_TYPE_LABEL[e.type]}
                  </span>
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="flex flex-wrap gap-1">
                    {e.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center rounded border border-border bg-background px-1.5 py-0.5 text-[10.5px] text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <span className="metric-number text-xs text-muted-foreground">
                    {e.last_reviewed_at}
                  </span>
                </td>
                <td className="px-4 py-3 align-top text-right">
                  <Link
                    href={`/entities/${e.slug}`}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-accent transition-colors"
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

function GridView({ entities }: { entities: Entity[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {entities.map((e) => (
        <Link key={e.slug} href={`/entities/${e.slug}`}>
          <Card className="h-full p-5 hover:border-accent/60 hover:shadow-[0_4px_24px_-8px_rgba(14,165,233,0.18)] transition-all group">
            <div className="flex items-start justify-between gap-2 mb-3">
              <span className="inline-flex items-center rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10.5px] text-foreground/80">
                {ENTITY_TYPE_LABEL[e.type]}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-accent transition-colors" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-0.5 group-hover:text-accent">
              {e.name_ja}
            </h3>
            {e.name_en && (
              <p className="font-mono text-[11px] text-muted-foreground mb-3">
                {e.name_en}
              </p>
            )}
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">
              {e.summary}
            </p>
            <p className="label-mono text-muted-foreground metric-number">
              Reviewed {e.last_reviewed_at}
            </p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
