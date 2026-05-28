"use client";

import * as React from "react";
import Link from "next/link";
import type { TimelineEvent } from "@/lib/types";
import {
  LANES,
  NOW_BAND_HEIGHT,
  LANE_HEIGHT,
  POINT_AREA_HEIGHT,
  MAX_BAR_HEIGHT,
  STAGGER_TIERS,
  LABEL_MAX_CHARS,
  STATUS_BAR_BG,
  STATUS_LABEL_COLOR,
  importanceBarHeight,
  importanceFontSize,
} from "./constants";
import { dateToTime, classifyStatus, computePointPlacement } from "./layout";
import { EventHoverCard } from "./hover-cards";

/**
 * 点イベント (event_end_date なし) の縦バー + ラベル描画.
 * Lane 内で重要度降順 + 日付昇順に並べ、衝突しない tier に貪欲配置する
 * (computePointPlacement)。どの tier にも入らない場合はラベルを hover でのみ表示.
 */
export function PointEvents({
  pointEvents,
  min,
  totalSpanMs,
  today,
}: {
  pointEvents: TimelineEvent[];
  min: Date;
  totalSpanMs: number;
  today: Date;
}) {
  const placement = React.useMemo(
    () => computePointPlacement(pointEvents, min, totalSpanMs),
    [pointEvents, min, totalSpanMs]
  );

  return (
    <>
      {pointEvents.map((e) => {
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
      })}
    </>
  );
}
