import { NextResponse } from "next/server";
import {
  listPublishedEntities,
  listPublishedTimelineEvents,
} from "@/lib/data/queries";
import {
  parseMilestone,
  parseTimelineForCalendar,
  generateIcs,
  type IcsEntry,
} from "@/lib/policies-calendar";

/**
 * 規制カレンダー ICS フィード.
 *
 * URL: /carbomir/policies/calendar/feed.ics (basePath 込み)
 *
 * 含めるのは:
 *  - policy entity の next_milestone (パース成功分)
 *  - timeline event のうち未来日付 (今日以降) のもの
 *
 * Pro 機能の地ならし: 現状は誰でも DL 可能. 認証ゲートは Phase 4 で middleware に追加.
 */
export async function GET() {
  const [entities, events] = await Promise.all([
    listPublishedEntities(),
    listPublishedTimelineEvents(),
  ]);

  const policyEntries: IcsEntry[] = entities
    .filter((e) => e.type === "regulation")
    .map((e) => parseMilestone(e))
    .filter((e) => e !== null)
    .map((entry) => ({
      ...entry,
      ics_source: "policy" as const,
      detail_path: `/entities/${entry.slug}`,
    }));

  const timelineEntries: IcsEntry[] = events
    .map((ev) => parseTimelineForCalendar(ev))
    .filter((e) => e !== null)
    .map((entry) => ({
      ...entry,
      ics_source: "timeline" as const,
      detail_path: `/timeline/${entry.slug}`,
    }));

  const all = [...policyEntries, ...timelineEntries].sort((a, b) =>
    a.date_sort_key.localeCompare(b.date_sort_key)
  );

  const ics = generateIcs(all);

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="carbomir-regulation-calendar.ics"',
      // クライアント側で長くキャッシュされすぎないように.
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
