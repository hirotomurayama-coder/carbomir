"use client";

import * as React from "react";
import Link from "next/link";
import type { TimelineEvent } from "@/lib/types";
import {
  LANES,
  NOW_BAND_HEIGHT,
  LANE_HEIGHT,
  POINT_AREA_HEIGHT,
  PERIOD_AREA_HEIGHT,
  PERIOD_STAGGER_TIERS,
  STATUS_PERIOD_BG,
  STATUS_PERIOD_BORDER,
  STATUS_LABEL_COLOR,
} from "./constants";
import { dateToTime, classifyPeriodStatus, computePeriodTiers } from "./layout";
import { PeriodHoverCard } from "./hover-cards";

/**
 * 期間イベント (event_end_date あり) の横バー描画.
 * lane の下部 1/3 に薄い背景帯 (z-[1]) として置き、点イベントの下層になる.
 * 同一レーンで X が重なる期間は PERIOD_STAGGER_TIERS 段に振り分けて分離.
 */
export function PeriodBars({
  periodEvents,
  min,
  totalSpanMs,
  today,
}: {
  periodEvents: TimelineEvent[];
  min: Date;
  totalSpanMs: number;
  today: Date;
}) {
  const periodTiers = React.useMemo(
    () => computePeriodTiers(periodEvents, min, totalSpanMs),
    [periodEvents, min, totalSpanMs]
  );

  const periodTierHeight =
    (PERIOD_AREA_HEIGHT - 8 - (PERIOD_STAGGER_TIERS - 1) * 2) /
    PERIOD_STAGGER_TIERS;

  return (
    <>
      {periodEvents.map((e) => {
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
      })}
    </>
  );
}
