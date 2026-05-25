import type { Metadata } from "next";
import Link from "next/link";
import { Clock, CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  listPublishedEntities,
  listPublishedTimelineEvents,
} from "@/lib/data/queries";
import { parseMilestone } from "@/lib/policies-calendar";
import type { TimelineEvent } from "@/lib/types";
import { TimelineBars } from "@/components/timeline/timeline-bars";
import { TimelineExplorer } from "@/components/timeline/timeline-explorer";
import { NowHotPanel } from "@/components/timeline/now-hot-panel";

export const metadata: Metadata = {
  title: "時系列",
  description:
    "カーボンクレジット領域の規制・市場・技術・メソドロジーに関わる主要な節目を時系列で追跡する。直近 2 年〜未来 3 年を中心に、現在進行形のステータスを可視化。",
};

/**
 * 時系列ページ.
 *
 * 設計判断:
 *   - 旧版は丸ドット中心 + 全期間 (1997-2026) 表示で、現在進行形が見えづらかった.
 *   - 新版はバー型 + 「今」マーカー + status 色分け + 直近 5 年デフォルト.
 *   - 規制カレンダー (entity の next_milestone) も統合表示する.
 */

export default async function TimelineIndexPage() {
  const [rawEvents, entities] = await Promise.all([
    listPublishedTimelineEvents(),
    listPublishedEntities(),
  ]);

  // 規制 entity の next_milestone を timeline 風に変換して統合
  const regulationEntities = entities.filter((e) => e.type === "regulation");
  const milestoneSynthetic: TimelineEvent[] = [];
  for (const ent of regulationEntities) {
    const m = parseMilestone(ent);
    if (!m) continue;
    milestoneSynthetic.push({
      slug: `milestone-${ent.slug}`,
      event_date: m.date_iso,
      title: `${ent.name_ja}: ${m.content.slice(0, 60)}`,
      summary: `${ent.name_ja} の次のマイルストーン。${m.content}`,
      category: "regulatory",
      importance: 4, // milestone は概ね中程度の重要度
      affected_entity_slugs: [ent.slug],
      source_urls: [],
      status: "published",
    });
  }

  // マージ + 重複排除なし (synthetic は別 slug プレフィックスなので衝突しない)
  const allEvents = [...rawEvents, ...milestoneSynthetic];

  const entityNameMap: Record<string, string> = {};
  for (const e of entities) entityNameMap[e.slug] = e.name_ja;

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
            >
              <Clock className="h-2.5 w-2.5 mr-1" />
              {rawEvents.length.toString().padStart(2, "0")} Events ·{" "}
              {milestoneSynthetic.length.toString().padStart(2, "0")} Milestones
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            時系列
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
            規制・市場・技術・メソドロジー領域の主要な節目を時系列で追跡。直近
            2 年〜未来 3 年を中心に、現在進行形のステータスを可視化。
            <span className="text-foreground/85">
              {" "}
              規制カレンダーも統合表示
            </span>
            。
          </p>
        </div>
      </header>

      {/* 1. 今ホット (現在進行形) */}
      <div className="mb-8">
        <NowHotPanel events={allEvents} />
      </div>

      {/* 2. バー型タイムライン */}
      <div className="mb-8">
        <div className="mb-2 flex items-baseline justify-between gap-3 flex-wrap px-1">
          <h2 className="label-mono text-foreground">タイムライン</h2>
          <span className="label-mono text-muted-foreground text-[10.5px]">
            イベント + 規制マイルストーン 統合表示
          </span>
        </div>
        <TimelineBars events={allEvents} />
      </div>

      {/* 3. リスト (chronological) */}
      <div>
        <div className="mb-2 flex items-baseline justify-between gap-3 flex-wrap px-1">
          <h2 className="label-mono text-foreground">イベント一覧</h2>
          <Link
            href="/policies"
            className="inline-flex items-center gap-1.5 label-mono text-accent text-[10.5px] hover:underline"
          >
            <CalendarClock className="h-3 w-3" />
            政策・規制一覧 (テーブル) を開く →
          </Link>
        </div>
        <TimelineExplorer
          events={rawEvents}
          entityNameMap={entityNameMap}
        />
      </div>
    </div>
  );
}
