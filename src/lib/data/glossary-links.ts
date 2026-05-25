/**
 * Carbomir entity → carboncredits.jp 用語集記事への slug マッピング.
 *
 * 設計判断:
 *   - carboncredits.jp は同社運営の用語集メディア (~93 用語、英字 slug).
 *   - Carbomir は構造化 + 編集論点 を加えた knowledge base.
 *   - 同じ概念について両方を見せるユーザに対し、相互リンクで連携.
 *   - "carbomir 内部 slug → carboncredits.jp の slug" の単純マップで管理.
 *     slug 一致 (verra-vcs ↔ verra, j-credit ↔ j-credits 等) も明示記述.
 *   - 双方の差分は意図的に残す: 同じ概念でも片方にしかない解説角度がある.
 *
 * 更新方針:
 *   - carboncredits.jp に新規記事が出たら、Carbomir に対応 entity があるか
 *     確認してマッピング追加.
 *   - 完全に同じ slug の場合は冗長だが、明示性のため列挙.
 */

const CARBONCREDITS_BASE = "https://carboncredits.jp/glossary_article";

/** Carbomir slug → carboncredits.jp の glossary_article slug */
export const CARBONCREDITS_SLUG_MAP: Record<string, string> = {
  // メソドロジー
  arr: "arr",
  beccs: "beccs",
  biochar: "biochar",
  dac: "direct-air-capture",
  erw: "enhanced-rock-weathering",
  "redd-plus": "redd-plus",

  // レジストリ / スタンダード
  verra: "verra",
  "verra-org": "verra",
  "verra-vcs": "verra",
  "gold-standard": "gold-standard",
  "gold-standard-foundation": "gold-standard",
  acr: "acr",
  car: "climate-action-reserve",
  isometric: "isometric",
  "puro-earth": "puro-earth",

  // ガバナンス
  icvcm: "icvcm",
  "icvcm-org": "icvcm",
  "icvcm-ccp": "ccps",

  // 政策・規制
  "eu-ets": "eu-ets",
  "gx-ets": "gx-ets",
  "california-cap-trade": "california-cap-and-trade-program",
  corsia: "corsia",
  jcm: "jcm",
  "j-credit": "j-credits",
  jcredit: "j-credits",
  "paris-article-6-2": "article-6-of-the-paris-agreement",
  "paris-article-6-4": "article-6-of-the-paris-agreement",

  // Tier 1: 基礎概念 (2026-05 追加)
  additionality: "additionality",
  permanence: "permanence",
  mrv: "mrv",
  dmrv: "dmrv",
  "net-zero": "net-zero",
  "carbon-neutral": "carbon-neutral",
  "carbon-negative": "carbon-negative",
  "carbon-offsetting": "carbon-offsetting",
  "ghg-protocol": "ghg-protocol",
  ghg: "ghg",
  co2e: "co2e",
  scope1: "scope1",
  scope2: "scope2",
  scope3: "scope3",
  scope123: "scope123",

  // Tier 2: クレジット種別 + CCS/CCUS (2026-05 追加)
  "voluntary-carbon-credits": "voluntary-carbon-credits",
  "compliance-carbon-market": "compliance-carbon-market",
  "avoidance-credits": "avoidance-credits",
  "reduction-credits": "reduction-credits",
  "cdr-credits": "cdr-credits",
  "nature-based-carbon-credits": "nature-based-carbon-credits",
  ccs: "ccs",
  ccus: "ccus",
};

/** Carbomir slug から carboncredits.jp の用語記事 URL を返す. 対応なしは undefined. */
export function carbonCreditsUrl(carbomirSlug: string): string | undefined {
  const target = CARBONCREDITS_SLUG_MAP[carbomirSlug];
  if (!target) return undefined;
  return `${CARBONCREDITS_BASE}/${target}/`;
}

/**
 * 対応マッピングが存在する Carbomir slug 一覧.
 * "用語集として何件が carboncredits.jp と相互参照可能か" の集計に使う.
 */
export function listLinkedSlugs(): string[] {
  return Object.keys(CARBONCREDITS_SLUG_MAP);
}

/**
 * carboncredits.jp に存在するが Carbomir には未収録の slug 一覧.
 * 補完計画の入力として使う. 手動メンテ.
 * Tier 1+2 (23 件) は 2026-05 に追加済み.
 */
export const CARBONCREDITS_UNMAPPED_SLUGS: string[] = [
  // Tier 3: 残概念 (補完優先度: 中)
  "carbon-sequestration",
  "baseline-and-credits",
  "carbon-leakage",
  "carbon-sink",
  "co-benefits",
  "double-counting",
  "carbon-tax",
  "greenwashing",
  "global-warming-potential",
  "emission-allowance",
  "ets",
  "kyoto-protocol",

  // Tier 4: メソドロジー / 技術 (補完優先度: 中)
  "bicrs",
  "mcdr",
  "carbon-capture-and-utilization",
  "direct-ocean-capture",

  // 京都議定書クレジット単位 (補完優先度: 低)
  "aau",
  "cer",
  "eru",
  "rmu",
  "iet",
  "ji",
  "clean-development-mechanism",
  "green-investment-scheme",

  // 国際機関 (補完優先度: 中)
  "ipcc",
  "wmo",
  "iso",

  // 新興クレジット (補完優先度: 低)
  "biodiversity-credits",
  "blue-carbon-credits",
  "plastic-credits",
  "j-blue-credits",

  // クレジット属性 (補完優先度: 中)
  "ex-ante-carbon-credits",
  "ex-post-carbon-credits",
  "pre-purchase-carbon-credits",
  "carbon-credits-market",
  "carbon-insetting",
  "carbon-insurance",

  // 認証関連 (補完優先度: 低)
  "vcmi",
  "sd-vista",
  "bridge",

  // 古い概念 (補完優先度: 低)
  "negative-emissions",
];
