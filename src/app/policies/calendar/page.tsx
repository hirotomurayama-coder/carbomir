import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listPublishedEntities } from "@/lib/data/queries";
import { CalendarExplorer } from "@/components/policies/calendar-explorer";
import { parseMilestone, type CalendarEntry } from "@/lib/policies-calendar";

export const metadata: Metadata = {
  title: "規制カレンダー",
  description:
    "カーボンクレジット領域の規制マイルストーンを時系列で俯瞰。GX-ETS / CBAM / EU ETS / 中国 ETS 等の次の節目を一画面で。",
};

/**
 * 規制カレンダー (シナリオ 3: 規制キャッチアップ の中核ビュー).
 *
 * 政策エンティティ (type=regulation) の next_milestone を縦時系列で並べる。
 * 日付プレフィックス "YYYY[-MM[-DD]]:" を持つマイルストーンのみ対象。
 */
export default async function PoliciesCalendarPage() {
  const entities = await listPublishedEntities();
  const policies = entities.filter((e) => e.type === "regulation");

  const all: CalendarEntry[] = policies
    .map(parseMilestone)
    .filter((x): x is CalendarEntry => x !== null)
    .sort((a, b) => a.date_sort_key.localeCompare(b.date_sort_key));

  const unparsed = policies.filter(
    (p) => p.next_milestone && parseMilestone(p) === null
  );
  const empty = policies.filter((p) => !p.next_milestone);

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1200px] mx-auto">
      <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
            >
              <CalendarClock className="h-2.5 w-2.5 mr-1" />
              Regulatory Calendar
            </Badge>
            <span className="metric-number text-[10.5px] text-muted-foreground">
              {all.length.toString().padStart(2, "0")} milestones
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            規制カレンダー
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
            各国/地域の主要規制の次のマイルストーンを時系列で俯瞰。
            CSR / サスティナビリティ担当者の中期計画策定・キャッチアップ用ビュー。
          </p>
        </div>
        <Link
          href="/policies"
          className="inline-flex items-center gap-1.5 label-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <Flag className="h-3 w-3" />
          政策・規制 (一覧)
        </Link>
      </header>

      <CalendarExplorer entries={all} />

      {/* カレンダー外の制度 */}
      {(unparsed.length > 0 || empty.length > 0) && (
        <section className="mt-10">
          <h2 className="label-mono text-foreground mb-3">
            カレンダー外の制度
          </h2>
          <Card>
            <CardContent className="p-5 text-sm text-muted-foreground leading-relaxed">
              <p className="mb-3">
                以下の制度は <strong>カレンダー外</strong> (next_milestone 日付プレフィックスなし or 未登録)。
                編集 UI から「YYYY-MM-DD: 内容」形式で追加するとカレンダーに表示されます。
              </p>
              {unparsed.length > 0 && (
                <div className="mb-3">
                  <p className="label-mono text-foreground mb-1.5">
                    日付なし ({unparsed.length})
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {unparsed.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/admin/edit/entities/${p.slug}`}
                          className="inline-flex items-center rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10.5px] text-amber-700 dark:text-amber-300 hover:bg-amber-500/15"
                          title={p.next_milestone ?? ""}
                        >
                          {p.name_ja}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {empty.length > 0 && (
                <div>
                  <p className="label-mono text-foreground mb-1.5">
                    未登録 ({empty.length})
                  </p>
                  <ul className="flex flex-wrap gap-1.5">
                    {empty.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/admin/edit/entities/${p.slug}`}
                          className="inline-flex items-center rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10.5px] text-muted-foreground hover:bg-muted/60"
                        >
                          {p.name_ja}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
