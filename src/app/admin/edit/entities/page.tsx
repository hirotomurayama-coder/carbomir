import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AdminBanner } from "@/components/admin/admin-banner";
import { listAll } from "@/lib/data/content-store";
import type { Entity } from "@/lib/types";
import { ENTITY_TYPE_LABEL } from "@/lib/types";

export const metadata: Metadata = { title: "エンティティ編集" };
export const dynamic = "force-dynamic";

export default async function AdminEditEntitiesPage() {
  // published/draft 含めて全件 (編集対象)
  const items = listAll<Entity>("entities").sort((a, b) =>
    a.slug.localeCompare(b.slug)
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
            <Network className="h-2.5 w-2.5 mr-1" />
            Entities · {items.length.toString().padStart(2, "0")}
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          エンティティ編集
        </h1>
      </header>

      <AdminBanner />

      <Card className="overflow-hidden p-0">
        <ul className="divide-y divide-border">
          {items.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/admin/edit/entities/${e.slug}`}
                className="group flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors"
              >
                <span className="font-mono text-[10.5px] text-muted-foreground min-w-[110px] truncate">
                  {e.slug}
                </span>
                <span className="inline-flex items-center rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] text-foreground/70 shrink-0">
                  {ENTITY_TYPE_LABEL[e.type]}
                </span>
                <span className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground group-hover:text-accent truncate">
                    {e.name_ja}
                  </p>
                  {e.name_en && (
                    <p className="text-[10.5px] text-muted-foreground font-mono truncate">
                      {e.name_en}
                    </p>
                  )}
                </span>
                <span className="metric-number text-[10.5px] text-muted-foreground shrink-0">
                  {e.last_reviewed_at}
                </span>
                <span
                  className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono tracking-wider shrink-0 ${
                    e.status === "published"
                      ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : e.status === "draft"
                        ? "border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                        : "border border-border bg-muted/50 text-muted-foreground"
                  }`}
                >
                  {e.status}
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
