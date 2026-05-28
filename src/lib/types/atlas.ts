/**
 * Atlas (世界マップ) 外部データセットの型定義.
 *
 * 2 つの独立した外部由来データセットを含む:
 * - World Bank Carbon Pricing Dashboard (Carbon pricing instruments / Crediting mechanisms / Cooperative agreements)
 * - CarbonPlan OffsetsDB (Project aggregates and individual project master)
 *
 * これらは Carbomir 編集物ではなく、外部マスタを参照して網羅性を担保する役割。
 */

/* ============================================================
 * World Bank Carbon Pricing Dashboard
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
 * CarbonPlan OffsetsDB
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
