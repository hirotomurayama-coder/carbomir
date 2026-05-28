import "server-only";

import { getSupabaseClient } from "@/lib/supabase";
import type { TimelineEvent } from "@/lib/types";
import { type TimelineEventRow, rowToTimelineEvent } from "@/lib/data/mappers";
import {
  findTimelineEventBySlug as seedFindTimelineEventBySlug,
  listPublishedTimelineEvents as seedListPublishedTimelineEvents,
} from "@/lib/data/timeline";

const TIMELINE_COLUMNS =
  "slug, event_date, title, summary, content_md, category, importance, status, affected_entity_slugs, source_urls";

export async function listPublishedTimelineEvents(): Promise<TimelineEvent[]> {
  const sb = getSupabaseClient();
  if (!sb) return seedListPublishedTimelineEvents();

  const { data, error } = await sb
    .from("timeline_events")
    .select(TIMELINE_COLUMNS)
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
    .select(TIMELINE_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("[queries.findTimelineEventBySlug]", error);
    return seedFindTimelineEventBySlug(slug);
  }
  if (!data) return undefined;
  return rowToTimelineEvent(data as TimelineEventRow);
}
