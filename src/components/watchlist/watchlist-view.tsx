"use client";

import * as React from "react";
import Link from "next/link";
import { Star, Radar, CalendarClock, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TIMELINE_CATEGORY_LABEL, type EntityType, type PolicyStatus } from "@/lib/types";
import {
  parseMilestone,
  splitTimelineByDate,
  type DurabilityTimelineRef,
} from "@/lib/durability";
import { useWatchlist } from "@/components/watchlist/watchlist-provider";

export type EntityWatchEntry = {
  label: string;
  type: EntityType;
  nextMilestone?: string;
  policyStatus?: PolicyStatus;
  timeline: DurabilityTimelineRef[];
};

export type MatrixWatchEntry = {
  label: string;
  timeline: DurabilityTimelineRef[];
};

type Props = {
  entityIndex: Record<string, EntityWatchEntry>;
  matrixIndex: Record<string, MatrixWatchEntry>;
  today: string;
};

type FeedItem = DurabilityTimelineRef & { sources: string[] };

function mergeFeed(timelines: { label: string; refs: DurabilityTimelineRef[] }[]): FeedItem[] {
  const byEvent = new Map<string, FeedItem>();
  for (const { label, refs } of timelines) {
    for (const r of refs) {
      const existing = byEvent.get(r.slug);
      if (existing) {
        if (!existing.sources.includes(label)) existing.sources.push(label);
      } else {
        byEvent.set(r.slug, { ...r, sources: [label] });
      }
    }
  }
  return [...byEvent.values()];
}

function SourceChips({ sources }: { sources: string[] }) {
  const shown = sources.slice(0, 2);
  const rest = sources.length - shown.length;
  return (
    <span className="inline-flex flex-wrap gap-1 align-middle">
      {shown.map((s) => (
        <span
          key={s}
          className="inline-flex items-center rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground"
        >
          {s}
        </span>
      ))}
      {rest > 0 && (
        <span className="text-[10px] text-muted-foreground">+{rest}</span>
      )}
    </span>
  );
}

function FeedRow({ item, dim }: { item: FeedItem; dim?: boolean }) {
  return (
    <li>
      <Link
        href={`/timeline/${item.slug}`}
        className="group flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-4 px-4 py-3 hover:bg-muted/30 transition-colors"
      >
        <span
          className={`metric-number text-[11px] shrink-0 sm:min-w-[150px] ${dim ? "text-muted-foreground" : "text-accent"}`}
        >
          {item.event_date} · {TIMELINE_CATEGORY_LABEL[item.category]}
        </span>
        <span className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground group-hover:text-accent block leading-snug mb-1">
            {item.title}
          </span>
          <SourceChips sources={item.sources} />
        </span>
      </Link>
    </li>
  );
}

export function WatchlistView({ entityIndex, matrixIndex, today }: Props) {
  const { items, mounted, remove } = useWatchlist();

  if (!mounted) {
    return (
      <div className="px-6 sm:px-8 py-8 max-w-[1100px] mx-auto">
        <p className="label-mono text-muted-foreground">読み込み中…</p>
      </div>
    );
  }

  // フォロー中項目を index と突き合わせ (削除済みコンテンツは label で graceful 表示)
  const resolved = items.map((it) => {
    const entry =
      it.kind === "entity" ? entityIndex[it.slug] : matrixIndex[it.slug];
    return { item: it, entry };
  });

  const feed = mergeFeed(
    resolved
      .filter((r) => r.entry)
      .map((r) => ({ label: r.item.label, refs: r.entry!.timeline }))
  );
  const { upcoming, recent } = splitTimelineByDate(feed, today);
  const recentShown = recent.slice(0, 12);

  const milestones = resolved
    .filter((r) => r.item.kind === "entity" && (r.entry as EntityWatchEntry)?.nextMilestone)
    .map((r) => ({
      slug: r.item.slug,
      label: r.item.label,
      milestone: parseMilestone((r.entry as EntityWatchEntry).nextMilestone!),
    }));

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1100px] mx-auto">
      <header className="mb-8 pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Star className="h-4 w-4 text-amber-500 fill-current" aria-hidden />
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            ウォッチリスト
          </h1>
          {items.length > 0 && (
            <Badge variant="secondary" className="font-mono text-[10px] tracking-wider">
              {items.length}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          フォロー中の規制・手法・比較に効く変化を集約する。前提が動いたら、見出しになる前にここで気づく。
        </p>
      </header>

      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-8">
          {/* 予定された変化 (next_milestone) */}
          {milestones.length > 0 && (
            <section>
              <p className="label-mono text-muted-foreground mb-3 flex items-center gap-1.5">
                <CalendarClock className="h-3.5 w-3.5" aria-hidden /> 予定された節目
              </p>
              <ul className="space-y-2">
                {milestones.map((m) => (
                  <li key={m.slug}>
                    <Link
                      href={`/entities/${m.slug}`}
                      className="group flex items-baseline gap-3 rounded-md border border-border px-4 py-2.5 hover:border-accent/40 transition-colors"
                    >
                      {m.milestone.dateLabel && (
                        <span className="metric-number text-[11px] text-accent shrink-0 min-w-[90px]">
                          {m.milestone.dateLabel}
                        </span>
                      )}
                      <span className="flex-1 min-w-0">
                        <span className="text-sm text-foreground/90 leading-snug block">
                          {m.milestone.content}
                        </span>
                        <span className="label-mono text-muted-foreground group-hover:text-accent">
                          {m.label}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* 最近の変化 (timeline 集約) */}
          <section>
            <p className="label-mono text-muted-foreground mb-3 flex items-center gap-1.5">
              <Radar className="h-3.5 w-3.5 text-accent" aria-hidden /> ウォッチ中の変化
            </p>
            {feed.length === 0 ? (
              <p className="text-sm text-muted-foreground rounded-md border border-border px-4 py-3">
                フォロー中の項目に紐づく時系列イベントはまだありません。
              </p>
            ) : (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  {upcoming.length > 0 && (
                    <div>
                      <p className="label-mono text-accent px-4 pt-3 pb-1">予定</p>
                      <ul className="divide-y divide-border">
                        {upcoming.map((item) => (
                          <FeedRow key={item.slug} item={item} />
                        ))}
                      </ul>
                    </div>
                  )}
                  {recentShown.length > 0 && (
                    <div>
                      <p className="label-mono text-muted-foreground px-4 pt-3 pb-1 border-t border-border">
                        直近
                      </p>
                      <ul className="divide-y divide-border">
                        {recentShown.map((item) => (
                          <FeedRow key={item.slug} item={item} dim />
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </section>

          {/* ウォッチ中の項目 */}
          <section>
            <p className="label-mono text-muted-foreground mb-3">ウォッチ中の項目</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {resolved.map(({ item, entry }) => (
                <li
                  key={`${item.kind}:${item.slug}`}
                  className="flex items-center gap-2 rounded-md border border-border px-3 py-2.5"
                >
                  <Badge
                    variant="outline"
                    className="font-mono text-[9px] tracking-wider uppercase shrink-0"
                  >
                    {item.kind === "entity" ? "用語" : "比較"}
                  </Badge>
                  <Link
                    href={
                      item.kind === "entity"
                        ? `/entities/${item.slug}`
                        : `/matrices/${item.slug}`
                    }
                    className="flex-1 min-w-0 text-sm text-foreground hover:text-accent truncate"
                  >
                    {entry?.label ?? item.label}
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(item.kind, item.slug)}
                    aria-label={`${item.label} をウォッチ解除`}
                    className="shrink-0 text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <Star className="h-8 w-8 text-muted-foreground/40 mx-auto mb-4" aria-hidden />
      <p className="text-sm text-foreground/80 mb-2 font-medium">
        まだ何もウォッチしていません
      </p>
      <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed mb-6">
        用語集・政策規制・比較行列の詳細ページで「ウォッチ」を押すと、その前提に効く
        規制変更・手法改訂をここで追えます。
      </p>
      <div className="flex items-center justify-center gap-3 flex-wrap label-mono">
        <Link href="/policies" className="text-accent hover:underline">
          政策・規制を見る →
        </Link>
        <Link href="/entities" className="text-accent hover:underline">
          用語集を見る →
        </Link>
        <Link href="/matrices" className="text-accent hover:underline">
          比較行列を見る →
        </Link>
      </div>
    </div>
  );
}
