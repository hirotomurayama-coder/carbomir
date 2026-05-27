"use client";

import * as React from "react";
import Link from "next/link";
import {
  ZoomIn,
  ZoomOut,
  CalendarRange,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { TimelineCategory, TimelineEvent } from "@/lib/types";
import { TIMELINE_CATEGORY_LABEL } from "@/lib/types";

/**
 * 水平タイムライン可視化 (バー型 + 範囲切替 + status 色分け).
 *
 * 表現は 2 種類:
 *   - 点イベント (event_end_date なし): 縦バー + ラベル + 重要度サイズ.
 *   - 期間イベント (event_end_date あり): 横バー (薄い背景帯) として最下層に
 *     描画し、その上に点イベントを重ねる. 例: GX-ETS 第1フェーズ試行期間、
 *     EU CBAM 移行期間。
 *
 * レーン内レイアウト:
 *   - 上部 NOW バンド (NOW_BAND_HEIGHT): "今" バッジ専用の帯. これによりレーン
 *     内のラベルと NOW チップが縦に重なるのを避ける.
 *   - 上 2/3 (POINT_AREA_HEIGHT): 点イベントの縦バー + ラベル. STAGGER_TIERS
 *     段に貪欲配置.
 *   - 下 1/3 (PERIOD_AREA_HEIGHT): 期間イベントの横バー.
 */

type Props = {
  events: TimelineEvent[];
  /** 表示用の今日 (テスト容易性のため props にできる). 未指定なら new Date() */
  today?: Date;
  /** デフォルト範囲モード */
  defaultRange?: RangeMode;
};

type RangeMode = "near" | "mid" | "all";

type EventStatus = "completed" | "ongoing" | "scheduled" | "distant";

const LANES: TimelineCategory[] = [
  "regulatory",
  "market",
  "technology",
  "methodology",
];

const NOW_BAND_HEIGHT = 22;     // 上部 NOW チップ専用バンド
const LANE_HEIGHT = 140;
const POINT_AREA_HEIGHT = 88;   // レーン内 点イベント領域
const PERIOD_AREA_HEIGHT = 44;  // レーン内 期間バー領域 (LANE_HEIGHT - POINT_AREA - 8 margin)
const PERIOD_STAGGER_TIERS = 2; // 期間バーの縦オフセット段数 (重なる場合の分離用)
const MAX_BAR_HEIGHT = 32;      // importance 5 の縦バー高 (tier 配置の境界計算で使用)
const AXIS_HEIGHT = 40;
const LANE_LABEL_WIDTH = 100;
const STAGGER_TIERS = 4;        // 1 レーン内の縦オフセット段数. POINT_AREA 88
                                // とこの値で tier 間隔 ≒18.7px となり、ラベル
                                // 高 ~17px を確実に上回って文字被りを防ぐ.
const CANVAS_MIN_WIDTH = 1280;  // 描画領域の最小幅. 密集回避.
const LABEL_MAX_CHARS = 22;     // ラベル最大文字数
const LABEL_CHAR_PX = 7.5;      // 1 文字あたり概算 px (やや保守的に)
const LABEL_PADDING_PX = 36;    // bar + ドット + 余白 (28 → 36)
const COLLISION_PAD_PCT = 1.0;  // tier 内衝突判定の余白 % (0.5 → 1.0)

/** 重要度 → バー高さ */
function importanceBarHeight(level: number): number {
  return 12 + level * 4; // 1→16, 2→20, 3→24, 4→28, 5→32
}

/** 重要度 → ラベル font-size */
function importanceFontSize(level: number): string {
  if (level >= 5) return "text-[12px] font-semibold";
  if (level >= 4) return "text-[11.5px] font-semibold";
  if (level >= 3) return "text-[11px] font-medium";
  return "text-[10.5px]";
}

/** ステータス → 点イベントバー色 */
const STATUS_BAR_BG: Record<EventStatus, string> = {
  completed: "bg-muted-foreground/40",
  ongoing: "bg-emerald-500",
  scheduled: "bg-sky-500",
  distant: "bg-violet-400/50",
};

/** ステータス → 期間バー背景色 (薄め) */
const STATUS_PERIOD_BG: Record<EventStatus, string> = {
  completed: "bg-muted-foreground/15",
  ongoing: "bg-emerald-500/20",
  scheduled: "bg-sky-500/15",
  distant: "bg-violet-400/15",
};

/** ステータス → 期間バーボーダー色 */
const STATUS_PERIOD_BORDER: Record<EventStatus, string> = {
  completed: "border-muted-foreground/40",
  ongoing: "border-emerald-500/70",
  scheduled: "border-sky-500/60",
  distant: "border-violet-400/50",
};

const STATUS_LABEL_COLOR: Record<EventStatus, string> = {
  completed: "text-muted-foreground",
  ongoing: "text-emerald-700 dark:text-emerald-300",
  scheduled: "text-sky-700 dark:text-sky-300",
  distant: "text-violet-600 dark:text-violet-300",
};

const STATUS_LABEL_JA: Record<EventStatus, string> = {
  completed: "完了",
  ongoing: "進行中",
  scheduled: "予定",
  distant: "遠未来",
};

function dateToTime(dateStr: string): number {
  return new Date(dateStr).getTime();
}

function classifyStatus(dateStr: string, today: Date): EventStatus {
  const t = dateToTime(dateStr);
  const now = today.getTime();
  const days = (t - now) / (1000 * 60 * 60 * 24);
  if (days < -180) return "completed";
  if (days < 90) return "ongoing";
  if (days < 365 * 3) return "scheduled";
  return "distant";
}

/** 期間イベントの status: 今日が範囲内なら ongoing, 過ぎていれば completed, 未来なら scheduled/distant */
function classifyPeriodStatus(
  startStr: string,
  endStr: string,
  today: Date
): EventStatus {
  const start = dateToTime(startStr);
  const end = dateToTime(endStr);
  const now = today.getTime();
  if (now > end) return "completed";
  if (now >= start) return "ongoing";
  const startDays = (start - now) / (1000 * 60 * 60 * 24);
  return startDays < 365 * 3 ? "scheduled" : "distant";
}

function rangeFor(today: Date, mode: RangeMode): { min: Date; max: Date } {
  if (mode === "all") return { min: new Date("1995-01-01"), max: new Date("2030-12-31") };
  if (mode === "mid") {
    return {
      min: new Date(today.getFullYear() - 1, 0, 1),
      max: new Date(today.getFullYear() + 5, 11, 31),
    };
  }
  // near (default): 2 年前 〜 3 年後
  return {
    min: new Date(today.getFullYear() - 2, 0, 1),
    max: new Date(today.getFullYear() + 3, 11, 31),
  };
}

function yearTicksFor(min: Date, max: Date): number[] {
  const startY = min.getFullYear();
  const endY = max.getFullYear();
  const ticks: number[] = [];
  for (let y = startY; y <= endY; y++) ticks.push(y);
  return ticks;
}

/** 「event_end_date が有効な期間」を持つかどうか */
function isPeriodEvent(e: TimelineEvent): boolean {
  if (!e.event_end_date) return false;
  return dateToTime(e.event_end_date) > dateToTime(e.event_date);
}

export function TimelineBars({
  events,
  today: todayProp,
  defaultRange = "near",
}: Props) {
  const today = React.useMemo(() => todayProp ?? new Date(), [todayProp]);
  const [range, setRange] = React.useState<RangeMode>(defaultRange);

  const { min, max } = React.useMemo(() => rangeFor(today, range), [today, range]);

  // 表示範囲内のイベントだけに絞る (期間イベントは範囲とオーバーラップしていれば対象)
  const inRangeEvents = React.useMemo(() => {
    const minT = min.getTime();
    const maxT = max.getTime();
    return events.filter((e) => {
      const t = dateToTime(e.event_date);
      if (isPeriodEvent(e)) {
        const tEnd = dateToTime(e.event_end_date!);
        return t <= maxT && tEnd >= minT;
      }
      return t >= minT && t <= maxT;
    });
  }, [events, min, max]);

  const periodEvents = React.useMemo(
    () => inRangeEvents.filter(isPeriodEvent),
    [inRangeEvents]
  );
  const pointEvents = React.useMemo(
    () => inRangeEvents.filter((e) => !isPeriodEvent(e)),
    [inRangeEvents]
  );

  const totalSpanMs = max.getTime() - min.getTime();
  // 3 桁丸めで SSR/client 間の new Date() ジッタによる hydration 警告を回避.
  // 1280px 幅キャンバスで 0.001% = 約 0.013px、視覚上は無差別.
  const todayPct = Number(
    (((today.getTime() - min.getTime()) / totalSpanMs) * 100).toFixed(3)
  );
  const totalCanvasHeight =
    NOW_BAND_HEIGHT + LANE_HEIGHT * LANES.length + AXIS_HEIGHT;

  const ticks = React.useMemo(() => yearTicksFor(min, max), [min, max]);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border bg-muted/20">
        <div className="flex items-center gap-2">
          <CalendarRange className="h-3.5 w-3.5 text-accent" />
          <span className="label-mono text-foreground">表示範囲</span>
          <ToggleGroup
            type="single"
            value={range}
            onValueChange={(v) => v && setRange(v as RangeMode)}
            className="h-7"
          >
            <ToggleGroupItem value="near" className="h-7 px-2.5 text-[11px]">
              <ZoomIn className="h-3 w-3" /> 直近 (-2y / +3y)
            </ToggleGroupItem>
            <ToggleGroupItem value="mid" className="h-7 px-2.5 text-[11px]">
              近未来 (-1y / +5y)
            </ToggleGroupItem>
            <ToggleGroupItem value="all" className="h-7 px-2.5 text-[11px]">
              <ZoomOut className="h-3 w-3" /> 全期間
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        <div className="label-mono text-muted-foreground text-[10.5px]">
          <span className="metric-number text-foreground">
            {inRangeEvents.length.toString().padStart(2, "0")}
          </span>
          <span className="mx-1 opacity-50">/</span>
          <span className="metric-number">{events.length.toString().padStart(2, "0")}</span>
          <span className="ml-1">events in range</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="overflow-x-auto">
        <div
          className="flex relative"
          style={{ minHeight: totalCanvasHeight }}
        >
          {/* Lane labels */}
          <div
            className="shrink-0 border-r border-border bg-muted/20"
            style={{ width: LANE_LABEL_WIDTH }}
          >
            {/* NOW バンド分の上部スペーサー */}
            <div style={{ height: NOW_BAND_HEIGHT }} />
            {LANES.map((cat) => (
              <div
                key={cat}
                className="flex items-center px-3 border-t border-border"
                style={{ height: LANE_HEIGHT }}
              >
                <span className="label-mono text-foreground text-[10.5px]">
                  {TIMELINE_CATEGORY_LABEL[cat]}
                </span>
              </div>
            ))}
            <div
              className="flex items-end px-3 pb-1 border-t border-border"
              style={{ height: AXIS_HEIGHT }}
            >
              <span className="label-mono text-muted-foreground/70 text-[10px]">
                year
              </span>
            </div>
          </div>

          {/* Canvas area */}
          <div
            className="relative flex-1"
            style={{ minWidth: CANVAS_MIN_WIDTH }}
          >
            {/* Lane backgrounds (NOW バンド分下げる) */}
            {LANES.map((cat, i) => (
              <div
                key={cat}
                className="absolute inset-x-0 border-t border-border"
                style={{
                  top: NOW_BAND_HEIGHT + i * LANE_HEIGHT,
                  height: LANE_HEIGHT,
                }}
              />
            ))}

            {/* Vertical year gridlines */}
            {ticks.map((y) => {
              const yearStart = new Date(y, 0, 1).getTime();
              const pct = ((yearStart - min.getTime()) / totalSpanMs) * 100;
              if (pct < 0 || pct > 100) return null;
              return (
                <div
                  key={`grid-${y}`}
                  className="absolute w-px bg-border/40 pointer-events-none"
                  style={{
                    left: `${pct}%`,
                    top: NOW_BAND_HEIGHT,
                    height: LANE_HEIGHT * LANES.length,
                  }}
                />
              );
            })}

            {/* Period bars (z-[1], lane の下部 1/3 に薄い背景帯で描画).
                同一レーン内で X が重なる期間は PERIOD_STAGGER_TIERS 段に
                振り分けて視覚的に分離する. */}
            {(() => {
              // 期間バーの tier 割り当て
              type Range = { startPct: number; endPct: number };
              const periodTiers = new Map<string, number>();
              for (let laneIdx = 0; laneIdx < LANES.length; laneIdx++) {
                const cat = LANES[laneIdx];
                const laneItems = periodEvents
                  .filter((e) => e.category === cat)
                  .sort((a, b) => a.event_date.localeCompare(b.event_date));
                const tierRanges: Range[][] = Array.from(
                  { length: PERIOD_STAGGER_TIERS },
                  () => []
                );
                for (const e of laneItems) {
                  const sPct =
                    ((dateToTime(e.event_date) - min.getTime()) /
                      totalSpanMs) *
                    100;
                  const ePct =
                    ((dateToTime(e.event_end_date!) - min.getTime()) /
                      totalSpanMs) *
                    100;
                  let assigned = -1;
                  for (let t = 0; t < PERIOD_STAGGER_TIERS; t++) {
                    const overlap = tierRanges[t].some(
                      (r) => sPct < r.endPct && ePct > r.startPct
                    );
                    if (!overlap) {
                      assigned = t;
                      tierRanges[t].push({ startPct: sPct, endPct: ePct });
                      break;
                    }
                  }
                  // tier 不足時は最後の tier に置く (重なる)
                  periodTiers.set(
                    e.slug,
                    assigned >= 0 ? assigned : PERIOD_STAGGER_TIERS - 1
                  );
                }
              }

              const periodTierHeight =
                (PERIOD_AREA_HEIGHT - 8 - (PERIOD_STAGGER_TIERS - 1) * 2) /
                PERIOD_STAGGER_TIERS;

              return periodEvents.map((e) => {
              const laneIdx = LANES.indexOf(e.category);
              if (laneIdx === -1) return null;
              const startT = dateToTime(e.event_date);
              const endT = dateToTime(e.event_end_date!);
              const startPct = ((startT - min.getTime()) / totalSpanMs) * 100;
              const endPct = ((endT - min.getTime()) / totalSpanMs) * 100;
              const clampedStart = Math.max(0, startPct);
              const clampedEnd = Math.min(100, endPct);
              const widthPct = Math.max(0.3, clampedEnd - clampedStart);
              const status = classifyPeriodStatus(
                e.event_date,
                e.event_end_date!,
                today
              );
              const tier = periodTiers.get(e.slug) ?? 0;
              const top =
                NOW_BAND_HEIGHT +
                laneIdx * LANE_HEIGHT +
                4 +
                POINT_AREA_HEIGHT +
                4 +
                tier * (periodTierHeight + 2);
              const height = periodTierHeight;

              // 端で逆向きにラベルが出るかを考慮: clampedStart > 65 なら hover カードを左向きに
              const placeLeft = clampedStart > 65;

              return (
                <div
                  key={`period-${e.slug}`}
                  className="group absolute z-[1]"
                  style={{
                    left: `${clampedStart}%`,
                    width: `${widthPct}%`,
                    top,
                    height,
                  }}
                >
                  <Link
                    href={`/timeline/${e.slug}`}
                    aria-label={`${e.event_date} → ${e.event_end_date} · ${e.title}`}
                    className="block relative w-full h-full"
                  >
                    {/* 期間バー本体 */}
                    <div
                      className={`absolute inset-0 rounded ${STATUS_PERIOD_BG[status]} border-l-2 border-r-2 ${STATUS_PERIOD_BORDER[status]} transition group-hover:brightness-125`}
                    />
                    {/* タイトル ピル */}
                    <span
                      className={`absolute top-1/2 -translate-y-1/2 left-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10.5px] font-medium whitespace-nowrap pointer-events-none bg-background/85 backdrop-blur-sm ${STATUS_LABEL_COLOR[status]}`}
                      style={{ maxWidth: "calc(100% - 12px)" }}
                    >
                      <span className="opacity-60">▶</span>
                      <span className="truncate">{e.title}</span>
                    </span>
                  </Link>

                  {/* Hover card */}
                  <div
                    className={`pointer-events-none absolute opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-100 z-20 ${
                      placeLeft ? "right-0" : "left-0"
                    }`}
                    style={{
                      top: height + 8,
                      width: 320,
                    }}
                  >
                    <PeriodHoverCard event={e} status={status} />
                  </div>
                </div>
              );
              });
            })()}

            {/* "Today" marker (vertical line + label, NOW バンド内にバッジを配置) */}
            {todayPct >= 0 && todayPct <= 100 && (
              <>
                <div
                  className="absolute top-0 w-0.5 bg-accent/70 pointer-events-none z-10"
                  style={{
                    left: `${todayPct}%`,
                    height: totalCanvasHeight,
                  }}
                />
                <div
                  className="absolute pointer-events-none z-10 -translate-x-1/2"
                  style={{
                    left: `${todayPct}%`,
                    top: 4,
                  }}
                >
                  <span className="inline-block rounded bg-accent px-1.5 py-0.5 label-mono text-[9px] text-accent-foreground font-bold tracking-wider">
                    NOW
                  </span>
                </div>
              </>
            )}

            {/* Axis at bottom */}
            <div
              className="absolute inset-x-0 border-t border-border"
              style={{
                top: NOW_BAND_HEIGHT + LANE_HEIGHT * LANES.length,
                height: AXIS_HEIGHT,
              }}
            >
              {ticks.map((y) => {
                const yearStart = new Date(y, 0, 1).getTime();
                const pct = ((yearStart - min.getTime()) / totalSpanMs) * 100;
                if (pct < 0 || pct > 100) return null;
                const isCurrentYear = y === today.getFullYear();
                return (
                  <div
                    key={`tick-${y}`}
                    className="absolute top-0 bottom-0 flex flex-col items-center pointer-events-none"
                    style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
                  >
                    <div className="w-px h-2 bg-border" />
                    <span
                      className={`metric-number text-[10px] mt-1 ${
                        isCurrentYear
                          ? "text-accent font-semibold"
                          : "text-muted-foreground"
                      }`}
                    >
                      {y}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Point events as bars/notches.
                Lane 内で重要度降順 + 日付昇順に並べ、各 tier の右端位置を
                追跡して衝突しない最初の tier に貪欲に配置する.
                どの tier にも入らない場合はラベル非表示 (バーのみ表示)
                + ラベル CSS を hidden にして hover でのみ見せる. */}
            {(() => {
              type Placement = { tier: number; hideLabel: boolean };
              const placement = new Map<string, Placement>();

              // 衝突検出用: 各 tier の最後に置いた "label の右端 X (%)" を保持
              for (let laneIdx = 0; laneIdx < LANES.length; laneIdx++) {
                const cat = LANES[laneIdx];
                // 重要度高 → 低の順で配置 (高重要度を優先して可視 tier に置く)
                const laneEvents = pointEvents
                  .filter((e) => e.category === cat)
                  .sort((a, b) => {
                    if (b.importance !== a.importance) {
                      return b.importance - a.importance;
                    }
                    return a.event_date.localeCompare(b.event_date);
                  });

                const tierRightEdge = new Array(STAGGER_TIERS).fill(-Infinity);

                for (const e of laneEvents) {
                  const t = dateToTime(e.event_date);
                  const pct = ((t - min.getTime()) / totalSpanMs) * 100;
                  const labelLen = Math.min(e.title.length, LABEL_MAX_CHARS);
                  const labelWidthPx =
                    labelLen * LABEL_CHAR_PX + LABEL_PADDING_PX;
                  const labelWidthPct =
                    (labelWidthPx / CANVAS_MIN_WIDTH) * 100;

                  // 端で逆向きにラベルが出るかを考慮: pct > 75 なら左向き
                  const placeLeft = pct > 75;
                  const labelStart = placeLeft ? pct - labelWidthPct : pct;
                  const labelEnd = placeLeft ? pct : pct + labelWidthPct;

                  // 衝突しない最初の tier を探す
                  let assigned = -1;
                  for (let tier = 0; tier < STAGGER_TIERS; tier++) {
                    if (labelStart >= tierRightEdge[tier] + COLLISION_PAD_PCT) {
                      assigned = tier;
                      tierRightEdge[tier] = labelEnd;
                      break;
                    }
                  }
                  if (assigned >= 0) {
                    placement.set(e.slug, {
                      tier: assigned,
                      hideLabel: false,
                    });
                  } else {
                    // どこにも入らない: バーだけ最も空いている tier に置き、ラベル非表示
                    let mostDistantTier = 0;
                    let mostDistance = -Infinity;
                    for (let tier = 0; tier < STAGGER_TIERS; tier++) {
                      const d = labelStart - tierRightEdge[tier];
                      if (d > mostDistance) {
                        mostDistance = d;
                        mostDistantTier = tier;
                      }
                    }
                    placement.set(e.slug, {
                      tier: mostDistantTier,
                      hideLabel: true,
                    });
                  }
                }
              }

              return pointEvents.map((e) => {
                const laneIdx = LANES.indexOf(e.category);
                if (laneIdx === -1) return null;
                const t = dateToTime(e.event_date);
                const pct = ((t - min.getTime()) / totalSpanMs) * 100;
                const status = classifyStatus(e.event_date, today);
                const barHeight = importanceBarHeight(e.importance);
                const fontClass = importanceFontSize(e.importance);

                const p = placement.get(e.slug) ?? { tier: 0, hideLabel: false };
                // POINT_AREA 内に tier を均等分布. 端の tier の bar が
                // POINT_AREA をはみ出さないよう (H - max_bar) / (N - 1) で
                // 中心間距離を決定.
                const pointAreaCenter =
                  NOW_BAND_HEIGHT +
                  laneIdx * LANE_HEIGHT +
                  4 +
                  POINT_AREA_HEIGHT / 2;
                const tierSpacing =
                  (POINT_AREA_HEIGHT - MAX_BAR_HEIGHT) / (STAGGER_TIERS - 1);
                const tierOffset =
                  (p.tier - (STAGGER_TIERS - 1) / 2) * tierSpacing;
                const centerY = pointAreaCenter + tierOffset;

                const placeLeft = pct > 75;

                return (
                  <div
                    key={e.slug}
                    className="group absolute z-[5]"
                    style={{
                      left: `calc(${pct}% - 1.5px)`,
                      top: centerY - barHeight / 2,
                    }}
                  >
                    <Link
                      href={`/timeline/${e.slug}`}
                      aria-label={`${e.event_date} · ${e.title}`}
                      className="block relative"
                    >
                      {/* Bar (vertical) */}
                      <div
                        className={`w-[3px] rounded-sm ${STATUS_BAR_BG[status]} transition-all group-hover:w-[4px] group-hover:shadow-[0_0_8px_currentColor]`}
                        style={{ height: barHeight }}
                      />
                      {/* Label: 衝突回避できた場合のみ常時表示.
                          そうでなければ hover でだけ見えるようにする. */}
                      <span
                        className={`absolute top-1/2 -translate-y-1/2 ${
                          placeLeft ? "right-2.5" : "left-2.5"
                        } whitespace-nowrap ${fontClass} text-foreground/85 group-hover:text-accent transition-opacity ${
                          p.hideLabel
                            ? "opacity-0 group-hover:opacity-100 group-hover:z-20"
                            : "opacity-100"
                        }`}
                      >
                        <span className={`mr-1 ${STATUS_LABEL_COLOR[status]}`}>
                          ●
                        </span>
                        {e.title.length > LABEL_MAX_CHARS
                          ? e.title.slice(0, LABEL_MAX_CHARS - 1) + "…"
                          : e.title}
                      </span>
                    </Link>

                    {/* Hover card */}
                    <div
                      className={`pointer-events-none absolute opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-100 z-20 ${
                        placeLeft ? "right-3" : "left-3"
                      }`}
                      style={{
                        top: barHeight + 8,
                        width: 300,
                      }}
                    >
                      <EventHoverCard event={e} status={status} />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-border bg-muted/10 px-4 py-2 flex items-center gap-4 flex-wrap">
        <span className="label-mono text-muted-foreground text-[10px]">
          Status:
        </span>
        {(["completed", "ongoing", "scheduled", "distant"] as EventStatus[]).map(
          (s) => (
            <span
              key={s}
              className="inline-flex items-center gap-1.5 label-mono text-[10px]"
            >
              <span
                className={`inline-block w-2 h-3 rounded-sm ${STATUS_BAR_BG[s]}`}
              />
              <span className={STATUS_LABEL_COLOR[s]}>{STATUS_LABEL_JA[s]}</span>
            </span>
          )
        )}
        <span className="mx-2 h-3 w-px bg-border" />
        <span className="inline-flex items-center gap-1.5 label-mono text-[10px] text-muted-foreground">
          <span className="inline-block w-4 h-2 rounded-sm bg-emerald-500/20 border-l-2 border-r-2 border-emerald-500/70" />
          期間イベント (横バー)
        </span>
        <span className="ml-auto label-mono text-muted-foreground/70 text-[10px]">
          バー太さ = 重要度 · ホバーで詳細
        </span>
      </div>
    </div>
  );
}

/* ============================================================
 * Hover cards
 * ============================================================ */

function EventHoverCard({
  event,
  status,
}: {
  event: TimelineEvent;
  status: EventStatus;
}) {
  return (
    <div className="rounded-md border border-border bg-popover text-popover-foreground shadow-xl p-3.5 text-[12.5px] leading-relaxed">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="metric-number text-[10.5px] text-accent font-semibold">
          {event.event_date}
        </span>
        <span className="label-mono text-muted-foreground text-[10px]">
          {TIMELINE_CATEGORY_LABEL[event.category]}
        </span>
        <span
          className={`inline-flex items-center gap-1 label-mono text-[10px] ${STATUS_LABEL_COLOR[status]}`}
        >
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${STATUS_BAR_BG[status]}`} />
          {STATUS_LABEL_JA[status]}
        </span>
        <span className="ml-auto label-mono text-muted-foreground text-[10px]">
          {"★".repeat(event.importance)}
          <span className="opacity-30">{"★".repeat(5 - event.importance)}</span>
        </span>
      </div>

      <p className="font-semibold text-foreground leading-snug mb-1.5">
        {event.title}
      </p>

      <p className="text-foreground/80 leading-relaxed line-clamp-4 mb-2 text-[12px]">
        {event.summary}
      </p>

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

function PeriodHoverCard({
  event,
  status,
}: {
  event: TimelineEvent;
  status: EventStatus;
}) {
  return (
    <div className="rounded-md border border-border bg-popover text-popover-foreground shadow-xl p-3.5 text-[12.5px] leading-relaxed">
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <span className="metric-number text-[10.5px] text-accent font-semibold">
          {event.event_date}
        </span>
        <span className="text-muted-foreground/70 text-[10px]">→</span>
        <span className="metric-number text-[10.5px] text-accent font-semibold">
          {event.event_end_date}
        </span>
        <span className="label-mono text-muted-foreground text-[10px]">
          {TIMELINE_CATEGORY_LABEL[event.category]}
        </span>
        <span
          className={`inline-flex items-center gap-1 label-mono text-[10px] ${STATUS_LABEL_COLOR[status]}`}
        >
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full ${STATUS_BAR_BG[status]}`}
          />
          {STATUS_LABEL_JA[status]}
        </span>
      </div>

      <p className="font-semibold text-foreground leading-snug mb-1.5">
        {event.title}
      </p>

      <p className="text-foreground/80 leading-relaxed line-clamp-4 mb-2 text-[12px]">
        {event.summary}
      </p>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border label-mono text-muted-foreground">
        <span className="label-mono text-[10px] text-muted-foreground">
          期間イベント
        </span>
        <span className="text-accent">クリックで詳細 →</span>
      </div>
    </div>
  );
}
