/**
 * 全ドメイン共通の型・定数.
 *
 * - PaywallTier: 課金階層シグナル (entity / case-study / matrix で共有)
 * - タグ controlled vocabulary: entity / matrix / case-study / FAQ が共通利用
 */

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
