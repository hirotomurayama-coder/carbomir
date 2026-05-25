import type { Metadata } from "next";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  listPublishedEntities,
  listPublishedTimelineEvents,
} from "@/lib/data/queries";
import { TimelineCanvas } from "@/components/timeline/timeline-canvas";
import { TimelineExplorer } from "@/components/timeline/timeline-explorer";

export const metadata: Metadata = {
  title: "時系列",
  description:
    "Carbomir の時系列イベントベース。カーボンクレジット領域の規制・市場・技術・メソドロジーに関わる主要な節目を、影響を受ける制度・プレイヤーと紐付けて整理する。",
};

export default async function TimelineIndexPage() {
  const [events, entities] = await Promise.all([
    listPublishedTimelineEvents(),
    listPublishedEntities(),
  ]);
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
              {events.length.toString().padStart(2, "0")} Published
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            時系列
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
            規制・市場・技術・メソドロジー領域の主要な節目を、影響を受けるエンティティと紐付けて整理する。直近の出来事から遡って参照する想定。
          </p>
        </div>
      </header>

      {/* Hero: 構造化された時系列の統合ビジュアル */}
      <div className="mb-8">
        <div className="mb-2 flex items-baseline justify-between gap-3 flex-wrap">
          <h2 className="label-mono text-foreground">タイムライン (統合表示)</h2>
          <span className="label-mono text-muted-foreground">
            すべてのイベントをカテゴリレーン × 年軸で俯瞰
          </span>
        </div>
        <TimelineCanvas events={events} />
      </div>

      {/* 下: 個別イベントカード (フィルタ可) */}
      <div>
        <div className="mb-2 flex items-baseline justify-between gap-3 flex-wrap">
          <h2 className="label-mono text-foreground">イベント詳細</h2>
        </div>
        <TimelineExplorer events={events} entityNameMap={entityNameMap} />
      </div>
    </div>
  );
}
