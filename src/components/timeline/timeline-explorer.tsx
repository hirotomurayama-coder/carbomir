"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, Star, ExternalLink } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TimelineCategory, TimelineEvent } from "@/lib/types";
import { TIMELINE_CATEGORY_LABEL } from "@/lib/types";
import { ReviewMarkedText } from "@/components/review-marks";

type Props = {
  events: TimelineEvent[];
  /** affected_entity_slugs から名前を引くためのマップ */
  entityNameMap: Record<string, string>;
};

type CategoryFilter = "all" | TimelineCategory;

export function TimelineExplorer({ events, entityNameMap }: Props) {
  const [filter, setFilter] = React.useState<CategoryFilter>("all");
  const [onlyImportant, setOnlyImportant] = React.useState(false);

  const availableCategories = React.useMemo(() => {
    const set = new Set<TimelineCategory>();
    for (const e of events) set.add(e.category);
    return Array.from(set);
  }, [events]);

  const filtered = React.useMemo(() => {
    return events.filter((e) => {
      if (filter !== "all" && e.category !== filter) return false;
      if (onlyImportant && e.importance < 4) return false;
      return true;
    });
  }, [events, filter, onlyImportant]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Tabs
          value={filter}
          onValueChange={(v) => setFilter(v as CategoryFilter)}
          className="min-w-0"
        >
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs px-3">
              すべて
              <span className="ml-1.5 metric-number text-[10px] text-muted-foreground">
                {events.length}
              </span>
            </TabsTrigger>
            {availableCategories.map((c) => {
              const count = events.filter((e) => e.category === c).length;
              return (
                <TabsTrigger key={c} value={c} className="text-xs px-3">
                  {TIMELINE_CATEGORY_LABEL[c]}
                  <span className="ml-1.5 metric-number text-[10px] text-muted-foreground">
                    {count}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        <Toggle
          pressed={onlyImportant}
          onPressedChange={setOnlyImportant}
          size="sm"
          className="h-8 text-xs gap-1.5 data-[state=on]:bg-accent/15 data-[state=on]:text-accent"
        >
          <Star className="h-3 w-3" />
          重要のみ (4+)
        </Toggle>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12">
          <p className="text-center label-mono text-muted-foreground">
            No events in this filter
          </p>
        </Card>
      ) : (
        <TimelineList events={filtered} entityNameMap={entityNameMap} />
      )}

      <div className="flex items-center justify-between label-mono text-muted-foreground px-1">
        <span>
          <span className="metric-number text-foreground">
            {filtered.length.toString().padStart(2, "0")}
          </span>
          <span className="mx-1 opacity-50">/</span>
          <span className="metric-number">
            {events.length.toString().padStart(2, "0")}
          </span>
          <span className="ml-1">events</span>
        </span>
        <span>Chronological view</span>
      </div>
    </div>
  );
}

function TimelineList({
  events,
  entityNameMap,
}: {
  events: TimelineEvent[];
  entityNameMap: Record<string, string>;
}) {
  return (
    <Card className="overflow-hidden p-0">
      <ol className="relative">
        {events.map((e, idx) => (
          <li
            key={e.slug}
            className="relative grid grid-cols-[120px_minmax(0,1fr)] gap-0 border-b border-border last:border-0 group hover:bg-muted/20 transition-colors"
          >
            {/* Date rail */}
            <div className="border-r border-border bg-muted/30 px-4 py-5 flex flex-col items-start gap-1">
              <span className="metric-number text-sm font-semibold text-foreground tracking-tight">
                {formatYearMonth(e.event_date)}
              </span>
              <span className="metric-number text-[11px] text-muted-foreground">
                {formatDay(e.event_date)}
              </span>
              <ImportanceDots level={e.importance} />
            </div>

            {/* Body */}
            <div className="px-5 py-5">
              <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
                  >
                    {TIMELINE_CATEGORY_LABEL[e.category]}
                  </Badge>
                  <span className="metric-number text-[10px] text-muted-foreground">
                    #{(idx + 1).toString().padStart(2, "0")}
                  </span>
                </div>
                <Link
                  href={`/timeline/${e.slug}`}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-accent transition-colors"
                  aria-label="開く"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <Link href={`/timeline/${e.slug}`} className="block">
                <h3 className="text-base font-semibold text-foreground group-hover:text-accent leading-snug mb-1.5">
                  {e.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                  <ReviewMarkedText>{e.summary}</ReviewMarkedText>
                </p>
              </Link>

              <div className="flex items-center gap-3 flex-wrap label-mono text-muted-foreground">
                {e.affected_entity_slugs.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-muted-foreground/60">affects</span>
                    {e.affected_entity_slugs.map((slug) => (
                      <Link
                        key={slug}
                        href={`/entities/${slug}`}
                        className="inline-flex items-center rounded border border-border bg-background px-1.5 py-0.5 text-[10.5px] tracking-normal text-foreground/85 hover:border-accent/50 hover:text-accent transition-colors normal-case"
                      >
                        {entityNameMap[slug] ?? slug}
                      </Link>
                    ))}
                  </div>
                )}
                {e.source_urls.length > 0 && (
                  <a
                    href={e.source_urls[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-accent hover:underline normal-case"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {e.source_urls[0].label}
                  </a>
                )}
              </div>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function ImportanceDots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5 mt-1" aria-label={`importance ${level}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={
            i <= level
              ? "h-1.5 w-1.5 rounded-full bg-accent"
              : "h-1.5 w-1.5 rounded-full bg-muted-foreground/20"
          }
        />
      ))}
    </div>
  );
}

function formatYearMonth(date: string): string {
  // "2026-04-01" → "2026.04"
  const [y, m] = date.split("-");
  return `${y}.${m}`;
}

function formatDay(date: string): string {
  // "2026-04-01" → "Day 01"
  const parts = date.split("-");
  return `Day ${parts[2] ?? "00"}`;
}
