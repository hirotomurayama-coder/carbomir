export type EntityType =
  | "methodology"
  | "regulation"
  | "player"
  | "market"
  | "technology"
  | "project";

/**
 * 課金階層 (paywall tier).
 *
 * セクション単位で付与し、UI には「Standard 会員限定」等のラベルだけ先に出す。
 * 認証・課金フローは Phase 4 で後付け予定。
 *
 * - free: 公開コンテンツ (未指定時はこれ扱い)
 * - standard: 編集論点フルアクセスを含む有料層 (¥3,000-5,000/月想定)
 * - pro: CSV エクスポート・アラート・API 等のプロ機能層 (¥15,000-30,000/月想定)
 */
export type PaywallTier = "free" | "standard" | "pro";

export const PAYWALL_TIER_LABEL: Record<PaywallTier, string> = {
  free: "無料",
  standard: "Standard 会員限定",
  pro: "Pro 会員限定",
};

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

/* ============================================================
 * Tag taxonomy (controlled vocabulary)
 *
 * Entity の tags フィールドはこの語彙のいずれかを使う。
 * フィルタ UX や横断検索でブレを抑えるための整理。
 * カテゴリは UI でグルーピングするのに使える (現状フラットでも可)。
 * ============================================================ */

export const TAG_GEOGRAPHIC = [
  "日本",
  "EU",
  "米国",
  "韓国",
  "中国",
  "国際",
  "二国間",
  "途上国",
] as const;

export const TAG_MARKET = [
  "ボランタリー市場",
  "遵守市場",
  "ETS / 排出量取引",
  "炭素税",
] as const;

export const TAG_TECH_SECTOR = [
  "森林吸収",
  "Engineered Removal",
  "DAC",
  "REDD+",
  "再生可能エネルギー",
  "CCS",
] as const;

export const TAG_PLAYER_ROLE = [
  "レジストリ",
  "商社",
  "需要家",
  "プラットフォーム",
] as const;

export const TAG_QUALITY = [
  "品質基準 (CCP)",
  "SDGs 連動",
  "コミュニティベース",
] as const;

export const TAG_FRAMEWORK = [
  "GX-ETS 関連",
  "パリ協定 6 条",
  "国境調整",
  "Cap and Trade",
  "州レベル",
] as const;

export const TAG_VOCABULARY: readonly string[] = [
  ...TAG_GEOGRAPHIC,
  ...TAG_MARKET,
  ...TAG_TECH_SECTOR,
  ...TAG_PLAYER_ROLE,
  ...TAG_QUALITY,
  ...TAG_FRAMEWORK,
];

/** カテゴリ → 該当タグ群 */
export const TAG_CATEGORIES: { label: string; tags: readonly string[] }[] = [
  { label: "地域", tags: TAG_GEOGRAPHIC },
  { label: "市場", tags: TAG_MARKET },
  { label: "技術・セクター", tags: TAG_TECH_SECTOR },
  { label: "プレイヤー役割", tags: TAG_PLAYER_ROLE },
  { label: "品質・ガバナンス", tags: TAG_QUALITY },
  { label: "枠組み", tags: TAG_FRAMEWORK },
];

/* ============================================================
 * Atlas datasets (World Bank Carbon Pricing Dashboard)
 * Source: World Bank, updated April/May 2026
 * ============================================================ */

/** Compliance instrument (ETS or carbon tax) - 139 件 */
export type CarbonPricingInstrument = {
  unique_id: string; // 例: "ETS_EU_EU_ETS", "Tax_JP", "ETS_KR"
  name: string;
  type: "ETS" | "Carbon tax";
  status: string; // "Implemented" / "Under consideration" / "Scheduled" / "Abolished" 等
  jurisdiction?: string;
  share_of_emissions_covered?: string;
  price_2026_usd?: number;
  gases_covered?: string;
  sectors_covered: string[];
  fuels_covered?: string;
  allocation_approaches?: string;
  price_or_market_management?: string;
  point_of_regulation?: string;
  offset_eligibility?: string;
  description?: string;
  recent_developments?: string;
  coverage_notes?: string;
  pricing_notes?: string;
  compliance_notes?: string;
  relation_notes?: string;
};

/** Crediting mechanism - 57 件 */
export type CreditingMechanism = {
  mechanism: string;
  administration?: "Governmental" | "Independent" | "International" | string;
  status?: string;
  year_of_implementation?: number;
  scope?: "National" | "Subnational" | "Global" | "Regional" | string;
  administering_jurisdiction?: string;
  description?: string;
  recent_developments?: string;
  region?: string;
  income_group?: string;
  credit_name?: string;
  price_range?: string;
  countries_iso3?: string;
  sectors_covered: string[];
  compliance_cpis_accepting?: string;
  cumulative_issued_kt?: number;
  cumulative_retired_kt?: number;
  cumulative_cancelled_kt?: number;
  cumulative_projects?: number;
  /** Carbomir 既存 entity slug への手動マッピング (将来) */
  linked_entity_slug?: string;
};

/** Cooperative approach (Article 6.2) - 58 件 */
export type CooperativeAgreement = {
  buyer: string;
  year_of_agreement: number;
  seller: string;
  status: string; // "Implementing Agreement Signed" / "Bilteral authorization Completed" / etc.
  notes?: string;
};

export const ATLAS_SOURCE_LABEL =
  "World Bank Carbon Pricing Dashboard (Updated April-May 2026)";
export const ATLAS_SOURCE_URL =
  "https://carbonpricingdashboard.worldbank.org/";

/* ============================================================
 * CarbonPlan OffsetsDB (Atlas / 2nd 外部データセット)
 * Source: https://carbonplan.org/research/offsets-db
 * License: MIT (code) / "as-is, no copyright claimed" (data)
 * ============================================================ */

export type OffsetsDbRegistryStat = {
  registry: string;
  projects: number;
  issued: number;
  retired: number;
};

export type OffsetsDbCategoryStat = {
  category: string;
  projects: number;
  issued: number;
  retired: number;
};

export type OffsetsDbCountryStat = {
  label: string; // country name
  projects: number;
  issued: number;
};

export type OffsetsDbYearStat = {
  year: number;
  issued: number;
  retired: number;
};

export type OffsetsDbAggregates = {
  source: {
    name: string;
    url: string;
    terms_url: string;
    generated_at: string;
    synced_at_utc: string;
  };
  totals: {
    projects: number;
    credits_transactions: number;
    registries: number;
    countries: number;
    total_issued: number;
    total_retired: number;
  };
  by_registry: OffsetsDbRegistryStat[];
  by_category: OffsetsDbCategoryStat[];
  by_country_top30: OffsetsDbCountryStat[];
  by_status: { status: string; count: number }[];
  by_year: OffsetsDbYearStat[];
  project_types_top20: { label: string; count: number }[];
};

/** trimmed project master (11,640 件) */
export type OffsetsDbProject = {
  project_id: string;
  name: string;
  registry: string;
  country?: string;
  category?: string;
  project_type?: string;
  status?: string;
  is_compliance: boolean;
  issued: number;
  retired: number;
  proponent?: string;
  project_url?: string;
  first_issuance_at?: string; // YYYY-MM-DD
};

export const OFFSETS_DB_SOURCE_LABEL =
  "CarbonPlan OffsetsDB (Snapshot: 2026-05-21)";
export const OFFSETS_DB_SOURCE_URL =
  "https://carbonplan.org/research/offsets-db";
export const OFFSETS_DB_TERMS_URL =
  "https://offsets-db-data.readthedocs.io/en/latest/TERMS-OF-DATA-ACCESS.html";

/* ============================================================
 * Case Studies (個別企業のクレジット取り組み事例)
 * ============================================================ */

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

/* ============================================================
 * FAQ (実務 Q&A)
 * ============================================================ */

export type FaqCategory =
  | "procurement" // 調達
  | "reporting" // 報告
  | "regulation" // 制度
  | "quality"; // 品質

export const FAQ_CATEGORY_LABEL: Record<FaqCategory, string> = {
  procurement: "調達",
  reporting: "報告",
  regulation: "制度",
  quality: "品質",
};

export type FAQItem = {
  slug: string;
  question: string;
  short_answer: string; // 1-2 文の要約
  detailed_md: string; // Markdown 詳細解説
  category: FaqCategory;
  related_entity_slugs: string[];
  related_matrix_slugs?: string[];
  source_urls?: { label: string; url: string }[];
  tags: string[];
  last_reviewed_at: string;
  /** 次回レビュー予定日 (任意, YYYY-MM-DD) */
  next_review_at?: string;
  status: "draft" | "published" | "archived";
};

export type ComparisonDimension = {
  key: string;
  label_ja: string;
  description?: string;
  /**
   * 課金階層 (任意、未指定時は "free" 扱い)。
   * 列単位で付けると列ヘッダーにバッジ表示される (e.g. carbomir_view = "standard")。
   */
  paywall_tier?: PaywallTier;
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

/* ============================================================
 * Timeline events (L2-D 時系列体系化)
 * ============================================================ */

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

/* ============================================================
 * AI ドラフト (編集サイドツール)
 *
 * AI で生成した entity / faq / case_study のドラフトを編集者が
 * レビュー (approve / reject) するための中間状態。
 * 本番採用時は seed TS / Supabase に手作業で適用する想定。
 * ============================================================ */

export type AiDraftType = "entity" | "faq" | "case_study";

export const AI_DRAFT_TYPE_LABEL: Record<AiDraftType, string> = {
  entity: "Entity",
  faq: "FAQ",
  case_study: "Case Study",
};

export type AiDraftStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "applied"; // approved 後、seed に取り込み済み

export const AI_DRAFT_STATUS_LABEL: Record<AiDraftStatus, string> = {
  pending: "未レビュー",
  approved: "承認済み",
  rejected: "却下",
  applied: "適用済み",
};

export type AiDraft = {
  id: string; // ULID-ish (yyyymmddhhmmss + 短いランダム)
  type: AiDraftType;
  topic: string; // 編集者が指定したテーマ (e.g. "Cercarbono レジストリの最新動向")
  target_slug?: string; // 既存更新の場合は対象 slug、新規作成は undefined
  prompt: string; // 実際に使われた system + user prompt の連結 (監査用)
  model: string; // 利用した Claude モデル名
  content: unknown; // JSON 化された draft 本体 (entity / faq / case_study の型)
  status: AiDraftStatus;
  created_at: string; // ISO 8601
  reviewed_at?: string; // ISO 8601
  reviewer_notes?: string;
};

