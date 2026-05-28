import type { Metadata } from "next";
import {
  listPublishedEntities,
  listPublishedMatrices,
  listPublishedTimelineEvents,
} from "@/lib/data/queries";
import { selectMatrixInboundTimeline, type DurabilityTimelineRef } from "@/lib/durability";
import {
  WatchlistView,
  type EntityWatchEntry,
  type MatrixWatchEntry,
} from "@/components/watchlist/watchlist-view";

export const metadata: Metadata = {
  title: "ウォッチリスト",
  description:
    "フォロー中の規制・手法・比較に効く変化を集約。規制変更で判断が腐る前に追う。",
};

/**
 * ウォッチリスト (STRATEGY §10).
 *
 * フォロー対象は client (localStorage) が持つので、ここでは全 entity / matrix の
 * 「変化インデックス」(timeline 被参照・next_milestone) をサーバーで構築して
 * client に渡し、WatchlistView がフォロー中の部分だけを描画する。
 */
export default async function WatchlistPage() {
  const [entities, matrices, events] = await Promise.all([
    listPublishedEntities(),
    listPublishedMatrices(),
    listPublishedTimelineEvents(),
  ]);

  // entity slug → この entity に効く timeline (event_date 降順)
  const entityTimeline: Record<string, DurabilityTimelineRef[]> = {};
  for (const e of events) {
    for (const s of e.affected_entity_slugs) {
      (entityTimeline[s] ??= []).push({
        slug: e.slug,
        title: e.title,
        event_date: e.event_date,
        category: e.category,
      });
    }
  }
  for (const s of Object.keys(entityTimeline)) {
    entityTimeline[s].sort((a, b) => b.event_date.localeCompare(a.event_date));
  }

  const entityIndex: Record<string, EntityWatchEntry> = {};
  for (const e of entities) {
    entityIndex[e.slug] = {
      label: e.name_ja,
      type: e.type,
      nextMilestone: e.next_milestone,
      policyStatus: e.policy_status,
      timeline: entityTimeline[e.slug] ?? [],
    };
  }

  const matrixIndex: Record<string, MatrixWatchEntry> = {};
  for (const m of matrices) {
    matrixIndex[m.slug] = {
      label: m.title,
      timeline: selectMatrixInboundTimeline(
        m.entities.map((x) => x.slug),
        events
      ),
    };
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <WatchlistView
      entityIndex={entityIndex}
      matrixIndex={matrixIndex}
      today={today}
    />
  );
}
