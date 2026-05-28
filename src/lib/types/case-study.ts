/**
 * Case study (個別企業のクレジット取り組み事例) の型定義.
 */

import type { PaywallTier } from "./common";

export type CaseStudyCategory =
  | "procurement" // 調達 (buyer 側の事例)
  | "supply" // 創出 (developer / project 側)
  | "reporting" // 報告 (Scope3 / CDP 等の活用)
  | "compliance"; // 制度遵守 (GX-ETS / CBAM 等)

export const CASE_STUDY_CATEGORY_LABEL: Record<CaseStudyCategory, string> = {
  procurement: "調達",
  supply: "創出・組成",
  reporting: "報告活用",
  compliance: "制度遵守",
};

export type CaseStudySection = {
  heading: string;
  body: string; // Markdown
  /**
   * 課金階層 (任意、未指定時は "free" 扱い)。
   * Phase 4 着手前の地ならし: UI にはラベルバッジだけ出し、マスクは未実装。
   */
  paywall_tier?: PaywallTier;
};

export type CaseStudy = {
  slug: string;
  title: string;
  company: string;
  year: number;
  region: string;
  category: CaseStudyCategory;
  /** 使用したクレジット種別 / 関連クレジット */
  credit_type?: string;
  /** 規模感の short note (例: "10年 70万トン") */
  scale_note?: string;
  summary: string;
  sections: CaseStudySection[];
  related_entity_slugs: string[];
  source_urls: { label: string; url: string }[];
  tags: string[];
  last_reviewed_at: string;
  /** 次回レビュー予定日 (任意, YYYY-MM-DD) */
  next_review_at?: string;
  status: "draft" | "published" | "archived";
};
