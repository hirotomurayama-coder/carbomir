import "server-only";

import type { TimelineEvent } from "@/lib/types";
import { findBySlug, listAll } from "./content-store";

/**
 * 時系列イベントのシードデータアクセス層.
 * Phase Ε で JSON 個別ファイル化済み (data/content/timeline/*.json).
 */

export function listPublishedTimelineEvents(): TimelineEvent[] {
  return listAll<TimelineEvent>("timeline").filter(
    (e) => e.status === "published"
  );
}

export function findTimelineEventBySlug(
  slug: string
): TimelineEvent | undefined {
  return findBySlug<TimelineEvent>("timeline", slug);
}
