"use client";

import * as React from "react";
import Link from "next/link";
import type { TimelineCategory, TimelineEvent } from "@/lib/types";
import { TIMELINE_CATEGORY_LABEL } from "@/lib/types";

/**
 * 水平タイムライン可視化。
 * 4 カテゴリレーンに沿ってイベントを年軸上に配置する。
 * 構造化された時系列データをひと目で俯瞰するための主可視化。
 */

type Props = {
  events: TimelineEvent[];
};

const LANES: TimelineCategory[] = [
  "regulatory",
  "market",
  "technology",
  "methodology",
];

const LANE_HEIGHT = 56;
const AXIS_HEIGHT = 36;
const LANE_LABEL_WIDTH = 110;
const HOVER_CARD_WIDTH = 280;

const CATEGORY_BG: Record<TimelineCategory, string> = {
  regulatory: "bg-sky-500",
  market: "bg-emerald-500",
  technology: "bg-violet-500",
  methodology: "bg-amber-500",
};

const CATEGORY_RING: Record<TimelineCategory, string> = {
  regulatory: "ring-sky-500/30 group-hover:ring-sky-500/60",
  market: "ring-emerald-500/30 group-hover:ring-emerald-500/60",
  technology: "ring-violet-500/30 group-hover:ring-violet-500/60",
  methodology: "ring-amber-500/30 group-hover:ring-amber-500/60",
};

/** date "2024-05-08" → 2024.349 (year fractional) */
function dateToYear(dateStr: string): number {
  const [y, m = "1", d = "1"] = dateStr.split("-");
  const year = Number(y);
  const month = Number(m);
  const day = Number(d);
  // 月と日を年の小数として 0..1 に変換
  const fractionalMonth = (month - 1) / 12;
  const fractionalDay = day / 31 / 12;
  return year + fractionalMonth + fractionalDay;
}

function importanceSize(level: number): number {
  return 8 + level * 2; // 1→10, 2→12, 3→14, 4→16, 5→18
}

export function TimelineCanvas({ events }: Props) {
  if (events.length === 0) return null;

  const years = events.map((e) => dateToYear(e.event_date));
  const minYear = Math.floor(Math.min(...years));
  const maxYear = Math.ceil(Math.max(...years) + 0.5);
  const range = Math.max(1, maxYear - minYear);

  // 5 年刻みのティック
  const tickStart = Math.floor(minYear / 5) * 5;
  const tickEnd = Math.ceil(maxYear / 5) * 5;
  const ticks: number[] = [];
  for (let y = tickStart; y <= tickEnd; y += 5) {
    if (y >= minYear && y <= maxYear) ticks.push(y);
  }
  // 最低でも最初と最後を入れる
  if (!ticks.includes(minYear)) ticks.unshift(minYear);
  if (!ticks.includes(maxYear)) ticks.push(maxYear);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <div
          className="flex relative"
          style={{ minHeight: LANE_HEIGHT * LANES.length + AXIS_HEIGHT }}
        >
          {/* Lane labels column */}
          <div
            className="shrink-0 border-r border-border bg-muted/30"
            style={{ width: LANE_LABEL_WIDTH }}
          >
            {LANES.map((cat) => (
              <div
                key={cat}
                className="flex items-center px-3 border-b border-border last:border-b-0"
                style={{ height: LANE_HEIGHT }}
              >
                <span className="label-mono text-foreground text-[10.5px]">
                  {TIMELINE_CATEGORY_LABEL[cat]}
                </span>
              </div>
            ))}
            <div
              className="flex items-end px-3 pb-1"
              style={{ height: AXIS_HEIGHT }}
            >
              <span className="label-mono text-muted-foreground/70 text-[10px]">
                year
              </span>
            </div>
          </div>

          {/* Canvas area */}
          <div className="relative flex-1 min-w-[640px]">
            {/* Lane background + dividers */}
            {LANES.map((cat, i) => (
              <div
                key={cat}
                className="absolute inset-x-0 border-b border-border last:border-b-0"
                style={{ top: i * LANE_HEIGHT, height: LANE_HEIGHT }}
              >
                {/* 中央のミドルライン */}
                <div className="absolute inset-x-0 top-1/2 h-px bg-border/40 -translate-y-1/2" />
              </div>
            ))}

            {/* Year ticks (axis) */}
            <div
              className="absolute inset-x-0 border-t border-border"
              style={{ top: LANE_HEIGHT * LANES.length, height: AXIS_HEIGHT }}
            >
              {ticks.map((y) => {
                const pct = ((y - minYear) / range) * 100;
                return (
                  <div
                    key={y}
                    className="absolute top-0 bottom-0 flex flex-col items-center pointer-events-none"
                    style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
                  >
                    <div className="w-px h-2 bg-border" />
                    <span className="metric-number text-[10px] text-muted-foreground mt-1">
                      {y}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Vertical gridlines extending into lanes (subtle) */}
            {ticks.map((y) => {
              const pct = ((y - minYear) / range) * 100;
              return (
                <div
                  key={y}
                  className="absolute top-0 w-px bg-border/30 pointer-events-none"
                  style={{
                    left: `${pct}%`,
                    height: LANE_HEIGHT * LANES.length,
                  }}
                />
              );
            })}

            {/* Event nodes (with hover preview) */}
            {events.map((e) => {
              const laneIdx = LANES.indexOf(e.category);
              if (laneIdx === -1) return null;
              const size = importanceSize(e.importance);
              const xYear = dateToYear(e.event_date);
              const xPct = ((xYear - minYear) / range) * 100;
              const centerY = laneIdx * LANE_HEIGHT + LANE_HEIGHT / 2;
              // 右端付近 (>70%) のドットはカードを左側に出す
              const placeLeft = xPct > 70;
              return (
                <div
                  key={e.slug}
                  className="group absolute"
                  style={{
                    top: centerY - size / 2,
                    left: `calc(${xPct}% - ${size / 2}px)`,
                    width: size,
                    height: size,
                  }}
                >
                  <Link
                    href={`/timeline/${e.slug}`}
                    aria-label={`${e.event_date} · ${e.title}`}
                    className="block w-full h-full"
                  >
                    <span
                      className={`block w-full h-full rounded-full ${
                        CATEGORY_BG[e.category]
                      } ring-2 ${CATEGORY_RING[e.category]} transition-all group-hover:scale-125`}
                    />
                  </Link>

                  {/* ホバープレビューカード */}
                  <div
                    className="pointer-events-none absolute opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-100 z-20"
                    style={{
                      top: -8,
                      [placeLeft ? "right" : "left"]: size + 8,
                      width: HOVER_CARD_WIDTH,
                    }}
                  >
                    <EventHoverCard event={e} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-border bg-muted/20 px-4 py-2 flex items-center gap-4 flex-wrap">
        {LANES.map((cat) => (
          <span
            key={cat}
            className="inline-flex items-center gap-1.5 label-mono text-muted-foreground"
          >
            <span
              className={`inline-block w-2.5 h-2.5 rounded-full ${CATEGORY_BG[cat]}`}
            />
            {TIMELINE_CATEGORY_LABEL[cat]}
          </span>
        ))}
        <span className="ml-auto label-mono text-muted-foreground/70">
          ノードサイズ = 重要度 (1→5) · ドット hover で詳細
        </span>
      </div>
    </div>
  );
}

/* ============================================================
 * Hover preview card — クリック前に何のイベントかが分かる
 * ============================================================ */

function EventHoverCard({ event }: { event: TimelineEvent }) {
  const dotColor = CATEGORY_BG[event.category];
  return (
    <div className="rounded-md border border-border bg-popover text-popover-foreground shadow-xl p-3.5 text-[12.5px] leading-relaxed">
      {/* Header: date + category + importance */}
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`inline-block w-2 h-2 rounded-full ${dotColor}`} />
        <span className="metric-number text-[10.5px] text-accent font-semibold">
          {event.event_date}
        </span>
        <span className="label-mono text-muted-foreground text-[10px]">
          {TIMELINE_CATEGORY_LABEL[event.category]}
        </span>
        <span className="ml-auto label-mono text-muted-foreground text-[10px]">
          {"★".repeat(event.importance)}
          <span className="opacity-30">{"★".repeat(5 - event.importance)}</span>
        </span>
      </div>

      {/* Title */}
      <p className="font-semibold text-foreground leading-snug mb-1.5">
        {event.title}
      </p>

      {/* Summary excerpt (truncated) */}
      <p className="text-foreground/80 leading-relaxed line-clamp-4 mb-2 text-[12px]">
        {event.summary}
      </p>

      {/* Footer: affected entities + click hint */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border label-mono text-muted-foreground">
        {event.affected_entity_slugs.length > 0 ? (
          <span>
            影響:{" "}
            <span className="metric-number text-foreground">
              {event.affected_entity_slugs.length}
            </span>{" "}
            エンティティ
          </span>
        ) : (
          <span>&nbsp;</span>
        )}
        <span className="text-accent">クリックで詳細 →</span>
      </div>
    </div>
  );
}
