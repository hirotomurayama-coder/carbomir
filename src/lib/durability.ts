/**
 * 維持/監視レンズ (durability) の純粋ロジック (STRATEGY §3③ / §5).
 *
 * ツールの③アウトカム =「決めたことが今も有効か」を監視し続ける状態。
 * entity に紐づく timeline イベント・next_milestone・レビュー周期から、
 * 「この判断が変わりうる条件」を前向き (予定) と直近に整理する。
 *
 * UI 非依存の純粋関数にして、監視スパインの判定をテスト可能にする
 * (将来 Manage 層 = 保有クレジットの監視も同じロジックを「保有」レンズで再利用)。
 */

import type {
  DurabilityRisk,
  TimelineCategory,
  TimelineEvent,
} from "./types";
import { DURABILITY_RISK_ORDER } from "./types";

export type DurabilityTimelineRef = {
  slug: string;
  title: string;
  event_date: string;
  category: TimelineCategory;
  /** §5 判断劣化リスク類型 (任意) */
  durability_risk?: DurabilityRisk;
};

/**
 * 比較行列の行 entity 群に効く timeline イベントを集約する (event_date 降順)。
 * 比較表の「前提が動く可能性」を監視するため、いずれかの行 entity に触れる
 * イベントを dedup して返す (matrix 版の監視スパイン)。
 */
export function selectMatrixInboundTimeline(
  entitySlugs: string[],
  events: TimelineEvent[]
): DurabilityTimelineRef[] {
  const set = new Set(entitySlugs);
  return events
    .filter((e) => e.affected_entity_slugs.some((s) => set.has(s)))
    .slice()
    .sort((a, b) => b.event_date.localeCompare(a.event_date))
    .map((e) => ({
      slug: e.slug,
      title: e.title,
      event_date: e.event_date,
      category: e.category,
      durability_risk: e.durability_risk,
    }));
}

/**
 * 監視対象イベント群に現れる §5 判断劣化リスク類型を、正準順序で重複なく返す。
 * 監視ポイントパネルの「監視中の観点」サマリ行を駆動する純粋関数。
 * 該当タグ付きイベントが無ければ空配列 (パネルはサマリ行を出さない)。
 */
export function distinctDurabilityRisks(
  refs: { durability_risk?: DurabilityRisk }[]
): DurabilityRisk[] {
  const present = new Set<DurabilityRisk>();
  for (const r of refs) if (r.durability_risk) present.add(r.durability_risk);
  return DURABILITY_RISK_ORDER.filter((risk) => present.has(risk));
}

/**
 * event_date を基準日で「予定 (today 以降, 昇順)」と「直近 (today 未満, 降順)」に分割。
 * today は "YYYY-MM-DD"。event_date も同形式の文字列比較で判定する。
 */
export function splitTimelineByDate<T extends { event_date: string }>(
  events: T[],
  today: string
): { upcoming: T[]; recent: T[] } {
  const upcoming: T[] = [];
  const recent: T[] = [];
  for (const e of events) {
    if (e.event_date >= today) upcoming.push(e);
    else recent.push(e);
  }
  upcoming.sort((a, b) => a.event_date.localeCompare(b.event_date));
  recent.sort((a, b) => b.event_date.localeCompare(a.event_date));
  return { upcoming, recent };
}

/**
 * next_milestone 文字列 "YYYY-MM-DD: 内容" / "YYYY: 内容" から
 * 日付ラベルと本文を分離。日付プレフィックスが無ければ dateLabel = ""。
 */
export function parseMilestone(s: string): { dateLabel: string; content: string } {
  const m = s.match(/^(\d{4}(?:-\d{2})?(?:-\d{2})?)\s*[::]\s*(.+)$/);
  if (m) return { dateLabel: m[1], content: m[2].trim() };
  return { dateLabel: "", content: s };
}
