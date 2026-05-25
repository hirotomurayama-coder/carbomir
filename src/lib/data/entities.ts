import "server-only";

import type { Entity, InboundRelation } from "@/lib/types";
import { findBySlug, listAll } from "./content-store";

/**
 * エンティティのシードデータアクセス層.
 *
 * Phase Ε (2026-05-25) で JSON 個別ファイル化:
 *   元の TS リテラルは data/content/entities/*.json に移行済み.
 *   実体は content-store 経由で動的に読み込む.
 *   dev では JSON ファイルの変更が即時反映される (MODE=fresh).
 */

export function listPublishedEntities(): Entity[] {
  return listAll<Entity>("entities").filter((e) => e.status === "published");
}

export function findEntityBySlug(slug: string): Entity | undefined {
  return findBySlug<Entity>("entities", slug);
}

export function findEntityRef(
  slug: string
): { slug: string; name_ja: string; name_en?: string } | undefined {
  const e = findEntityBySlug(slug);
  if (!e) return undefined;
  return { slug: e.slug, name_ja: e.name_ja, name_en: e.name_en };
}

export function listInboundRelations(slug: string): InboundRelation[] {
  const out: InboundRelation[] = [];
  for (const e of listAll<Entity>("entities")) {
    if (e.slug === slug) continue;
    if (e.status !== "published") continue;
    for (const r of e.related) {
      if (r.to_slug !== slug) continue;
      out.push({
        from_slug: e.slug,
        from_name_ja: e.name_ja,
        from_name_en: e.name_en,
        relation: r.relation,
        note: r.note,
      });
    }
  }
  return out;
}
