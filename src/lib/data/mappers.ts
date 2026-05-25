/**
 * DB row → TS 型の純粋マッパー。
 * server-only を含まないので Vitest からも import 可能。
 * queries.ts はこれらを呼び出すだけのアダプタとして機能する。
 */

import type {
  ComparisonCell,
  ComparisonDimension,
  ComparisonMatrix,
  Entity,
  EntityRef,
  EntityRelation,
  EntitySection,
  EntityType,
  MatrixCategory,
  PolicyStatus,
  RelationType,
  TimelineCategory,
  TimelineEvent,
  TimelineImportance,
  TimelineSource,
} from "@/lib/types";

export type EntityRow = {
  id: string;
  slug: string;
  type: EntityType;
  name_ja: string;
  name_en: string | null;
  abbreviation: string | null;
  summary: string | null;
  sections: EntitySection[] | null;
  tags: string[] | null;
  status: Entity["status"];
  last_reviewed_at: string | null;
  related_matrix_slugs: string[] | null;
  jurisdiction: string | null;
  established_year: number | null;
  operator: string | null;
  geographic_scope: string | null;
  website_url: string | null;
  credit_unit: string | null;
  parent_company: string | null;
  business_role: string | null;
  policy_status: PolicyStatus | null;
  next_milestone: string | null;
};

export type RelationRow = {
  relation_type: RelationType;
  notes: string | null;
  target: { slug: string } | { slug: string }[] | null;
};

export type MatrixRow = {
  slug: string;
  title: string;
  description: string | null;
  dimensions: ComparisonDimension[] | null;
  entity_refs: EntityRef[] | null;
  cells: Record<string, Record<string, ComparisonCell>> | null;
  status: ComparisonMatrix["status"];
  last_reviewed_at: string | null;
  category: MatrixCategory | null;
  tags: string[] | null;
};

export type TimelineEventRow = {
  slug: string;
  event_date: string;
  title: string;
  summary: string | null;
  content_md: string | null;
  category: TimelineCategory;
  importance: TimelineImportance;
  status: TimelineEvent["status"];
  affected_entity_slugs: string[] | null;
  source_urls: TimelineSource[] | null;
};

export function relationsToList(rels: RelationRow[] | null): EntityRelation[] {
  if (!rels) return [];
  const out: EntityRelation[] = [];
  for (const r of rels) {
    const target = Array.isArray(r.target) ? r.target[0] : r.target;
    if (!target?.slug) continue;
    out.push({
      to_slug: target.slug,
      relation: r.relation_type,
      note: r.notes ?? undefined,
    });
  }
  return out;
}

export function rowToEntity(row: EntityRow, related: EntityRelation[]): Entity {
  return {
    slug: row.slug,
    type: row.type,
    name_ja: row.name_ja,
    name_en: row.name_en ?? undefined,
    abbreviation: row.abbreviation ?? undefined,
    summary: row.summary ?? "",
    sections: row.sections ?? [],
    related,
    related_matrix_slugs: row.related_matrix_slugs ?? [],
    tags: row.tags ?? [],
    last_reviewed_at: row.last_reviewed_at ?? "",
    status: row.status,
    jurisdiction: row.jurisdiction ?? undefined,
    established_year: row.established_year ?? undefined,
    operator: row.operator ?? undefined,
    geographic_scope: row.geographic_scope ?? undefined,
    website_url: row.website_url ?? undefined,
    credit_unit: row.credit_unit ?? undefined,
    parent_company: row.parent_company ?? undefined,
    business_role: row.business_role ?? undefined,
    policy_status: row.policy_status ?? undefined,
    next_milestone: row.next_milestone ?? undefined,
  };
}

export function rowToMatrix(row: MatrixRow): ComparisonMatrix {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description ?? "",
    dimensions: row.dimensions ?? [],
    entities: row.entity_refs ?? [],
    cells: row.cells ?? {},
    last_reviewed_at: row.last_reviewed_at ?? "",
    status: row.status,
    category: row.category ?? undefined,
    tags: row.tags ?? undefined,
  };
}

export function rowToTimelineEvent(row: TimelineEventRow): TimelineEvent {
  return {
    slug: row.slug,
    event_date: row.event_date,
    title: row.title,
    summary: row.summary ?? "",
    content_md: row.content_md ?? undefined,
    category: row.category,
    importance: row.importance,
    affected_entity_slugs: row.affected_entity_slugs ?? [],
    source_urls: row.source_urls ?? [],
    status: row.status,
  };
}
