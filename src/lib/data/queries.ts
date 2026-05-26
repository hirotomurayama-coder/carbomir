import "server-only";

import { getSupabaseClient } from "@/lib/supabase";
import type {
  ComparisonMatrix,
  Entity,
  EntityRef,
  InboundRelation,
  OffsetsDbProject,
  RelationType,
  TimelineEvent,
} from "@/lib/types";
import {
  type EntityRow,
  type MatrixRow,
  type RelationRow,
  type TimelineEventRow,
  relationsToList,
  rowToEntity,
  rowToMatrix,
  rowToTimelineEvent,
} from "@/lib/data/mappers";
import {
  findEntityBySlug as seedFindEntityBySlug,
  findEntityRef as seedFindEntityRef,
  listPublishedEntities as seedListPublishedEntities,
  listInboundRelations as seedListInboundRelations,
} from "@/lib/data/entities";
import {
  findMatrixBySlug as seedFindMatrixBySlug,
  listPublishedMatrices as seedListPublishedMatrices,
} from "@/lib/data/comparisons";
import {
  findTimelineEventBySlug as seedFindTimelineEventBySlug,
  listPublishedTimelineEvents as seedListPublishedTimelineEvents,
} from "@/lib/data/timeline";
import {
  listInstruments as seedListInstruments,
  listMechanisms as seedListMechanisms,
  listCooperativeAgreements as seedListCooperativeAgreements,
  getOffsetsDbAggregates as seedGetOffsetsDbAggregates,
  listOffsetsDbProjects as seedListOffsetsDbProjects,
  findOffsetsDbProject as seedFindOffsetsDbProject,
} from "@/lib/data/atlas";
import {
  findCaseStudyBySlug as seedFindCaseStudyBySlug,
  listPublishedCaseStudies as seedListPublishedCaseStudies,
} from "@/lib/data/case-studies";
import {
  findFaqBySlug as seedFindFaqBySlug,
  listPublishedFaqs as seedListPublishedFaqs,
} from "@/lib/data/faqs";

/**
 * Server Component から呼ばれるデータアクセス層。
 * Supabase が設定済みなら DB を、未設定ならローカルシードを返す。
 * 純粋な DB row → TS 型変換は mappers.ts に分離 (テスト容易性のため)。
 */

/* ============================================================
 * Entities
 * ============================================================ */

export async function findEntityBySlug(slug: string): Promise<Entity | undefined> {
  const sb = getSupabaseClient();
  if (!sb) return seedFindEntityBySlug(slug);

  const { data: row, error } = await sb
    .from("entities")
    .select(
      "id, slug, type, name_ja, name_en, abbreviation, summary, sections, tags, status, last_reviewed_at, related_matrix_slugs, jurisdiction, established_year, operator, geographic_scope, website_url, credit_unit, parent_company, business_role, policy_status, next_milestone"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[queries.findEntityBySlug]", error);
    return seedFindEntityBySlug(slug);
  }
  if (!row) return undefined;

  const { data: rels, error: relErr } = await sb
    .from("entity_relations")
    .select("relation_type, notes, target:entities!to_entity_id(slug)")
    .eq("from_entity_id", row.id);

  if (relErr) console.error("[queries.findEntityBySlug.relations]", relErr);

  return rowToEntity(row as EntityRow, relationsToList((rels as RelationRow[]) ?? null));
}

export async function listPublishedEntities(): Promise<Entity[]> {
  const sb = getSupabaseClient();
  if (!sb) return seedListPublishedEntities();

  const { data, error } = await sb
    .from("entities")
    .select(
      "id, slug, type, name_ja, name_en, abbreviation, summary, sections, tags, status, last_reviewed_at, related_matrix_slugs, jurisdiction, established_year, operator, geographic_scope, website_url, credit_unit, parent_company, business_role, policy_status, next_milestone"
    )
    .eq("status", "published")
    .order("last_reviewed_at", { ascending: false });

  if (error) {
    console.error("[queries.listPublishedEntities]", error);
    return seedListPublishedEntities();
  }
  // 一覧表示では related は不要なので空配列で返す
  return (data as EntityRow[]).map((row) => rowToEntity(row, []));
}

/**
 * 与えられた slug を関係先 (to_entity) として持つ他 entities を集めて返す。
 * UI 上の「Referenced By」パネルで使う。
 */
export async function listInboundRelations(
  slug: string
): Promise<InboundRelation[]> {
  const sb = getSupabaseClient();
  if (!sb) return seedListInboundRelations(slug);

  // ターゲット entity の id を引く
  const { data: target, error: targetErr } = await sb
    .from("entities")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (targetErr || !target) {
    if (targetErr) console.error("[queries.listInboundRelations.target]", targetErr);
    return [];
  }

  type InboundRow = {
    relation_type: RelationType;
    notes: string | null;
    source:
      | { slug: string; name_ja: string; name_en: string | null; status: string }
      | { slug: string; name_ja: string; name_en: string | null; status: string }[]
      | null;
  };

  const { data, error } = await sb
    .from("entity_relations")
    .select(
      "relation_type, notes, source:entities!from_entity_id(slug, name_ja, name_en, status)"
    )
    .eq("to_entity_id", target.id);

  if (error) {
    console.error("[queries.listInboundRelations]", error);
    return seedListInboundRelations(slug);
  }

  const out: InboundRelation[] = [];
  for (const row of (data as InboundRow[]) ?? []) {
    const src = Array.isArray(row.source) ? row.source[0] : row.source;
    if (!src || src.status !== "published") continue;
    out.push({
      from_slug: src.slug,
      from_name_ja: src.name_ja,
      from_name_en: src.name_en ?? undefined,
      relation: row.relation_type,
      note: row.notes ?? undefined,
    });
  }
  return out;
}

export async function findEntityRef(slug: string): Promise<EntityRef | undefined> {
  const sb = getSupabaseClient();
  if (!sb) return seedFindEntityRef(slug);

  const { data, error } = await sb
    .from("entities")
    .select("slug, name_ja, name_en")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[queries.findEntityRef]", error);
    return seedFindEntityRef(slug);
  }
  if (!data) return undefined;
  return {
    slug: data.slug,
    name_ja: data.name_ja,
    name_en: data.name_en ?? undefined,
  };
}

/* ============================================================
 * Matrices
 * ============================================================ */

export async function findMatrixBySlug(
  slug: string
): Promise<ComparisonMatrix | undefined> {
  const sb = getSupabaseClient();
  if (!sb) return seedFindMatrixBySlug(slug);

  const { data, error } = await sb
    .from("comparison_matrices")
    .select(
      "slug, title, description, dimensions, entity_refs, cells, status, last_reviewed_at, category, tags"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[queries.findMatrixBySlug]", error);
    return seedFindMatrixBySlug(slug);
  }
  if (!data) return undefined;
  return rowToMatrix(data as MatrixRow);
}

export async function listPublishedMatrices(): Promise<ComparisonMatrix[]> {
  const sb = getSupabaseClient();
  if (!sb) return seedListPublishedMatrices();

  const { data, error } = await sb
    .from("comparison_matrices")
    .select(
      "slug, title, description, dimensions, entity_refs, cells, status, last_reviewed_at, category, tags"
    )
    .eq("status", "published")
    .order("last_reviewed_at", { ascending: false });

  if (error) {
    console.error("[queries.listPublishedMatrices]", error);
    return seedListPublishedMatrices();
  }
  return (data as MatrixRow[]).map(rowToMatrix);
}

/* ============================================================
 * Timeline events
 * ============================================================ */

export async function listPublishedTimelineEvents(): Promise<TimelineEvent[]> {
  const sb = getSupabaseClient();
  if (!sb) return seedListPublishedTimelineEvents();

  const { data, error } = await sb
    .from("timeline_events")
    .select(
      "slug, event_date, title, summary, content_md, category, importance, status, affected_entity_slugs, source_urls"
    )
    .eq("status", "published")
    .order("event_date", { ascending: false });

  if (error) {
    console.error("[queries.listPublishedTimelineEvents]", error);
    return seedListPublishedTimelineEvents();
  }
  return (data as TimelineEventRow[]).map(rowToTimelineEvent);
}

export async function findTimelineEventBySlug(
  slug: string
): Promise<TimelineEvent | undefined> {
  const sb = getSupabaseClient();
  if (!sb) return seedFindTimelineEventBySlug(slug);

  const { data, error } = await sb
    .from("timeline_events")
    .select(
      "slug, event_date, title, summary, content_md, category, importance, status, affected_entity_slugs, source_urls"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[queries.findTimelineEventBySlug]", error);
    return seedFindTimelineEventBySlug(slug);
  }
  if (!data) return undefined;
  return rowToTimelineEvent(data as TimelineEventRow);
}

/* ============================================================
 * Atlas (World Bank Carbon Pricing Dashboard)
 * 静的データセット。現状は seed 直読み (DB 化は将来検討)。
 * ============================================================ */

export async function listInstruments() {
  return seedListInstruments();
}

export async function listMechanisms() {
  return seedListMechanisms();
}

export async function listCooperativeAgreements() {
  return seedListCooperativeAgreements();
}

export async function getOffsetsDbAggregates() {
  return seedGetOffsetsDbAggregates();
}

export async function listOffsetsDbProjects() {
  const sb = getSupabaseClient();
  if (!sb) return seedListOffsetsDbProjects();

  // 11,640 件 ≦ デフォルトの PostgREST limit (1000) を超えるので
  // batch (range) で取得する。Supabase の `.range()` は inclusive。
  const BATCH = 1000;
  const out: OffsetsDbProjectRow[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await sb
      .from("offsets_db_projects")
      .select(
        "project_id, name, registry, country, category, project_type, status, is_compliance, issued, retired, proponent, project_url, first_issuance_at"
      )
      .order("issued", { ascending: false })
      .range(from, from + BATCH - 1);
    if (error) {
      console.error("[queries.listOffsetsDbProjects]", error);
      return seedListOffsetsDbProjects();
    }
    const rows = (data as OffsetsDbProjectRow[]) ?? [];
    out.push(...rows);
    if (rows.length < BATCH) break;
    from += BATCH;
  }
  return out.map(rowToOffsetsDbProject);
}

export async function findOffsetsDbProject(projectId: string) {
  const sb = getSupabaseClient();
  if (!sb) return seedFindOffsetsDbProject(projectId);

  const { data, error } = await sb
    .from("offsets_db_projects")
    .select(
      "project_id, name, registry, country, category, project_type, status, is_compliance, issued, retired, proponent, project_url, first_issuance_at"
    )
    .eq("project_id", projectId)
    .maybeSingle();

  if (error) {
    console.error("[queries.findOffsetsDbProject]", error);
    return seedFindOffsetsDbProject(projectId);
  }
  if (!data) return undefined;
  return rowToOffsetsDbProject(data as OffsetsDbProjectRow);
}

/* ------------------------------------------------------------
 * Filtered query (server-side filter/sort/pagination)
 * ------------------------------------------------------------ */

export type OffsetsDbSortKey = "issued" | "retired" | "name";

export type OffsetsDbProjectsQuery = {
  /** name / proponent / project_id への部分一致検索 */
  query?: string;
  registries?: string[];
  categories?: string[];
  statuses?: string[];
  /** issued > 0 のみ */
  onlyIssued?: boolean;
  sortKey?: OffsetsDbSortKey;
  /** 0-indexed */
  page?: number;
  pageSize?: number;
};

export type OffsetsDbProjectsResult = {
  rows: OffsetsDbProject[];
  totalCount: number;
};

export type OffsetsDbFilterOptions = {
  registries: string[];
  categories: string[];
  statuses: string[];
};

const OFFSETS_DEFAULT_PAGE_SIZE = 50;

/**
 * フィルタ・ソート・ページネーション付きで OffsetsDB プロジェクトを取得する。
 * Supabase 接続時は PostgREST、未接続時は seed in-memory フィルタ。
 */
export async function listOffsetsDbProjectsFiltered(
  params: OffsetsDbProjectsQuery
): Promise<OffsetsDbProjectsResult> {
  const sortKey: OffsetsDbSortKey = params.sortKey ?? "issued";
  const page = Math.max(0, params.page ?? 0);
  const pageSize = params.pageSize ?? OFFSETS_DEFAULT_PAGE_SIZE;

  const sb = getSupabaseClient();
  if (!sb) {
    return seedListOffsetsDbProjectsFiltered(params, sortKey, page, pageSize);
  }

  // ---- Supabase クエリ構築 ----
  let q = sb
    .from("offsets_db_projects")
    .select(
      "project_id, name, registry, country, category, project_type, status, is_compliance, issued, retired, proponent, project_url, first_issuance_at",
      { count: "exact" }
    );

  if (params.registries && params.registries.length > 0) {
    q = q.in("registry", params.registries);
  }
  if (params.categories && params.categories.length > 0) {
    q = q.in("category", params.categories);
  }
  if (params.statuses && params.statuses.length > 0) {
    q = q.in("status", params.statuses);
  }
  if (params.onlyIssued) {
    q = q.gt("issued", 0);
  }
  if (params.query) {
    // ilike pattern の % / _ と PostgREST .or() 区切り文字 , ) ( を strip して安全化
    const safe = params.query
      .replace(/[%_]/g, " ")
      .replace(/[,()]/g, " ")
      .trim();
    if (safe.length > 0) {
      q = q.or(
        [
          `name.ilike.%${safe}%`,
          `proponent.ilike.%${safe}%`,
          `project_id.ilike.%${safe}%`,
        ].join(",")
      );
    }
  }

  if (sortKey === "name") {
    q = q.order("name", { ascending: true });
  } else {
    q = q.order(sortKey, { ascending: false, nullsFirst: false });
  }

  const from = page * pageSize;
  q = q.range(from, from + pageSize - 1);

  const { data, error, count } = await q;
  if (error) {
    console.error("[queries.listOffsetsDbProjectsFiltered]", error);
    return seedListOffsetsDbProjectsFiltered(params, sortKey, page, pageSize);
  }
  return {
    rows: ((data as OffsetsDbProjectRow[]) ?? []).map(rowToOffsetsDbProject),
    totalCount: count ?? 0,
  };
}

function seedListOffsetsDbProjectsFiltered(
  params: OffsetsDbProjectsQuery,
  sortKey: OffsetsDbSortKey,
  page: number,
  pageSize: number
): OffsetsDbProjectsResult {
  const all = seedListOffsetsDbProjects();
  const registrySet =
    params.registries && params.registries.length > 0
      ? new Set(params.registries)
      : null;
  const categorySet =
    params.categories && params.categories.length > 0
      ? new Set(params.categories)
      : null;
  const statusSet =
    params.statuses && params.statuses.length > 0
      ? new Set(params.statuses)
      : null;
  const queryLower = params.query?.trim().toLowerCase();

  const filtered = all.filter((p) => {
    if (registrySet && !registrySet.has(p.registry)) return false;
    if (categorySet && !categorySet.has(p.category ?? "unknown")) return false;
    if (statusSet && !statusSet.has(p.status ?? "unknown")) return false;
    if (params.onlyIssued && (!p.issued || p.issued <= 0)) return false;
    if (queryLower) {
      const hay = [
        p.name,
        p.proponent ?? "",
        p.project_id,
        p.country ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(queryLower)) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    if (sortKey === "name") return a.name.localeCompare(b.name);
    return (b[sortKey] ?? 0) - (a[sortKey] ?? 0);
  });

  const start = page * pageSize;
  return {
    rows: filtered.slice(start, start + pageSize),
    totalCount: filtered.length,
  };
}

/**
 * フィルタドロップダウン用の選択肢一覧。
 * aggregates.json (集計済) を流用するので Supabase 接続有無に関係なく定数コスト。
 */
export async function getOffsetsDbFilterOptions(): Promise<OffsetsDbFilterOptions> {
  const agg = seedGetOffsetsDbAggregates();
  return {
    registries: agg.by_registry.map((r) => r.registry).sort(),
    categories: agg.by_category.map((r) => r.category).sort(),
    statuses: agg.by_status.map((r) => r.status).sort(),
  };
}

type OffsetsDbProjectRow = {
  project_id: string;
  name: string;
  registry: string;
  country: string | null;
  category: string | null;
  project_type: string | null;
  status: string | null;
  is_compliance: boolean;
  issued: number | string; // numeric は string で返ることがある
  retired: number | string;
  proponent: string | null;
  project_url: string | null;
  first_issuance_at: string | null;
};

function rowToOffsetsDbProject(row: OffsetsDbProjectRow) {
  return {
    project_id: row.project_id,
    name: row.name,
    registry: row.registry,
    country: row.country ?? undefined,
    category: row.category ?? undefined,
    project_type: row.project_type ?? undefined,
    status: row.status ?? undefined,
    is_compliance: row.is_compliance,
    issued: typeof row.issued === "string" ? Number(row.issued) : row.issued,
    retired: typeof row.retired === "string" ? Number(row.retired) : row.retired,
    proponent: row.proponent ?? undefined,
    project_url: row.project_url ?? undefined,
    first_issuance_at: row.first_issuance_at ?? undefined,
  };
}

/* ============================================================
 * Case Studies + FAQ
 * ============================================================ */

export async function listPublishedCaseStudies() {
  return seedListPublishedCaseStudies();
}

export async function findCaseStudyBySlug(slug: string) {
  return seedFindCaseStudyBySlug(slug);
}

export async function listPublishedFaqs() {
  return seedListPublishedFaqs();
}

export async function findFaqBySlug(slug: string) {
  return seedFindFaqBySlug(slug);
}

/* ============================================================
 * Slug helpers
 * ============================================================ */

export async function listPublishedEntitySlugs(): Promise<string[]> {
  const sb = getSupabaseClient();
  if (!sb) return seedListPublishedEntities().map((e) => e.slug);

  const { data, error } = await sb
    .from("entities")
    .select("slug")
    .eq("status", "published");

  if (error) {
    console.error("[queries.listPublishedEntitySlugs]", error);
    return seedListPublishedEntities().map((e) => e.slug);
  }
  return (data ?? []).map((r) => r.slug);
}
