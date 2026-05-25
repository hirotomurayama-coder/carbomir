import Link from "next/link";
import { Globe2, Stamp, Database, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { AtlasLinks } from "@/lib/data/atlas";

/**
 * 「Atlas で深掘り」パネル。
 * matrix 詳細・timeline 詳細・entity の Related の各所で、対応する Atlas
 * データ (OffsetsDB / WB instrument / WB mechanism) へのリンクをまとめる。
 *
 * 各 row: entity 名 + 該当する Atlas データへのチップ群
 */

type EntityWithLinks = {
  slug: string;
  name_ja: string;
  links: AtlasLinks;
};

type Props = {
  /** 表示したい entities (matrix の場合は matrix.entities、timeline は affected_entity_slugs から解決) */
  entities: EntityWithLinks[];
  /** タイトル文字列 (オプション) */
  title?: string;
};

export function AtlasDeepDivePanel({ entities, title }: Props) {
  // links がどれかある entity のみ表示
  const usable = entities.filter(
    (e) => e.links.offsetsRegistry || e.links.instrumentUniqueId || e.links.mechanismName
  );
  if (usable.length === 0) return null;

  return (
    <Card className="overflow-hidden p-0">
      <div className="px-4 py-2.5 border-b border-border bg-muted/40 flex items-center justify-between">
        <h2 className="label-mono text-foreground flex items-center gap-1.5">
          <Globe2 className="h-3.5 w-3.5 text-accent" />
          {title ?? "Atlas で深掘り"}
        </h2>
        <span className="label-mono text-muted-foreground">
          {usable.length} / {entities.length} entities
        </span>
      </div>
      <ul className="divide-y divide-border">
        {usable.map((e) => (
          <li key={e.slug} className="px-4 py-3 flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-[140px]">
              <Link
                href={`/entities/${e.slug}`}
                className="text-sm font-medium text-foreground hover:text-accent"
              >
                {e.name_ja}
              </Link>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {e.links.offsetsRegistry && (
                <Link
                  href={`/atlas/offsets-db/projects?registry=${encodeURIComponent(e.links.offsetsRegistry)}`}
                  className="inline-flex items-center gap-1 rounded border border-accent/40 bg-accent/10 px-2 py-0.5 text-[11px] text-accent hover:bg-accent/20 transition-colors"
                >
                  <Database className="h-3 w-3" />
                  OffsetsDB
                  <ArrowUpRight className="h-2.5 w-2.5" />
                </Link>
              )}
              {e.links.mechanismName && (
                <Link
                  href="/atlas/mechanisms"
                  className="inline-flex items-center gap-1 rounded border border-border bg-muted/50 px-2 py-0.5 text-[11px] text-foreground/85 hover:border-accent/40 hover:text-accent transition-colors"
                  title={e.links.mechanismName}
                >
                  <Stamp className="h-3 w-3" />
                  WB Mechanism
                  <ArrowUpRight className="h-2.5 w-2.5" />
                </Link>
              )}
              {e.links.instrumentUniqueId && (
                <Link
                  href="/atlas/instruments"
                  className="inline-flex items-center gap-1 rounded border border-border bg-muted/50 px-2 py-0.5 text-[11px] text-foreground/85 hover:border-accent/40 hover:text-accent transition-colors"
                  title={e.links.instrumentUniqueId}
                >
                  <Globe2 className="h-3 w-3" />
                  WB Instrument
                  <ArrowUpRight className="h-2.5 w-2.5" />
                </Link>
              )}
              <Badge
                variant="outline"
                className="font-mono text-[9px] tracking-wider text-muted-foreground"
              >
                {e.slug}
              </Badge>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
