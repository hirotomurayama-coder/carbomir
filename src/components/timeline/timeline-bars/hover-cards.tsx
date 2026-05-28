import type { TimelineEvent } from "@/lib/types";
import { TIMELINE_CATEGORY_LABEL } from "@/lib/types";
import {
  type EventStatus,
  STATUS_BAR_BG,
  STATUS_LABEL_COLOR,
  STATUS_LABEL_JA,
} from "./constants";

/**
 * タイムラインのホバーカード (点イベント用 / 期間イベント用).
 */

export function EventHoverCard({
  event,
  status,
}: {
  event: TimelineEvent;
  status: EventStatus;
}) {
  return (
    <div className="rounded-md border border-border bg-popover text-popover-foreground shadow-xl p-3.5 text-[12.5px] leading-relaxed">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="metric-number text-[10.5px] text-accent font-semibold">
          {event.event_date}
        </span>
        <span className="label-mono text-muted-foreground text-[10px]">
          {TIMELINE_CATEGORY_LABEL[event.category]}
        </span>
        <span
          className={`inline-flex items-center gap-1 label-mono text-[10px] ${STATUS_LABEL_COLOR[status]}`}
        >
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${STATUS_BAR_BG[status]}`} />
          {STATUS_LABEL_JA[status]}
        </span>
        <span className="ml-auto label-mono text-muted-foreground text-[10px]">
          {"★".repeat(event.importance)}
          <span className="opacity-30">{"★".repeat(5 - event.importance)}</span>
        </span>
      </div>

      <p className="font-semibold text-foreground leading-snug mb-1.5">
        {event.title}
      </p>

      <p className="text-foreground/80 leading-relaxed line-clamp-4 mb-2 text-[12px]">
        {event.summary}
      </p>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border label-mono text-muted-foreground">
        {event.affected_entity_slugs.length > 0 ? (
          <span>
            影響:{" "}
            <span className="metric-number text-foreground">
              {event.affected_entity_slugs.length}
            </span>{" "}
            エンティティ
          </span>
        ) : (
          <span>&nbsp;</span>
        )}
        <span className="text-accent">クリックで詳細 →</span>
      </div>
    </div>
  );
}

export function PeriodHoverCard({
  event,
  status,
}: {
  event: TimelineEvent;
  status: EventStatus;
}) {
  return (
    <div className="rounded-md border border-border bg-popover text-popover-foreground shadow-xl p-3.5 text-[12.5px] leading-relaxed">
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <span className="metric-number text-[10.5px] text-accent font-semibold">
          {event.event_date}
        </span>
        <span className="text-muted-foreground/70 text-[10px]">→</span>
        <span className="metric-number text-[10.5px] text-accent font-semibold">
          {event.event_end_date}
        </span>
        <span className="label-mono text-muted-foreground text-[10px]">
          {TIMELINE_CATEGORY_LABEL[event.category]}
        </span>
        <span
          className={`inline-flex items-center gap-1 label-mono text-[10px] ${STATUS_LABEL_COLOR[status]}`}
        >
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full ${STATUS_BAR_BG[status]}`}
          />
          {STATUS_LABEL_JA[status]}
        </span>
      </div>

      <p className="font-semibold text-foreground leading-snug mb-1.5">
        {event.title}
      </p>

      <p className="text-foreground/80 leading-relaxed line-clamp-4 mb-2 text-[12px]">
        {event.summary}
      </p>

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border label-mono text-muted-foreground">
        <span className="label-mono text-[10px] text-muted-foreground">
          期間イベント
        </span>
        <span className="text-accent">クリックで詳細 →</span>
      </div>
    </div>
  );
}
