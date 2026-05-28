import type { TimelineEvent } from "@/lib/types";
import {
  type EventStatus,
  type RangeMode,
  LANES,
  PERIOD_STAGGER_TIERS,
  STAGGER_TIERS,
  LABEL_MAX_CHARS,
  LABEL_CHAR_PX,
  LABEL_PADDING_PX,
  CANVAS_MIN_WIDTH,
  COLLISION_PAD_PCT,
} from "./constants";

/**
 * TimelineBars の純粋なレイアウト計算ロジック.
 *
 * - 日付/ステータス判定
 * - 表示範囲・年目盛り
 * - 期間バー / 点イベントの tier 割り当て (衝突回避配置)
 *
 * すべて副作用なしの純粋関数で、レンダリングコンポーネントから呼び出される.
 */

export function dateToTime(dateStr: string): number {
  return new Date(dateStr).getTime();
}

export function classifyStatus(dateStr: string, today: Date): EventStatus {
  const t = dateToTime(dateStr);
  const now = today.getTime();
  const days = (t - now) / (1000 * 60 * 60 * 24);
  if (days < -180) return "completed";
  if (days < 90) return "ongoing";
  if (days < 365 * 3) return "scheduled";
  return "distant";
}

/** 期間イベントの status: 今日が範囲内なら ongoing, 過ぎていれば completed, 未来なら scheduled/distant */
export function classifyPeriodStatus(
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

export function rangeFor(today: Date, mode: RangeMode): { min: Date; max: Date } {
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

export function yearTicksFor(min: Date, max: Date): number[] {
  const startY = min.getFullYear();
  const endY = max.getFullYear();
  const ticks: number[] = [];
  for (let y = startY; y <= endY; y++) ticks.push(y);
  return ticks;
}

/** 「event_end_date が有効な期間」を持つかどうか */
export function isPeriodEvent(e: TimelineEvent): boolean {
  if (!e.event_end_date) return false;
  return dateToTime(e.event_end_date) > dateToTime(e.event_date);
}

/**
 * 期間バーの tier (縦オフセット段) を割り当てる.
 * 同一レーン内で X が重なる期間は PERIOD_STAGGER_TIERS 段に振り分けて分離する.
 * 戻り値: slug → tier index.
 */
export function computePeriodTiers(
  periodEvents: TimelineEvent[],
  min: Date,
  totalSpanMs: number
): Map<string, number> {
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
        ((dateToTime(e.event_date) - min.getTime()) / totalSpanMs) * 100;
      const ePct =
        ((dateToTime(e.event_end_date!) - min.getTime()) / totalSpanMs) * 100;
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
  return periodTiers;
}

export type PointPlacement = { tier: number; hideLabel: boolean };

/**
 * 点イベントの tier + ラベル可視判定を計算する.
 * Lane 内で重要度降順 + 日付昇順に並べ、各 tier の右端位置を追跡して
 * 衝突しない最初の tier に貪欲配置する. どの tier にも入らない場合は
 * 最も空いている tier にバーだけ置き、ラベルは hover でのみ表示 (hideLabel).
 * 戻り値: slug → { tier, hideLabel }.
 */
export function computePointPlacement(
  pointEvents: TimelineEvent[],
  min: Date,
  totalSpanMs: number
): Map<string, PointPlacement> {
  const placement = new Map<string, PointPlacement>();

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
      const labelWidthPx = labelLen * LABEL_CHAR_PX + LABEL_PADDING_PX;
      const labelWidthPct = (labelWidthPx / CANVAS_MIN_WIDTH) * 100;

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
  return placement;
}
