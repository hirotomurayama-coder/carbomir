import "server-only";

import { getSupabaseClient } from "@/lib/supabase";
import type {
  ComparisonMatrix,
  Entity,
  EntityRef,
  InboundRelation,
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
  return seedListOffsetsDbProjects();
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
