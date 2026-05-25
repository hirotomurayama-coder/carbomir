import "server-only";

import type { FAQItem } from "@/lib/types";
import { findBySlug, listAll } from "./content-store";

/**
 * FAQ のシードデータアクセス層.
 * Phase Ε で JSON 個別ファイル化済み (data/content/faqs/*.json).
 */

export function listPublishedFaqs(): FAQItem[] {
  return listAll<FAQItem>("faqs").filter((f) => f.status === "published");
}

export function findFaqBySlug(slug: string): FAQItem | undefined {
  return findBySlug<FAQItem>("faqs", slug);
}
