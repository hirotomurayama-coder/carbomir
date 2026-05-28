import "server-only";

import { getSupabaseClient } from "@/lib/supabase";
import type { ComparisonMatrix } from "@/lib/types";
import { type MatrixRow, rowToMatrix } from "@/lib/data/mappers";
import {
  findMatrixBySlug as seedFindMatrixBySlug,
  listPublishedMatrices as seedListPublishedMatrices,
} from "@/lib/data/comparisons";

const MATRIX_COLUMNS =
  "slug, title, description, dimensions, entity_refs, cells, status, last_reviewed_at, category, tags";

export async function findMatrixBySlug(
  slug: string
): Promise<ComparisonMatrix | undefined> {
  const sb = getSupabaseClient();
  if (!sb) return seedFindMatrixBySlug(slug);

  const { data, error } = await sb
    .from("comparison_matrices")
    .select(MATRIX_COLUMNS)
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
    .select(MATRIX_COLUMNS)
    .eq("status", "published")
    .order("last_reviewed_at", { ascending: false });

  if (error) {
    console.error("[queries.listPublishedMatrices]", error);
    return seedListPublishedMatrices();
  }
  return (data as MatrixRow[]).map(rowToMatrix);
}
