import Link from "next/link";
import { Clock, CalendarClock, ArrowUpRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TIMELINE_CATEGORY_LABEL, type Entity, type TimelineEvent } from "@/lib/types";
import { SectionHeader } from "./section-header";

/**
 * 「追う」セクション (主役) — 直近の規制動向 + 次マイルストーン.
 *
 * 設計方針 (アライメント結果 2026-05-25):
 *   キラーシナリオ「規制変更キャッチアップ」を Hero 直下に置くための主役 UI。
 */

export type UpcomingMilestone = {
  entity: Entity;
  dateLabel: string;
  content: string;
  sortKey: string;
};

/**
 * 政策エンティティから next_milestone 付きのものを抽出して、
 * 日付順 (近い順) にソート。「次マイルストーン カレンダー」用。
 *
 * next_milestone は文字列 "YYYY-MM-DD: 内容" or "YYYY: 内容" の形式想定。
 * 先頭の YYYY-MM-DD / YYYY-MM を抜き出して比較する。
 */
export function getUpcomingMilestones(entities: Entity[]): UpcomingMilestone[] {
  const out: UpcomingMilestone[] = [];
  for (const e of entities) {
    if (e.type !== "regulation" || !e.next_milestone) continue;
    const m = e.next_milestone.match(/^(\d{4}(?:-\d{2})?(?:-\d{2})?)\s*[::]\s*(.+)$/);
    if (m) {
      out.push({
        entity: e,
        dateLabel: m[1],
        content: m[2].trim(),
        sortKey: m[1].length === 4 ? `${m[1]}-12-31` : m[1].padEnd(10, "0"),
      });
    } else {
      out.push({
        entity: e,
        dateLabel: "",
        content: e.next_milestone,
        sortKey: "9999",
      });
    }
  }
  return out.sort((a, b) => a.sortKey.localeCompare(b.sortKey)).slice(0, 6);
}

export function TrackSection({
  recentEvents,
  upcomingMilestones,
  totalEvents,
  totalPolicies,
}: {
  recentEvents: TimelineEvent[];
  upcomingMilestones: UpcomingMilestone[];
  totalEvents: number;
  totalPolicies: number;
}) {
  return (
    <section className="mb-10">
      <SectionHeader
        label="追う"
        description={`規制・市場・技術の動向を時系列で。直近イベント ${totalEvents} 件 / 規制トラッカー ${totalPolicies} 件`}
        cta={{ href: "/timeline", text: "時系列を全件見る" }}
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* 直近の規制動向 */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-accent" />
              直近の規制動向
            </CardTitle>
            <CardDescription className="text-xs">
              編集論点つきで、新着の制度・市場イベントを深掘りする入口
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {recentEvents.map((ev) => (
                <li key={ev.slug}>
                  <Link
                    href={`/timeline/${ev.slug}`}
                    className="group flex items-start gap-3 px-5 py-3 hover:bg-muted/30 transition-colors"
                  >
                    <span className="metric-number text-[10.5px] text-muted-foreground shrink-0 mt-0.5 min-w-[68px]">
                      {ev.event_date}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground group-hover:text-accent leading-snug">
                        {ev.title}
                      </p>
                      <p className="text-[11.5px] text-muted-foreground leading-relaxed line-clamp-2 mt-0.5">
                        {ev.summary}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="inline-flex items-center rounded border border-border bg-muted/40 px-1.5 py-0 text-[10px] text-foreground/70">
                          {TIMELINE_CATEGORY_LABEL[ev.category]}
                        </span>
                        {ev.affected_entity_slugs.length > 0 && (
                          <span className="label-mono text-muted-foreground">
                            影響: {ev.affected_entity_slugs.length} エンティティ
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 次マイルストーン */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CalendarClock className="h-3.5 w-3.5 text-accent" />
              次マイルストーン
            </CardTitle>
            <CardDescription className="text-xs">
              規制カレンダー — policy_status と next_milestone から
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {upcomingMilestones.length === 0 ? (
                <li className="px-5 py-4 label-mono text-muted-foreground text-center">
                  予定中のマイルストーンはありません
                </li>
              ) : (
                upcomingMilestones.map((m) => (
                  <li key={m.entity.slug}>
                    <Link
                      href={`/entities/${m.entity.slug}`}
                      className="group flex items-start gap-3 px-5 py-3 hover:bg-muted/30 transition-colors"
                    >
                      <span className="metric-number text-[10.5px] text-accent shrink-0 mt-0.5 min-w-[68px] font-semibold">
                        {m.dateLabel || "—"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground group-hover:text-accent leading-snug">
                          {m.entity.name_ja}
                        </p>
                        <p className="text-[11.5px] text-muted-foreground leading-relaxed line-clamp-2 mt-0.5">
                          {m.content}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
            <div className="px-5 py-2.5 border-t border-border bg-muted/20">
              <Link
                href="/timeline"
                className="inline-flex items-center gap-1 label-mono text-accent hover:underline"
              >
                時系列・規制カレンダー (統合) を開く
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
