import Link from "next/link";
import {
  Columns3,
  Network,
  Clock,
  Building2,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ENTITY_TYPE_LABEL,
  TIMELINE_CATEGORY_LABEL,
  type ComparisonMatrix,
  type Entity,
  type TimelineEvent,
} from "@/lib/types";

/**
 * Recent updates (横断更新シグナル) — アセット横断の鮮度シグナルカード.
 *
 * /editorial への入口を兼ねる。
 */

export type UpdateItem = {
  kind: "matrix" | "entity" | "player" | "timeline";
  slug: string;
  title: string;
  subtitle?: string;
  date: string;
  href: string;
};

/**
 * matrices / entities / events を横断して新しい順に最大 8 件のフラットリストを生成.
 */
export function getRecentUpdates(
  matrices: ComparisonMatrix[],
  entities: Entity[],
  events: TimelineEvent[]
): UpdateItem[] {
  const items: UpdateItem[] = [];
  for (const m of matrices) {
    items.push({
      kind: "matrix",
      slug: m.slug,
      title: m.title,
      subtitle: `${m.entities.length}×${m.dimensions.length} cells`,
      date: m.last_reviewed_at,
      href: `/matrices/${m.slug}`,
    });
  }
  for (const e of entities) {
    items.push({
      kind: e.type === "player" ? "player" : "entity",
      slug: e.slug,
      title: e.name_ja,
      subtitle:
        e.type === "player"
          ? (e.business_role ?? ENTITY_TYPE_LABEL[e.type])
          : ENTITY_TYPE_LABEL[e.type],
      date: e.last_reviewed_at,
      href: `/entities/${e.slug}`,
    });
  }
  for (const ev of events.slice(0, 5)) {
    items.push({
      kind: "timeline",
      slug: ev.slug,
      title: ev.title,
      subtitle: TIMELINE_CATEGORY_LABEL[ev.category],
      date: ev.event_date,
      href: `/timeline/${ev.slug}`,
    });
  }
  return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
}

export function RecentUpdatesCard({ updates }: { updates: UpdateItem[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
        <div>
          <CardTitle className="text-sm flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5 text-accent" />
            最近の更新 (横断)
          </CardTitle>
          <CardDescription className="mt-1 text-xs">
            アセット横断の鮮度シグナル。直近のレビュー日順
          </CardDescription>
        </div>
        <Link
          href="/editorial"
          className="inline-flex items-center gap-1 label-mono text-muted-foreground hover:text-accent transition-colors shrink-0"
        >
          <Sparkles className="h-3 w-3" />
          編集ステータス
        </Link>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {updates.map((u) => (
            <li key={`${u.kind}-${u.slug}`}>
              <Link
                href={u.href}
                className="group flex items-center gap-3 px-5 py-2.5 hover:bg-muted/40 transition-colors"
              >
                <KindIcon kind={u.kind} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate group-hover:text-accent">
                    {u.title}
                  </p>
                  {u.subtitle && (
                    <p className="text-[11px] text-muted-foreground truncate">
                      {u.subtitle}
                    </p>
                  )}
                </div>
                <span className="metric-number text-[10px] text-muted-foreground shrink-0">
                  {u.date}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function KindIcon({ kind }: { kind: UpdateItem["kind"] }) {
  if (kind === "matrix") {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/10 text-accent shrink-0">
        <Columns3 className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (kind === "entity") {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary dark:text-accent shrink-0">
        <Network className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (kind === "player") {
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary dark:text-accent shrink-0">
        <Building2 className="h-3.5 w-3.5" />
      </span>
    );
  }
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/10 text-accent shrink-0">
      <Clock className="h-3.5 w-3.5" />
    </span>
  );
}
