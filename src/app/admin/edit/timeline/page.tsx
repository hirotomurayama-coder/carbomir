import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AdminBanner } from "@/components/admin/admin-banner";
import { listAll } from "@/lib/data/content-store";
import type { TimelineEvent } from "@/lib/types";
import { TIMELINE_CATEGORY_LABEL } from "@/lib/types";

export const metadata: Metadata = { title: "時系列イベント編集" };
export const dynamic = "force-dynamic";

export default async function AdminEditTimelinePage() {
  const items = listAll<TimelineEvent>("timeline").sort((a, b) =>
    b.event_date.localeCompare(a.event_date)
  );
  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1100px] mx-auto">
      <nav className="mb-4">
        <Link
          href="/admin/edit"
          className="inline-flex items-center gap-1.5 label-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="font-mono">←</span> Content Editor
        </Link>
      </nav>

      <header className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <Clock className="h-2.5 w-2.5 mr-1" />
            Timeline · {items.length.toString().padStart(2, "0")}
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          時系列イベント編集
        </h1>
      </header>

      <AdminBanner />

      <Card className="overflow-hidden p-0">
        <ul className="divide-y divide-border">
          {items.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/admin/edit/timeline/${e.slug}`}
                className="group flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors"
              >
                <span className="metric-number text-[11px] text-muted-foreground min-w-[88px] shrink-0">
                  {e.event_date}
                </span>
                <span className="inline-flex items-center rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] text-foreground/70 shrink-0">
                  {TIMELINE_CATEGORY_LABEL[e.category]}
                </span>
                <span className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-accent truncate">
                    {e.title}
                  </p>
                </span>
                <span className="metric-number text-[10px] text-muted-foreground shrink-0">
                  importance {e.importance}/5
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-accent transition-colors shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
