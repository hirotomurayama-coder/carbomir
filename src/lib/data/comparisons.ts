import "server-only";

import type { ComparisonMatrix } from "@/lib/types";
import { findBySlug, listAll } from "./content-store";

/**
 * 比較行列のシードデータアクセス層.
 * Phase Ε で JSON 個別ファイル化済み (data/content/matrices/*.json).
 */

export function listPublishedMatrices(): ComparisonMatrix[] {
  return listAll<ComparisonMatrix>("matrices").filter(
    (m) => m.status === "published"
  );
}

export function findMatrixBySlug(slug: string): ComparisonMatrix | undefined {
  return findBySlug<ComparisonMatrix>("matrices", slug);
}
