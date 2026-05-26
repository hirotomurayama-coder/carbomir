/**
 * Atlas (世界マップ) で使用する英語タクソノミー → 日本語表示の辞書.
 *
 * - 表示専用. データ層 / フィルタ / 色マップの key は英語のまま使う.
 * - 未登録値は呼び出し側のフォールバック (translate* ヘルパーは英語をそのまま返す).
 * - 出典差を吸収する目的でも使う (例: cooperative status の表記揺れ "Bilteral" は
 *   3 種の typo パターンをまとめて 1 つの日本語に寄せる).
 */

/* ============================================================
 * 共通: ステータス / 管理主体 / スコープ / 地域
 * ============================================================ */

export const STATUS_JA: Record<string, string> = {
  // instruments / mechanisms 共通
  Implemented: "実施中",
  "Under consideration": "検討中",
  "Under development": "準備中",
  Abolished: "廃止",
  Removed: "廃止",
  Scheduled: "実施予定",
  // cooperative agreements (typo 含む WB 表記揺れを吸収)
  "MoU Signed": "MoU 締結",
  "Implementing Agreement Signed": "実施協定締結",
  "Framework Agreement Signed": "枠組み合意",
  "Bilteral Authorization Completed": "個別認可完了",
  "Bilteral authorization Completed": "個別認可完了",
  "Bilateral authorization issued": "個別認可完了",
  "Bilateral Authorization Completed": "個別認可完了",
};

export const ADMIN_JA: Record<string, string> = {
  Governmental: "政府運営",
  Independent: "民間 / 独立",
  International: "国際機関",
};

export const SCOPE_JA: Record<string, string> = {
  Global: "国際",
  National: "国家",
  Regional: "地域",
  Subnational: "サブナショナル",
};

/** World Bank の region 区分 (mechanisms.region の値). */
export const REGION_JA: Record<string, string> = {
  "East Asia & Pacific": "東アジア・大洋州",
  "Europe & Central Asia": "欧州・中央アジア",
  "Latin America & Caribbean": "中南米・カリブ",
  "Middle East & North Africa": "中東・北アフリカ",
  "North America": "北米",
  "South Asia": "南アジア",
  "Sub-Saharan Africa": "サハラ以南アフリカ",
};

/* ============================================================
 * Instruments (Carbon Pricing)
 * ============================================================ */

export const INSTRUMENT_TYPE_JA: Record<string, string> = {
  "Carbon tax": "炭素税",
  ETS: "排出量取引 (ETS)",
  Undefined: "未分類",
};

export const INSTRUMENT_SECTOR_JA: Record<string, string> = {
  "Agricultural emissions": "農業排出",
  "Agriculture, forestry and fishing fuel use": "農林水産 (燃料)",
  Aviation: "航空",
  Buildings: "建築",
  "Electricity and heat": "電力・熱",
  Industry: "産業",
  LULUCF: "土地利用・林業 (LULUCF)",
  "Mining and extractives": "鉱業・採掘",
  Transport: "運輸",
  Waste: "廃棄物",
};

/* ============================================================
 * Crediting Mechanisms
 * ============================================================ */

export const MECHANISM_SECTOR_JA: Record<string, string> = {
  Agriculture: "農業",
  "CCS / CCU": "CCS / CCU",
  "Energy Efficiency / Fuel Switching": "省エネ・燃料転換",
  "Forestry / Land Use": "森林・土地利用",
  "Fugitive Emissions": "漏洩排出",
  "Industrial Gases/Manufacturing": "産業ガス・製造",
  "Renewable Energy": "再生可能エネルギー",
  Transport: "運輸",
  Waste: "廃棄物",
};

/* ============================================================
 * OffsetsDB (CarbonPlan)
 * ============================================================ */

/** kebab-case のカテゴリコード → 日本語. */
export const OFFSETS_CATEGORY_JA: Record<string, string> = {
  "renewable-energy": "再生可能エネルギー",
  forest: "森林",
  "energy-efficiency": "省エネルギー",
  "ghg-management": "GHG マネジメント",
  unknown: "未分類",
  agriculture: "農業",
  "fuel-switching": "燃料転換",
  "biomass-cdr": "バイオマス CDR",
  "land-use": "土地利用",
  "alkalinity-cdr": "海洋アルカリ化 CDR",
  "air-capture": "直接空気回収 (DAC)",
};

/** プロジェクトタイプ (English label → 日本語). OffsetsDB の正規化済みラベル. */
export const OFFSETS_PROJECT_TYPE_JA: Record<string, string> = {
  Cookstove: "改良型コンロ",
  "Improved Forest Management": "森林管理改善 (IFM)",
  Wind: "風力発電",
  Unknown: "未分類",
  "Afforestation + Reforestation": "植林・再植林 (AR)",
  Hydropower: "水力発電",
  "Clean Water": "クリーンウォーター",
  "Manure Biodigester": "家畜糞尿バイオダイジェスター",
  Landfill: "埋立地ガス",
  "REDD+": "REDD+ (森林減少回避)",
  "Centralized Solar": "集中型太陽光",
  "Rice Emission": "稲作メタン削減",
  "Distributed Solar": "分散型太陽光",
  "Mine Methane Capture": "炭鉱メタン回収",
  Biogas: "バイオガス",
  "N2O Abatement": "N2O 削減",
  Geothermal: "地熱発電",
  Biomass: "バイオマス発電",
  "Carbon Capture": "CO2 回収・貯留",
  "Soil Carbon": "土壌炭素",
  "Ozone Depleting Substances": "オゾン破壊物質回収",
  "Fugitive Emissions": "漏洩排出削減",
  "Energy Efficiency": "省エネルギー",
  "Fuel Switching": "燃料転換",
  "Industrial Process": "産業プロセス改善",
  "Waste Handling": "廃棄物処理",
};

/* ============================================================
 * ヘルパー (未登録値は英語そのまま返す)
 * ============================================================ */

export function translateStatus(s: string | null | undefined): string {
  if (!s) return "—";
  return STATUS_JA[s] ?? s;
}

export function translateAdmin(s: string | null | undefined): string {
  if (!s) return "—";
  return ADMIN_JA[s] ?? s;
}

export function translateScope(s: string | null | undefined): string {
  if (!s) return "—";
  return SCOPE_JA[s] ?? s;
}

export function translateRegion(s: string | null | undefined): string {
  if (!s) return "—";
  return REGION_JA[s] ?? s;
}

export function translateInstrumentType(s: string | null | undefined): string {
  if (!s) return "—";
  return INSTRUMENT_TYPE_JA[s] ?? s;
}

export function translateInstrumentSector(s: string): string {
  return INSTRUMENT_SECTOR_JA[s] ?? s;
}

export function translateMechanismSector(s: string): string {
  return MECHANISM_SECTOR_JA[s] ?? s;
}

export function translateOffsetsCategory(s: string): string {
  return OFFSETS_CATEGORY_JA[s] ?? s;
}

export function translateOffsetsProjectType(s: string): string {
  return OFFSETS_PROJECT_TYPE_JA[s] ?? s;
}
