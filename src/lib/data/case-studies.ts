import "server-only";

import type { CaseStudy } from "@/lib/types";
import { findBySlug, listAll } from "./content-store";

/**
 * ケーススタディのシードデータアクセス層.
 * Phase Ε で JSON 個別ファイル化済み (data/content/case-studies/*.json).
 */

export function listPublishedCaseStudies(): CaseStudy[] {
  return listAll<CaseStudy>("case-studies").filter(
    (s) => s.status === "published"
  );
}

export function findCaseStudyBySlug(slug: string): CaseStudy | undefined {
  return findBySlug<CaseStudy>("case-studies", slug);
}
