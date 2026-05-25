/**
 * Atlas dataset accessors.
 *
 * Data source: World Bank Carbon Pricing Dashboard
 * (https://carbonpricingdashboard.worldbank.org/)
 *
 * Updated: April 1, 2026 (compliance instruments) / May 1, 2026 (crediting / cooperative)
 *
 * 各 dataset は JSON ファイルに格納し、型付け済みアクセサで公開する。
 * Carbomir 既存の比較行列・概念体系等とは別アセットとして扱う。
 */

import instrumentsJson from "./instruments.json";
import mechanismsJson from "./mechanisms.json";
import cooperativeJson from "./cooperative.json";
import offsetsDbAggregatesJson from "./offsets-db/aggregates.json";
import offsetsDbProjectsJson from "./offsets-db/projects.json";
import type {
  CarbonPricingInstrument,
  CreditingMechanism,
  CooperativeAgreement,
  OffsetsDbAggregates,
  OffsetsDbProject,
} from "@/lib/types";

/** 既存 Carbomir entity と対応する mechanism の手動マッピング (WB の正確な名前) */
const MECHANISM_TO_ENTITY: Record<string, string> = {
  "Verified Carbon Standard": "verra-vcs",
  "Gold Standard": "gold-standard",
  "Plan Vivo": "plan-vivo",
  "J-Credit Scheme": "jcredit",
  "Joint Crediting Mechanism": "jcm",
  "Paris Agreement Crediting Mechanism": "paris-article-6-4",
  // Phase 3c で追加した 5 registry
  "American Carbon Registry": "acr",
  "Climate Action Reserve": "car",
};

/** 既存 Carbomir entity と対応する instrument (Unique ID 基準) */
const INSTRUMENT_TO_ENTITY: Record<string, string> = {
  ETS_JP: "gx-ets", // WB は "Japan ETS" として記載
  ETS_EU: "eu-ets",
  ETS_KR: "k-ets",
  ETS_CN: "china-national-ets",
  // California Cap-and-Trade も後で
};

/**
 * JSON は null を含むので、null → undefined に正規化する。
 * 型は string | undefined を期待しているため。
 */
function nullsToUndefined<T extends object>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = v === null ? undefined : v;
  }
  return out as T;
}

export function listInstruments(): CarbonPricingInstrument[] {
  return (instrumentsJson as unknown[]).map((i) =>
    nullsToUndefined(i as CarbonPricingInstrument)
  );
}

export function listMechanisms(): CreditingMechanism[] {
  return (mechanismsJson as unknown[]).map((m) => {
    const normalized = nullsToUndefined(m as CreditingMechanism);
    return {
      ...normalized,
      linked_entity_slug:
        MECHANISM_TO_ENTITY[normalized.mechanism] ?? normalized.linked_entity_slug,
    };
  });
}

export function listCooperativeAgreements(): CooperativeAgreement[] {
  return (cooperativeJson as unknown[]).map((c) =>
    nullsToUndefined(c as CooperativeAgreement)
  );
}

export function getInstrumentLinkedEntity(uniqueId: string): string | undefined {
  return INSTRUMENT_TO_ENTITY[uniqueId];
}

/* ============================================================
 * CarbonPlan OffsetsDB
 * ============================================================ */

/** OffsetsDB registry コード → Carbomir entity slug (7 registry 全網羅) */
const OFFSETS_REGISTRY_TO_ENTITY: Record<string, string> = {
  verra: "verra-vcs",
  "gold-standard": "gold-standard",
  "american-carbon-registry": "acr",
  "climate-action-reserve": "car",
  "art-trees": "art-trees",
  cercarbono: "cercarbono",
  isometric: "isometric",
};

export function getOffsetsRegistryLinkedEntity(
  registry: string
): string | undefined {
  return OFFSETS_REGISTRY_TO_ENTITY[registry];
}

/** entity slug → OffsetsDB registry code の逆引き (複数 entity → 1 registry あり) */
const ENTITY_TO_OFFSETS_REGISTRY: Record<string, string> = {
  // Verra スタンダードと Verra 組織は同じ registry の集計を見せる
  "verra-vcs": "verra",
  "verra-org": "verra",
  "gold-standard": "gold-standard",
  "gold-standard-foundation": "gold-standard",
  "plan-vivo": "plan-vivo", // 注: OffsetsDB に Plan Vivo データは収録されていない可能性あり
  "plan-vivo-foundation": "plan-vivo",
  // Phase 3c で追加した 5 registry
  acr: "american-carbon-registry",
  car: "climate-action-reserve",
  "art-trees": "art-trees",
  cercarbono: "cercarbono",
  isometric: "isometric",
};

/**
 * entity slug から、対応する OffsetsDB registry を返す。
 * verra-vcs と verra-org のように複数の entity が同じ registry に対応する可能性が
 * あるが、現状はそれぞれ別の slug でマッピングされていないため対応してない。
 */
export function findOffsetsRegistryForEntity(entitySlug: string): string | undefined {
  return ENTITY_TO_OFFSETS_REGISTRY[entitySlug];
}

/* ============================================================
 * Atlas Links Resolver
 * Entity slug から、それが Atlas に登場する場所をまとめて返す
 * ============================================================ */

export type AtlasLinks = {
  /** OffsetsDB registry code (該当する場合) */
  offsetsRegistry?: string;
  /** WB instrument の Unique ID (該当する場合) */
  instrumentUniqueId?: string;
  /** WB crediting mechanism の名前 (該当する場合) */
  mechanismName?: string;
};

/** entity slug → WB instrument の逆引き */
const ENTITY_TO_INSTRUMENT_ID: Record<string, string> = Object.entries(
  INSTRUMENT_TO_ENTITY
).reduce(
  (acc, [uid, slug]) => {
    acc[slug] = uid;
    return acc;
  },
  {} as Record<string, string>
);

/** entity slug → WB mechanism 名 の逆引き */
const ENTITY_TO_MECHANISM_NAME: Record<string, string> = Object.entries(
  MECHANISM_TO_ENTITY
).reduce(
  (acc, [name, slug]) => {
    acc[slug] = name;
    return acc;
  },
  {} as Record<string, string>
);

export function findAtlasLinksForEntity(entitySlug: string): AtlasLinks {
  return {
    offsetsRegistry: ENTITY_TO_OFFSETS_REGISTRY[entitySlug],
    instrumentUniqueId: ENTITY_TO_INSTRUMENT_ID[entitySlug],
    mechanismName: ENTITY_TO_MECHANISM_NAME[entitySlug],
  };
}

export function getOffsetsDbAggregates(): OffsetsDbAggregates {
  return offsetsDbAggregatesJson as unknown as OffsetsDbAggregates;
}

export function listOffsetsDbProjects(): OffsetsDbProject[] {
  return offsetsDbProjectsJson as unknown as OffsetsDbProject[];
}
