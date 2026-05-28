/**
 * Entity (概念体系 / プレイヤー / 政策・規制 / メソドロジー 等) の型定義.
 *
 * 関連型: EntitySection, EntityRelation, PolicyStatus, EntityRef, InboundRelation.
 * Entity 詳細ページのレンダリング・関連グラフ・metadata パネルで使われる。
 */

import type { PaywallTier } from "./common";

export type EntityType =
  | "methodology"
  | "regulation"
  | "player"
  | "market"
  | "technology"
  | "project";

export type EntityRef = {
  slug: string;
  name_ja: string;
  name_en?: string;
};

export type RelationType =
  | "parent_of"
  | "depends_on"
  | "supersedes"
  | "competes_with"
  | "equivalent_to";

export type EntityRelation = {
  to_slug: string;
  relation: RelationType;
  note?: string;
};

export type EntitySection = {
  heading: string;
  body: string;
  source_urls?: { label: string; url: string }[];
  /**
   * 課金階層 (任意、未指定時は "free" 扱い)。
   * Phase 4 着手前の地ならし: UI にはラベルバッジだけ出し、マスクは未実装。
   */
  paywall_tier?: PaywallTier;
};

export type Entity = {
  slug: string;
  type: EntityType;
  name_ja: string;
  name_en?: string;
  abbreviation?: string;
  summary: string;
  sections: EntitySection[];
  related: EntityRelation[];
  related_matrix_slugs: string[];
  tags: string[];
  last_reviewed_at: string;
  /**
   * 次回レビュー予定日 (任意, YYYY-MM-DD).
   * 規制関連は 1-3 ヶ月、一般エンティティは 3-6 ヶ月後を目安に設定。
   * Phase Γ (2026-05) で型に追加、データ充填は順次。
   */
  next_review_at?: string;
  /**
   * Content lifecycle status (編集状態). draft/published/archived.
   * これは Carbomir 内部の編集ワークフロー指標。
   * 実世界の制度運用状態 (運用中/移行期間 等) は policy_status を使う。
   */
  status: "draft" | "published" | "archived";

  /* ---- 構造化属性 (任意。事業会社実務者向けのファクト集約) ---- */
  /** 管轄。例: "日本" / "国際 (UNFCCC)" / "米国 (民間)" */
  jurisdiction?: string;
  /** 発足年 (number。曖昧な場合は最も実態に近い年) */
  established_year?: number;
  /** 運営主体。例: "経済産業省・環境省・農林水産省" / "Verra (米国非営利)" */
  operator?: string;
  /** 適用地域。例: "日本国内" / "JCM パートナー国 (29か国)" */
  geographic_scope?: string;
  /** 公式サイト URL (存在すれば) */
  website_url?: string;
  /** クレジット単位の正式名。例: "VCU" / "PVC" / "J-クレジット" */
  credit_unit?: string;
  /** 親会社 (player 型向け)。例: 三菱商事の親 = (上場、独立) */
  parent_company?: string;
  /** ビジネスロール (player 型向け)。例: "レジストリ運営", "DAC 事業者", "国内取扱業者", "大手需要家" */
  business_role?: string;
  /** 政策ステータス (regulation 型向け)。active / transition / pilot / draft / discontinued */
  policy_status?: PolicyStatus;
  /** 次のマイルストーン (regulation 型向け)。例: "2026-04: 第2フェーズ開始" */
  next_milestone?: string;
};

export type PolicyStatus =
  | "active"
  | "transition"
  | "pilot"
  | "draft"
  | "discontinued";

export const POLICY_STATUS_LABEL: Record<PolicyStatus, string> = {
  active: "運用中",
  transition: "移行期間",
  pilot: "試行段階",
  draft: "草案・計画中",
  discontinued: "廃止",
};

/* Entity type の UI ラベル (社内記号ではなく一般語) */
export const ENTITY_TYPE_LABEL: Record<EntityType, string> = {
  methodology: "メソドロジー",
  regulation: "制度・規制",
  player: "プレイヤー",
  market: "市場",
  technology: "技術",
  project: "プロジェクト",
};

/**
 * Forward 方向のラベル (Subject の related[] 配列で見る関係性).
 *
 * 解釈ルール (固定):
 *   A.related に { to: B, relation: R } が入っているとき、
 *   forward = "A から見て B は (このラベル) である"
 *
 * 具体例:
 *   verra-vcs.related に [redd-plus, parent_of]
 *   → verra-vcs から見て redd-plus は「下位概念 (=サブ要素)」
 *   → 意図: VCS は REDD+ メソドロジー群を運営する側 (親)
 */
export const RELATION_LABEL: Record<RelationType, string> = {
  parent_of: "下位概念", // 主体が親、目的語が子
  depends_on: "依存先", // 主体が依存している先
  supersedes: "前身", // 主体が継承する側、目的語が前身
  competes_with: "競合", // 対称
  equivalent_to: "同等", // 対称
};

/**
 * Reverse 方向のラベル (Subject が他から参照されている、inbound 視点).
 *
 * B の Referenced By パネルから見て:
 *   A.related に { to: B, relation: R } があるとき、
 *   reverse = "B から見て A は (このラベル) である"
 *
 * 具体例:
 *   verra-vcs.related に [redd-plus, parent_of]
 *   → redd-plus から見て verra-vcs は「上位概念 (=親)」
 */
export const RELATION_LABEL_REVERSE: Record<RelationType, string> = {
  parent_of: "上位概念", // 親が下位概念を持つ → 下位から見ると親
  depends_on: "依存元", // X が Y に依存 → Y から見ると依存元は X
  supersedes: "後継", // X が前身を継承 → 前身から見ると X は後継
  competes_with: "競合", // 対称
  equivalent_to: "同等", // 対称
};

/** A→B (forward) で得られた relation に対する inbound 用ラベル */
export type InboundRelation = {
  from_slug: string;
  from_name_ja: string;
  from_name_en?: string;
  relation: RelationType;
  note?: string;
};
