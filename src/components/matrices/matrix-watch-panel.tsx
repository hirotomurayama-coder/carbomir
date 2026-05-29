import Link from "next/link";
import { Radar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { DURABILITY_RISK_LABEL, TIMELINE_CATEGORY_LABEL } from "@/lib/types";
import {
  distinctDurabilityRisks,
  splitTimelineByDate,
  type DurabilityTimelineRef,
} from "@/lib/durability";

/**
 * 比較行列の「監視中の動き」パネル (STRATEGY §3③ / §5).
 *
 * 比較表は調達レディネスの「弾薬」(ammunition) だが、前提 (手法改訂・適格性判定・
 * 規制変更) が動けば比較は腐る。行 entity に効く timeline を予定/直近に分け、
 * 「この比較の前提が動きうる」ことを可視化する (matrix 版の維持レンズ)。
 */

type Props = {
  /** 行 entity 群に効く timeline (event_date 降順で渡る) */
  timeline: DurabilityTimelineRef[];
  /** 基準日 YYYY-MM-DD */
  today: string;
};

function EventRow({ e, dim }: { e: DurabilityTimelineRef; dim?: boolean }) {
  return (
    <Link href={`/timeline/${e.slug}`} className="group block">
      <span className="flex items-center gap-1.5 mb-0.5">
        <span
          className={`metric-number text-[10.5px] ${dim ? "text-muted-foreground" : "text-accent"}`}
        >
          {e.event_date} · {TIMELINE_CATEGORY_LABEL[e.category]}
        </span>
        {e.durability_risk && (
          <span className="inline-flex items-center rounded border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-1 py-0 text-[9.5px] label-mono">
            {DURABILITY_RISK_LABEL[e.durability_risk]}
          </span>
        )}
      </span>
      <span className="text-xs font-medium text-foreground group-hover:text-accent block leading-snug">
        {e.title}
      </span>
    </Link>
  );
}

export function MatrixWatchPanel({ timeline, today }: Props) {
  if (timeline.length === 0) return null;
  const { upcoming, recent } = splitTimelineByDate(timeline, today);
  const recentShown = recent.slice(0, 6);
  const recentRest = recent.length - recentShown.length;
  const risks = distinctDurabilityRisks(timeline);

  return (
    <Card className="border-accent/25 bg-accent/[0.03]">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-1">
          <Radar className="h-3.5 w-3.5 text-accent" aria-hidden />
          <p className="label-mono text-accent">監視ポイント</p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-3">
          下記の動向で比較の前提 (手法・適格性・規制) が変わりうる。編集部が追う。
        </p>

        {risks.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap mb-4">
            <span className="label-mono text-muted-foreground text-[10px]">
              監視中の観点
            </span>
            {risks.map((r) => (
              <span
                key={r}
                className="inline-flex items-center rounded border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-1.5 py-0 text-[10px] label-mono"
              >
                {DURABILITY_RISK_LABEL[r]}
              </span>
            ))}
          </div>
        )}

        <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {upcoming.length > 0 && (
            <div>
              <p className="label-mono text-muted-foreground mb-2">
                予定されている動き
              </p>
              <ul className="space-y-2.5">
                {upcoming.slice(0, 6).map((e) => (
                  <li key={e.slug}>
                    <EventRow e={e} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {recentShown.length > 0 && (
            <div>
              <p className="label-mono text-muted-foreground mb-2">直近の動き</p>
              <ul className="space-y-2.5">
                {recentShown.map((e) => (
                  <li key={e.slug}>
                    <EventRow e={e} dim />
                  </li>
                ))}
              </ul>
              {recentRest > 0 && (
                <Link
                  href="/timeline"
                  className="inline-block mt-2.5 label-mono text-accent hover:underline"
                >
                  他 {recentRest} 件の関連動向 →
                </Link>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
