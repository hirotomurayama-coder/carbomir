"use client";

import * as React from "react";
import Link from "next/link";
import { Star, Radar, CalendarClock, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TIMELINE_CATEGORY_LABEL,
  POLICY_STATUS_LABEL,
  type EntityType,
  type PolicyStatus,
} from "@/lib/types";
import {
  parseMilestone,
  splitTimelineByDate,
  type DurabilityTimelineRef,
} from "@/lib/durability";
import {
  isNewSinceVisit,
  isImminent,
  WATCHLIST_LASTVISIT_KEY,
} from "@/lib/watchlist";
import { useWatchlist } from "@/components/watchlist/watchlist-provider";

// 不安定 / 変化ありの制度ステータス (監視で警告を出す対象)
const UNSTABLE_STATUS: PolicyStatus[] = ["transition", "pilot", "draft"];
const CHANGED_STATUS: PolicyStatus[] = ["discontinued", "stayed"];

function statusKind(s?: PolicyStatus): "unstable" | "changed" | null {
  if (!s) return null;
  if (UNSTABLE_STATUS.includes(s)) return "unstable";
  if (CHANGED_STATUS.includes(s)) return "changed";
  return null;
}

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

function NewBadge() {
  return (
    <span className="inline-flex items-center rounded-sm border border-emerald-500/40 bg-emerald-500/10 px-1.5 py-0 text-[9px] font-mono tracking-wider uppercase text-emerald-700 dark:text-emerald-300 align-middle">
      New
    </span>
  );
}

function FeedRow({
  item,
  dim,
  isNew,
}: {
  item: FeedItem;
  dim?: boolean;
  isNew?: boolean;
}) {
  return (
    <li>
      <Link
        href={`/timeline/${item.slug}`}
        className={`group flex flex-col gap-1 sm:flex-row sm:items-start sm:gap-4 px-4 py-3 transition-colors ${isNew ? "bg-emerald-500/[0.04] hover:bg-emerald-500/[0.08]" : "hover:bg-muted/30"}`}
      >
        <span
          className={`metric-number text-[11px] shrink-0 sm:min-w-[150px] ${dim && !isNew ? "text-muted-foreground" : "text-accent"}`}
        >
          {item.event_date} · {TIMELINE_CATEGORY_LABEL[item.category]}
        </span>
        <span className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground group-hover:text-accent leading-snug mb-1 flex items-center gap-1.5 flex-wrap">
            {isNew && <NewBadge />}
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

  // 前回ウォッチリストを開いた日。マウント時に読み出し、その場で today に更新する。
  // (グローバル provider ではなくこのページ単位で記録 = 「前回ここを見た時」の意味を保つ)
  const [lastVisit, setLastVisit] = React.useState<string | null>(null);
  React.useEffect(() => {
    setLastVisit(localStorage.getItem(WATCHLIST_LASTVISIT_KEY));
    localStorage.setItem(WATCHLIST_LASTVISIT_KEY, today);
  }, [today]);

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

  // 前回チェック以降に起きたイベント (NEW)
  const newCount = recent.filter((e) =>
    isNewSinceVisit(e.event_date, lastVisit, today)
  ).length;

  const milestones = resolved
    .filter((r) => r.item.kind === "entity" && (r.entry as EntityWatchEntry)?.nextMilestone)
    .map((r) => {
      const m = parseMilestone((r.entry as EntityWatchEntry).nextMilestone!);
      return {
        slug: r.item.slug,
        label: r.item.label,
        milestone: m,
        imminent: m.dateLabel ? isImminent(m.dateLabel, today) : false,
      };
    });

  // 不安定な制度ステータスを持つウォッチ中 entity (要注視)
  const statusAlerts = resolved
    .filter((r) => r.item.kind === "entity")
    .map((r) => ({
      slug: r.item.slug,
      label: r.item.label,
      status: (r.entry as EntityWatchEntry)?.policyStatus,
      kind: statusKind((r.entry as EntityWatchEntry)?.policyStatus),
    }))
    .filter((x) => x.kind);

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
          {newCount > 0 && (
            <Badge className="font-mono text-[10px] tracking-wider border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
              前回チェック以降 {newCount} 件
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
                      className={`group flex items-baseline gap-3 rounded-md border px-4 py-2.5 transition-colors ${m.imminent ? "border-amber-500/40 bg-amber-500/[0.06] hover:border-amber-500/60" : "border-border hover:border-accent/40"}`}
                    >
                      {m.milestone.dateLabel && (
                        <span
                          className={`metric-number text-[11px] shrink-0 min-w-[90px] ${m.imminent ? "text-amber-600 dark:text-amber-400" : "text-accent"}`}
                        >
                          {m.milestone.dateLabel}
                        </span>
                      )}
                      <span className="flex-1 min-w-0">
                        <span className="text-sm text-foreground/90 leading-snug block">
                          {m.imminent && (
                            <span className="inline-flex items-center rounded-sm border border-amber-500/40 bg-amber-500/10 px-1.5 py-0 text-[9px] font-mono tracking-wider uppercase text-amber-700 dark:text-amber-300 mr-1.5 align-middle">
                              まもなく
                            </span>
                          )}
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

          {/* 制度ステータス警告 (不安定/変化あり) */}
          {statusAlerts.length > 0 && (
            <section>
              <p className="label-mono text-muted-foreground mb-3">要注視のステータス</p>
              <ul className="space-y-2">
                {statusAlerts.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/entities/${a.slug}`}
                      className={`group flex items-center gap-3 rounded-md border px-4 py-2.5 transition-colors ${a.kind === "changed" ? "border-red-500/35 bg-red-500/[0.05] hover:border-red-500/55" : "border-amber-500/35 bg-amber-500/[0.05] hover:border-amber-500/55"}`}
                    >
                      <span
                        className={`inline-flex items-center rounded-sm border px-1.5 py-0.5 text-[10px] font-mono tracking-wider shrink-0 ${a.kind === "changed" ? "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300" : "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"}`}
                      >
                        {POLICY_STATUS_LABEL[a.status!]}
                      </span>
                      <span className="flex-1 min-w-0 text-sm text-foreground/90 group-hover:text-accent truncate">
                        {a.label}
                      </span>
                      <span className="label-mono text-muted-foreground shrink-0">
                        {a.kind === "changed" ? "効力に変化" : "細目が動く可能性"}
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
                          <FeedRow
                            key={item.slug}
                            item={item}
                            dim
                            isNew={isNewSinceVisit(item.event_date, lastVisit, today)}
                          />
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
