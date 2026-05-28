import "server-only";

import { getSupabaseClient } from "@/lib/supabase";
import type {
  Entity,
  EntityRef,
  InboundRelation,
  RelationType,
} from "@/lib/types";
import {
  type EntityRow,
  type RelationRow,
  relationsToList,
  rowToEntity,
} from "@/lib/data/mappers";
import {
  findEntityBySlug as seedFindEntityBySlug,
  findEntityRef as seedFindEntityRef,
  listPublishedEntities as seedListPublishedEntities,
  listInboundRelations as seedListInboundRelations,
} from "@/lib/data/entities";

const ENTITY_COLUMNS =
  "id, slug, type, name_ja, name_en, abbreviation, summary, sections, tags, status, last_reviewed_at, related_matrix_slugs, jurisdiction, established_year, operator, geographic_scope, website_url, credit_unit, parent_company, business_role, policy_status, next_milestone";

export async function findEntityBySlug(slug: string): Promise<Entity | undefined> {
  const sb = getSupabaseClient();
  if (!sb) return seedFindEntityBySlug(slug);

  const { data: row, error } = await sb
    .from("entities")
    .select(ENTITY_COLUMNS)
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
    .select(ENTITY_COLUMNS)
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
