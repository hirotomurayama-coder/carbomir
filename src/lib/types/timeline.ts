/**
 * Timeline events (時系列体系化) の型定義.
 *
 * 単発イベント + 期間イベント (event_end_date 指定時) の 2 種を表現する。
 */

export type TimelineCategory =
  | "regulatory"
  | "market"
  | "technology"
  | "methodology";

export type TimelineImportance = 1 | 2 | 3 | 4 | 5;

/**
 * 維持/監視レンズ (STRATEGY §5) の「判断を腐らせるイベント」類型.
 * 任意。該当するイベントにのみ付与し、監視ポイントパネルで「なぜこの動向が
 * 判断を腐らせるのか」を可視化する (手法改訂・品質ラベル判定・評判事件・
 * 国際クレジット受入ルール・主張ルール・永続性/リバーサル)。
 */
export type DurabilityRisk =
  | "methodology"
  | "quality_label"
  | "reputation"
  | "acceptance"
  | "claim"
  | "permanence";

export type TimelineSource = {
  label: string;
  url: string;
};

export type TimelineEvent = {
  slug: string;
  event_date: string; // YYYY-MM-DD
  /**
   * 任意の終了日 (YYYY-MM-DD).
   * 指定すると「期間イベント」として横バーで描画される (例: GX-ETS 第1フェーズ
   * 試行期間 2024-04-01 → 2026-03-31, EU CBAM 移行期間 等)。
   * 未指定なら従来通り単発の点イベント。
   */
  event_end_date?: string;
  title: string;
  summary: string;
  content_md?: string;
  affected_entity_slugs: string[];
  category: TimelineCategory;
  /** 維持/監視レンズ (§5) の判断劣化リスク類型 (任意, 該当イベントのみ) */
  durability_risk?: DurabilityRisk;
  importance: TimelineImportance;
  source_urls: TimelineSource[];
  status: "draft" | "published" | "archived";
};

export const TIMELINE_CATEGORY_LABEL: Record<TimelineCategory, string> = {
  regulatory: "規制・制度",
  market: "市場",
  technology: "技術",
  methodology: "メソドロジー",
};

/** §5 判断劣化リスク類型の短ラベル (監視ポイントパネルのチップ表示用) */
export const DURABILITY_RISK_LABEL: Record<DurabilityRisk, string> = {
  methodology: "手法改訂",
  quality_label: "品質ラベル判定",
  reputation: "評判リスク",
  acceptance: "受入ルール",
  claim: "主張ルール",
  permanence: "永続性",
};

/** チップやサマリで安定した順序を与えるための表示順 (§5 テーブルの並び) */
export const DURABILITY_RISK_ORDER: DurabilityRisk[] = [
  "methodology",
  "quality_label",
  "reputation",
  "acceptance",
  "claim",
  "permanence",
];
