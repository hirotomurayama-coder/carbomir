import * as React from "react";
import { Clock, AlertTriangle } from "lucide-react";

/**
 * 鮮度シグナル表示 (FreshnessIndicator).
 *
 * 設計方針 (アライメント結果 2026-05-25):
 *   - シナリオ 3 (規制キャッチアップ) では「この情報、今も最新?」が必須判断軸
 *   - 絶対日付 + 相対表示 + 警告レベルを 1 つで表現する
 *
 * 警告レベル:
 *   - 30 日以内: normal (アクセントカラー)
 *   - 31-90 日: aging (やや暖色)
 *   - 91-180 日: stale (警告色)
 *   - 181 日以上: very stale (強警告色)
 *
 * 表示例:
 *   2026-05-21 (3 日前)
 *   2026-02-12 (3 ヶ月前) ⚠ 古い
 */

const NOW_REFERENCE_DAYS_THRESHOLD_AGING = 30;
const NOW_REFERENCE_DAYS_THRESHOLD_STALE = 90;
const NOW_REFERENCE_DAYS_THRESHOLD_VERY_STALE = 180;

type FreshnessLevel = "normal" | "aging" | "stale" | "very_stale";

function diffDays(fromIsoDate: string, now: Date = new Date()): number {
  const from = new Date(`${fromIsoDate}T00:00:00Z`);
  if (Number.isNaN(from.getTime())) return Number.NaN;
  const ms = now.getTime() - from.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function levelFromDays(days: number): FreshnessLevel {
  if (Number.isNaN(days)) return "normal";
  if (days <= NOW_REFERENCE_DAYS_THRESHOLD_AGING) return "normal";
  if (days <= NOW_REFERENCE_DAYS_THRESHOLD_STALE) return "aging";
  if (days <= NOW_REFERENCE_DAYS_THRESHOLD_VERY_STALE) return "stale";
  return "very_stale";
}

function relativeLabel(days: number): string {
  if (Number.isNaN(days)) return "";
  if (days < 0) return `${Math.abs(days)} 日後`;
  if (days === 0) return "今日";
  if (days === 1) return "昨日";
  if (days < 7) return `${days} 日前`;
  if (days < 30) return `${Math.floor(days / 7)} 週間前`;
  if (days < 365) return `${Math.floor(days / 30)} ヶ月前`;
  return `${Math.floor(days / 365)} 年前`;
}

const LEVEL_CLASS: Record<FreshnessLevel, string> = {
  normal:
    "border-border bg-muted/40 text-foreground/80",
  aging:
    "border-amber-500/30 bg-amber-500/8 text-amber-700 dark:text-amber-300",
  stale:
    "border-amber-500/50 bg-amber-500/15 text-amber-700 dark:text-amber-300",
  very_stale:
    "border-rose-500/50 bg-rose-500/15 text-rose-700 dark:text-rose-300",
};

const LEVEL_LABEL: Record<FreshnessLevel, string> = {
  normal: "",
  aging: "やや古い",
  stale: "古い",
  very_stale: "要再レビュー",
};

type FreshnessIndicatorProps = {
  /** 最終レビュー日 (YYYY-MM-DD) */
  lastReviewedAt: string;
  /** 次回レビュー予定日 (オプション、YYYY-MM-DD) */
  nextReviewAt?: string;
  /** コンパクト表示: 警告ラベルとアイコンを省略する */
  compact?: boolean;
  /** 「最終レビュー: 」プレフィックスを表示するか */
  showPrefix?: boolean;
  /** "now" のオーバーライド (テスト用、SSR の決定性確保) */
  now?: Date;
};

/**
 * 鮮度シグナル表示コンポーネント.
 *
 * 既定では `lastReviewedAt` を基準に警告レベルを計算し、
 * 「2026-05-21 (3 日前)」のように表示。
 * 古いと「⚠ 古い」「⚠ 要再レビュー」を併記する。
 */
export function FreshnessIndicator({
  lastReviewedAt,
  nextReviewAt,
  compact = false,
  showPrefix = true,
  now,
}: FreshnessIndicatorProps) {
  const days = diffDays(lastReviewedAt, now);
  const level = levelFromDays(days);
  const relative = relativeLabel(days);
  const warningLabel = LEVEL_LABEL[level];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 font-mono text-[10px] tracking-wider ${LEVEL_CLASS[level]}`}
      title={`最終レビュー: ${lastReviewedAt}${
        nextReviewAt ? ` · 次回予定: ${nextReviewAt}` : ""
      }`}
    >
      {!compact && <Clock className="h-2.5 w-2.5 opacity-70" />}
      {showPrefix && !compact && <span className="opacity-70">Reviewed</span>}
      <span className="metric-number">{lastReviewedAt}</span>
      {relative && <span className="opacity-70">({relative})</span>}
      {!compact && warningLabel && (
        <span className="inline-flex items-center gap-0.5 ml-0.5">
          <AlertTriangle className="h-2.5 w-2.5" />
          {warningLabel}
        </span>
      )}
      {!compact && nextReviewAt && (
        <span className="opacity-60 ml-1">→ {nextReviewAt}</span>
      )}
    </span>
  );
}

// テスト用 export
export const __testing = {
  diffDays,
  levelFromDays,
  relativeLabel,
};
