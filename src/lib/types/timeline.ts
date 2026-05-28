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
