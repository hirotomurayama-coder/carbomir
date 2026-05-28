import type { TimelineCategory } from "@/lib/types";

/**
 * 水平タイムライン可視化 (TimelineBars) の定数・型・配色マップ.
 *
 * レーン内レイアウト:
 *   - 上部 NOW バンド (NOW_BAND_HEIGHT): "今" バッジ専用の帯. これによりレーン
 *     内のラベルと NOW チップが縦に重なるのを避ける.
 *   - 上 2/3 (POINT_AREA_HEIGHT): 点イベントの縦バー + ラベル. STAGGER_TIERS
 *     段に貪欲配置.
 *   - 下 1/3 (PERIOD_AREA_HEIGHT): 期間イベントの横バー.
 */

export type RangeMode = "near" | "mid" | "all";

export type EventStatus = "completed" | "ongoing" | "scheduled" | "distant";

export const LANES: TimelineCategory[] = [
  "regulatory",
  "market",
  "technology",
  "methodology",
];

export const NOW_BAND_HEIGHT = 22;     // 上部 NOW チップ専用バンド
export const LANE_HEIGHT = 140;
export const POINT_AREA_HEIGHT = 88;   // レーン内 点イベント領域
export const PERIOD_AREA_HEIGHT = 44;  // レーン内 期間バー領域 (LANE_HEIGHT - POINT_AREA - 8 margin)
export const PERIOD_STAGGER_TIERS = 2; // 期間バーの縦オフセット段数 (重なる場合の分離用)
export const MAX_BAR_HEIGHT = 32;      // importance 5 の縦バー高 (tier 配置の境界計算で使用)
export const AXIS_HEIGHT = 40;
export const LANE_LABEL_WIDTH = 100;
export const STAGGER_TIERS = 4;        // 1 レーン内の縦オフセット段数. POINT_AREA 88
                                       // とこの値で tier 間隔 ≒18.7px となり、ラベル
                                       // 高 ~17px を確実に上回って文字被りを防ぐ.
export const CANVAS_MIN_WIDTH = 1280;  // 描画領域の最小幅. 密集回避.
export const LABEL_MAX_CHARS = 22;     // ラベル最大文字数
export const LABEL_CHAR_PX = 7.5;      // 1 文字あたり概算 px (やや保守的に)
export const LABEL_PADDING_PX = 36;    // bar + ドット + 余白 (28 → 36)
export const COLLISION_PAD_PCT = 1.0;  // tier 内衝突判定の余白 % (0.5 → 1.0)

/** 重要度 → バー高さ */
export function importanceBarHeight(level: number): number {
  return 12 + level * 4; // 1→16, 2→20, 3→24, 4→28, 5→32
}

/** 重要度 → ラベル font-size */
export function importanceFontSize(level: number): string {
  if (level >= 5) return "text-[12px] font-semibold";
  if (level >= 4) return "text-[11.5px] font-semibold";
  if (level >= 3) return "text-[11px] font-medium";
  return "text-[10.5px]";
}

/** ステータス → 点イベントバー色 */
export const STATUS_BAR_BG: Record<EventStatus, string> = {
  completed: "bg-muted-foreground/40",
  ongoing: "bg-emerald-500",
  scheduled: "bg-sky-500",
  distant: "bg-violet-400/50",
};

/** ステータス → 期間バー背景色 (薄め) */
export const STATUS_PERIOD_BG: Record<EventStatus, string> = {
  completed: "bg-muted-foreground/15",
  ongoing: "bg-emerald-500/20",
  scheduled: "bg-sky-500/15",
  distant: "bg-violet-400/15",
};

/** ステータス → 期間バーボーダー色 */
export const STATUS_PERIOD_BORDER: Record<EventStatus, string> = {
  completed: "border-muted-foreground/40",
  ongoing: "border-emerald-500/70",
  scheduled: "border-sky-500/60",
  distant: "border-violet-400/50",
};

export const STATUS_LABEL_COLOR: Record<EventStatus, string> = {
  completed: "text-muted-foreground",
  ongoing: "text-emerald-700 dark:text-emerald-300",
  scheduled: "text-sky-700 dark:text-sky-300",
  distant: "text-violet-600 dark:text-violet-300",
};

export const STATUS_LABEL_JA: Record<EventStatus, string> = {
  completed: "完了",
  ongoing: "進行中",
  scheduled: "予定",
  distant: "遠未来",
};
