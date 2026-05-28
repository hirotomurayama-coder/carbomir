"use client";

import * as React from "react";
import { ZoomIn, ZoomOut, CalendarRange } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { TimelineEvent } from "@/lib/types";
import { TIMELINE_CATEGORY_LABEL } from "@/lib/types";
import {
  type EventStatus,
  type RangeMode,
  LANES,
  NOW_BAND_HEIGHT,
  LANE_HEIGHT,
  AXIS_HEIGHT,
  LANE_LABEL_WIDTH,
  CANVAS_MIN_WIDTH,
  STATUS_BAR_BG,
  STATUS_LABEL_COLOR,
  STATUS_LABEL_JA,
} from "./timeline-bars/constants";
import { rangeFor, yearTicksFor, isPeriodEvent } from "./timeline-bars/layout";
import { PeriodBars } from "./timeline-bars/period-bars";
import { PointEvents } from "./timeline-bars/point-events";

/**
 * 水平タイムライン可視化 (バー型 + 範囲切替 + status 色分け).
 *
 * 表現は 2 種類:
 *   - 点イベント (event_end_date なし): 縦バー + ラベル + 重要度サイズ.
 *   - 期間イベント (event_end_date あり): 横バー (薄い背景帯) として最下層に
 *     描画し、その上に点イベントを重ねる. 例: GX-ETS 第1フェーズ試行期間、
 *     EU CBAM 移行期間。
 *
 * 定数・型・配色は ./timeline-bars/constants、レイアウト計算は
 * ./timeline-bars/layout、バー描画は period-bars / point-events に分離。
 * 本ファイルは toolbar + canvas フレーム (lane ラベル / グリッド / NOW マーカー /
 * 年軸) + legend の骨組みを持つ。
 */

type Props = {
  events: TimelineEvent[];
  /** 表示用の今日 (テスト容易性のため props にできる). 未指定なら new Date() */
  today?: Date;
  /** デフォルト範囲モード */
  defaultRange?: RangeMode;
};

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
      const t = new Date(e.event_date).getTime();
      if (isPeriodEvent(e)) {
        const tEnd = new Date(e.event_end_date!).getTime();
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

            {/* Period bars (z-[1], lane の下部 1/3 に薄い背景帯で描画) */}
            <PeriodBars
              periodEvents={periodEvents}
              min={min}
              totalSpanMs={totalSpanMs}
              today={today}
            />

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

            {/* Point events as bars/notches (z-[5], lane の上部 2/3 に縦バー描画) */}
            <PointEvents
              pointEvents={pointEvents}
              min={min}
              totalSpanMs={totalSpanMs}
              today={today}
            />
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
