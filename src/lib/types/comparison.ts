/**
 * Comparison matrix (比較行列) の型定義.
 *
 * 列 (dimension) × 行 (entity) のテーブル構造で、編集部見解列を含む。
 */

import type { Origin, PaywallTier } from "./common";
import type { EntityRef } from "./entity";

export type ComparisonDimension = {
  key: string;
  label_ja: string;
  description?: string;
  /**
   * 課金階層 (任意、未指定時は "free" 扱い)。
   * 列単位で付けると列ヘッダーにバッジ表示される (e.g. carbomir_view = "standard")。
   */
  paywall_tier?: PaywallTier;
  /** 出自レーン (任意、未指定時は "tool" 扱い)。PROVENANCE.md §1。 */
  origin?: Origin;
};

export type ComparisonCell = {
  value: string;
  source_url?: string;
  source_label?: string;
  note?: string;
  /**
   * 課金階層 (任意、未指定時は "free" 扱い)。
   * 比較行列では基本 dimension (列) 単位で揃える運用を想定 (carbomir_view 列を standard など)。
   */
  paywall_tier?: PaywallTier;
};

/**
 * 比較行列のカテゴリ。`/matrices` インデックスでのグルーピング軸。
 * 任意項目だが、付与されている行列はカテゴリごとに分組表示される。
 */
export type MatrixCategory =
  | "scheme" // 制度間比較 (J-クレジット / JCM / Verra など)
  | "standard" // 民間スタンダード比較 (Verra / Gold Standard / Plan Vivo)
  | "methodology" // メソドロジー比較 (REDD+ / DAC / Biochar など)
  | "market" // 市場・取引比較
  | "eligibility"; // 適格性マトリックス (どの制度がどの報告枠組に使えるか)

export const MATRIX_CATEGORY_LABEL: Record<MatrixCategory, string> = {
  scheme: "制度比較",
  standard: "スタンダード比較",
  methodology: "メソドロジー比較",
  market: "市場・取引",
  eligibility: "適格性マトリックス",
};

export type ComparisonMatrix = {
  slug: string;
  title: string;
  description: string;
  dimensions: ComparisonDimension[];
  entities: EntityRef[];
  cells: Record<string, Record<string, ComparisonCell>>;
  last_reviewed_at: string;
  /** 次回レビュー予定日 (任意, YYYY-MM-DD) */
  next_review_at?: string;
  status: "draft" | "published" | "archived";
  category?: MatrixCategory;
  tags?: string[];
};
