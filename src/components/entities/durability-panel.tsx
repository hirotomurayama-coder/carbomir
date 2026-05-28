import Link from "next/link";
import { Radar, CalendarClock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  POLICY_STATUS_LABEL,
  TIMELINE_CATEGORY_LABEL,
  type EntityType,
  type PolicyStatus,
} from "@/lib/types";
import {
  parseMilestone,
  splitTimelineByDate,
  type DurabilityTimelineRef,
} from "@/lib/durability";

/**
 * 監視ポイント (Durability) パネル — STRATEGY §3③ / §5.
 *
 * ツールの③アウトカム「決めたことが今も有効か」を可視化する。
 * 旧来サイドバーに分かれていた「次の節目」(MetadataPanel) と timeline 被参照
 * (In Timeline カード) を、前向き (予定された変化) と直近に整理して 1 つにまとめ、
 * 「この判断が変わりうる条件を編集部が追う」という監視の物語として提示する。
 */

const UNSTABLE: PolicyStatus[] = ["transition", "pilot", "draft"];
const CHANGED: PolicyStatus[] = ["discontinued", "stayed"];
// 判断 (買う/使う) の前提になりやすい type は「判断が変わりうる」と踏み込んで言う
const DECISION_TYPES: EntityType[] = ["regulation", "methodology", "market"];

const STATUS_NOTE_CLASS: Record<"unstable" | "changed", string> = {
  unstable:
    "border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  changed: "border-red-500/35 bg-red-500/10 text-red-700 dark:text-red-300",
};

type Props = {
  entityType: EntityType;
  policyStatus?: PolicyStatus;
  nextMilestone?: string;
  nextReviewAt?: string;
  /** この entity を参照している timeline イベント (event_date 降順で渡る) */
  timeline: DurabilityTimelineRef[];
  /** 基準日 YYYY-MM-DD (予定/直近の判定) */
  today: string;
};

export function DurabilityPanel({
  entityType,
  policyStatus,
  nextMilestone,
  nextReviewAt,
  timeline,
  today,
}: Props) {
  const { upcoming, recent } = splitTimelineByDate(timeline, today);
  const milestone = nextMilestone ? parseMilestone(nextMilestone) : null;
  const statusNote = policyStatus
    ? UNSTABLE.includes(policyStatus)
      ? ("unstable" as const)
      : CHANGED.includes(policyStatus)
        ? ("changed" as const)
        : null
    : null;

  const hasSignal =
    !!milestone ||
    upcoming.length > 0 ||
    recent.length > 0 ||
    !!nextReviewAt ||
    !!statusNote;
  if (!hasSignal) return null;

  const tagline = DECISION_TYPES.includes(entityType)
    ? "この判断が変わりうる条件を編集部が追う。"
    : "関連する制度・市場の動きを編集部が追う。";

  const recentShown = recent.slice(0, 6);
  const recentRest = recent.length - recentShown.length;

  return (
    <Card className="border-accent/25 bg-accent/[0.03]">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-1">
          <Radar className="h-3.5 w-3.5 text-accent" aria-hidden />
          <p className="label-mono text-accent">監視ポイント</p>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          {tagline}
        </p>

        <div className="space-y-4">
          {milestone && (
            <div>
              <p className="label-mono text-muted-foreground mb-1.5 flex items-center gap-1">
                <CalendarClock className="h-3 w-3" aria-hidden /> 次の節目
              </p>
              <p className="text-xs text-foreground/90 leading-relaxed">
                {milestone.dateLabel && (
                  <span className="metric-number text-accent mr-1.5">
                    {milestone.dateLabel}
                  </span>
                )}
                {milestone.content}
              </p>
            </div>
          )}

          {upcoming.length > 0 && (
            <div>
              <p className="label-mono text-muted-foreground mb-2">
                予定されている動き
              </p>
              <ul className="space-y-2">
                {upcoming.map((e) => (
                  <li key={e.slug}>
                    <Link href={`/timeline/${e.slug}`} className="group block">
                      <span className="metric-number text-[10.5px] text-accent block mb-0.5">
                        {e.event_date} · {TIMELINE_CATEGORY_LABEL[e.category]}
                      </span>
                      <span className="text-xs font-medium text-foreground group-hover:text-accent block leading-snug">
                        {e.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recentShown.length > 0 && (
            <div>
              <p className="label-mono text-muted-foreground mb-2">直近の動き</p>
              <ul className="space-y-2">
                {recentShown.map((e) => (
                  <li key={e.slug}>
                    <Link href={`/timeline/${e.slug}`} className="group block">
                      <span className="metric-number text-[10.5px] text-muted-foreground block mb-0.5">
                        {e.event_date} · {TIMELINE_CATEGORY_LABEL[e.category]}
                      </span>
                      <span className="text-xs font-medium text-foreground group-hover:text-accent block leading-snug">
                        {e.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              {recentRest > 0 && (
                <Link
                  href="/timeline"
                  className="inline-block mt-2 label-mono text-accent hover:underline"
                >
                  他 {recentRest} 件の関連動向 →
                </Link>
              )}
            </div>
          )}

          {statusNote && (
            <p
              className={`text-xs leading-relaxed rounded border px-2 py-1.5 ${STATUS_NOTE_CLASS[statusNote]}`}
            >
              制度ステータス: {POLICY_STATUS_LABEL[policyStatus!]}。
              {statusNote === "unstable"
                ? "細目が動く可能性があり継続注視。"
                : "効力に変化あり。要再確認。"}
            </p>
          )}

          {nextReviewAt && (
            <div className="pt-3 border-t border-border/60">
              <p className="label-mono text-muted-foreground">
                編集部の次回チェック{" "}
                <span className="metric-number text-foreground/80 ml-1">
                  {nextReviewAt}
                </span>
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
