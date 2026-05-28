import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, Clock, Scale, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { listPublishedEntities } from "@/lib/data/queries";
import { parseMilestone, type CalendarEntry } from "@/lib/policies-calendar";
import { CalendarExplorer } from "@/components/policies/calendar-explorer";
import { PaywallBadge } from "@/components/paywall-badge";

export const metadata: Metadata = {
  title: "規制カレンダー",
  description:
    "カーボン関連の各国/地域の規制マイルストーンを年別・jurisdiction 別に俯瞰。直近 90 日 / 1 年 / 全期間のフィルタで「次に何が動くか」を即把握できる。",
};

/**
 * 規制カレンダー (独立ビュー).
 *
 * 設計判断:
 *   - 時系列ページ (/timeline) は「過去〜未来の俯瞰」=時間軸視点。
 *   - 規制カレンダーは「次に何が動くか」=アクション軸視点。
 *   - キラーシナリオ「規制変更キャッチアップ」では後者が直接的な入口。
 *   - データソース: 政策・規制 entity の next_milestone (パース可能なマイルストーンを集約)。
 */
export default async function PoliciesCalendarPage() {
  const all = await listPublishedEntities();
  const regulations = all.filter((e) => e.type === "regulation");

  const entries: CalendarEntry[] = regulations
    .map((e) => parseMilestone(e))
    .filter((e): e is CalendarEntry => e !== null)
    .sort((a, b) => a.date_sort_key.localeCompare(b.date_sort_key));

  const upcoming = entries.filter((e) => e.days_from_today >= 0).length;
  const next90 = entries.filter(
    (e) => e.days_from_today >= 0 && e.days_from_today <= 90
  ).length;

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <CalendarClock className="h-2.5 w-2.5 mr-1" />
            {entries.length.toString().padStart(2, "0")} Milestones
          </Badge>
          {next90 > 0 && (
            <Badge
              variant="outline"
              className="font-mono text-[10px] tracking-wider uppercase border-amber-500/40 text-amber-600 dark:text-amber-400"
            >
              {next90.toString().padStart(2, "0")} in 90d
            </Badge>
          )}
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-muted-foreground/30 text-muted-foreground"
          >
            {upcoming.toString().padStart(2, "0")} Upcoming
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          規制カレンダー
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
          各国/地域の規制マイルストーンを集約。jurisdiction × 時間軸でフィルタし、次に動く制度を即把握できる。
          各エントリは政策・規制 entity の <code className="font-mono text-foreground/85">next_milestone</code> から自動構成。
        </p>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Link
            href="/policies"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/40 text-foreground/80 hover:bg-muted/60 transition-colors text-xs font-medium"
          >
            <Scale className="h-3.5 w-3.5" />
            政策・規制 一覧へ
          </Link>
          <Link
            href="/timeline"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/40 text-foreground/80 hover:bg-muted/60 transition-colors text-xs font-medium"
          >
            <Clock className="h-3.5 w-3.5" />
            時系列 (全イベント統合) へ
          </Link>
          <span className="inline-flex items-center gap-1.5">
            <a
              href="/carbomir/policies/calendar/feed.ics"
              download="carbomir-regulation-calendar.ics"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-accent/40 bg-accent/10 text-accent hover:bg-accent/15 transition-colors text-xs font-medium"
              title="Google Calendar / Outlook / Apple Calendar に取り込める ICS 形式"
            >
              <Download className="h-3.5 w-3.5" />
              .ics をダウンロード
            </a>
            <PaywallBadge tier="pro" />
          </span>
        </div>
      </header>

      <CalendarExplorer entries={entries} />
    </div>
  );
}
