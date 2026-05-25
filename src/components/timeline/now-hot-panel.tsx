"use client";

import Link from "next/link";
import { Flame, ArrowUpRight, Clock4 } from "lucide-react";
import type { TimelineEvent } from "@/lib/types";
import { TIMELINE_CATEGORY_LABEL } from "@/lib/types";

/**
 * 「今ホット」パネル. 現在 -90日 〜 +180日 内のイベントを
 * 重要度順に最大 6 件カードで横並び表示する.
 *
 * Persona A の "規制キャッチアップ" シナリオで、今この瞬間に何が動いているかを
 * 一目で示すための主モジュール.
 */

type Props = {
  events: TimelineEvent[];
  /** 今日を props 化 (テスト容易性) */
  today?: Date;
};

type HotEvent = TimelineEvent & {
  _daysFromNow: number;
  _statusLabel: string;
  _statusColor: string;
};

function selectHotEvents(events: TimelineEvent[], today: Date, limit = 6): HotEvent[] {
  const now = today.getTime();
  const lo = -90;
  const hi = 365 * 1.5; // 1.5 年先まで
  const candidates: HotEvent[] = [];
  for (const e of events) {
    const t = new Date(e.event_date).getTime();
    const days = Math.floor((t - now) / (1000 * 60 * 60 * 24));
    if (days < lo || days > hi) continue;
    let statusLabel = "";
    let statusColor = "";
    if (days < 0) {
      statusLabel = `${Math.abs(days)} 日前 / 進行中`;
      statusColor = "text-emerald-600 dark:text-emerald-300 border-emerald-500/40 bg-emerald-500/10";
    } else if (days < 30) {
      statusLabel = days === 0 ? "今日" : `${days} 日後`;
      statusColor = "text-emerald-700 dark:text-emerald-300 border-emerald-500/50 bg-emerald-500/15";
    } else if (days < 180) {
      statusLabel = `${Math.floor(days / 30)} ヶ月後`;
      statusColor = "text-sky-700 dark:text-sky-300 border-sky-500/40 bg-sky-500/10";
    } else {
      const months = Math.floor(days / 30);
      statusLabel = `${months} ヶ月後`;
      statusColor = "text-violet-700 dark:text-violet-300 border-violet-500/40 bg-violet-500/10";
    }
    candidates.push({
      ...e,
      _daysFromNow: days,
      _statusLabel: statusLabel,
      _statusColor: statusColor,
    });
  }

  // ソート: 未来優先、重要度高い順、距離が近い順
  candidates.sort((a, b) => {
    // 未来 (days >= 0) を先頭に
    const aFuture = a._daysFromNow >= 0 ? 0 : 1;
    const bFuture = b._daysFromNow >= 0 ? 0 : 1;
    if (aFuture !== bFuture) return aFuture - bFuture;
    // 重要度高い順
    if (a.importance !== b.importance) return b.importance - a.importance;
    // 近い順
    return Math.abs(a._daysFromNow) - Math.abs(b._daysFromNow);
  });

  return candidates.slice(0, limit);
}

export function NowHotPanel({ events, today: todayProp }: Props) {
  const today = todayProp ?? new Date();
  const hot = selectHotEvents(events, today);

  if (hot.length === 0) {
    return null;
  }

  return (
    <section className="space-y-2.5">
      <div className="flex items-baseline justify-between gap-3 flex-wrap px-1">
        <div className="flex items-center gap-2">
          <Flame className="h-4 w-4 text-amber-500" />
          <h2 className="label-mono text-foreground">今ホット</h2>
          <span className="metric-number text-[10px] text-muted-foreground">
            {hot.length.toString().padStart(2, "0")}
          </span>
        </div>
        <span className="label-mono text-muted-foreground text-[10px]">
          直近 90 日 〜 18 ヶ月先の重要イベント
        </span>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {hot.map((e) => (
          <Link
            key={e.slug}
            href={`/timeline/${e.slug}`}
            className="group rounded-lg border border-border bg-card p-3.5 hover:border-accent/60 hover:shadow-[0_4px_20px_-8px_rgba(14,165,233,0.2)] transition-all"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 rounded border px-1.5 py-0 text-[10px] leading-[16px] font-mono ${e._statusColor}`}
                >
                  <Clock4 className="h-2.5 w-2.5" />
                  {e._statusLabel}
                </span>
                <span className="inline-flex items-center rounded border border-border bg-muted/40 px-1.5 py-0 text-[10px] leading-[16px] text-foreground/80">
                  {TIMELINE_CATEGORY_LABEL[e.category]}
                </span>
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-accent transition-colors shrink-0" />
            </div>
            <p className="metric-number text-[10.5px] text-muted-foreground mb-1">
              {e.event_date}
            </p>
            <h3 className="text-[13.5px] font-semibold text-foreground group-hover:text-accent leading-snug mb-1.5">
              {e.title}
            </h3>
            <p className="text-[11.5px] text-muted-foreground leading-relaxed line-clamp-2">
              {e.summary}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
