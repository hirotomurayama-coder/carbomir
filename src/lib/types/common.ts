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
 * 出自 (provenance) — PROVENANCE.md のレーン分担を section 単位で表現
 * ============================================================ */

/**
 * コンテンツ section の出自レーン (PROVENANCE.md §1/§2)。
 *
 * - media: carboncredits.jp が正準の散文 (用語解説等)。media_ref を伴う。
 * - tool:  Carbomir 編集部が正準の判断資産 (編集論点 / 構造化属性)。出典・確信度つき。
 * - ai_assisted: AI 下書き起点でまだゲート (媒体 or /admin/drafts) を通していないもの。
 *
 * 未指定時は "tool" 扱い (既存の自社編集コンテンツはツールレーン)。
 */
export type Origin = "media" | "tool" | "ai_assisted";

export const ORIGIN_LABEL: Record<Origin, string> = {
  media: "carboncredits.jp 編集部",
  tool: "Carbomir 編集部",
  ai_assisted: "AI 下書き (未確定)",
};

/**
 * 媒体 (carboncredits.jp) 記事への参照 (PROVENANCE.md §3/§5)。
 * 本文はツールに取り込まず、canonical_url で媒体に委ねる (参照＋抜粋)。
 */
export type MediaRef = {
  /** 媒体記事の正準 URL (例 https://carboncredits.jp/glossary/verra/) */
  canonical_url: string;
  /** WP 側 slug (同期キー) */
  source_ref: string;
  /** 最終照合時刻 (ISO)。sync ジョブが更新する */
  synced_at?: string;
};

/* ============================================================
 * 価格水準 (相場観) — editorial 属性 (STRATEGY §8)
 * ============================================================ */

export type PriceTrend = "rising" | "falling" | "stable" | "volatile";

export const PRICE_TREND_LABEL: Record<PriceTrend, string> = {
  rising: "上昇",
  falling: "低下",
  stable: "横ばい",
  volatile: "変動大",
};

/**
 * 価格水準 (相場観).
 *
 * 「正確な実勢価格 (live feed)」ではなく、出典・時点つきのレンジ・方向感・代表指標。
 * 公開ソース (World Bank State and Trends, EUA オークション, Nasdaq/Puro CORC 指数,
 * METI / J-クレジット平均, 報道スポットレンジ 等) で成立する editorial データ。
 * 正確な執行価格が要る瞬間 (調達実行) はブローカー/市場/CradleTo へハンドオフする
 * (price precision / liquidity は意識的に取りに行かないトレードオフ)。
 */
export type PriceLevel = {
  /** 代表レンジ・水準 (例: "60–90", "400–1,000")。単位は unit 側 */
  range: string;
  /** 通貨・単位 (例: "EUR/t-CO2", "USD/t-CO2", "JPY/t-CO2") */
  unit: string;
  /** 方向感 (任意) */
  trend?: PriceTrend;
  /** 時点 (YYYY-MM or YYYY-MM-DD)。鮮度シグナルと同じ規律で扱う */
  as_of: string;
  /** 出典ラベル */
  source_label: string;
  /** 出典 URL (任意) */
  source_url?: string;
  /** 補足 (任意, 例: "除去系 CORC 指数 / 回避系はより低位") */
  note?: string;
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
