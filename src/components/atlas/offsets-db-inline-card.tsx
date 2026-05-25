import Link from "next/link";
import { Database, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { OffsetsDbRegistryStat } from "@/lib/types";

/**
 * Entity 詳細サイドバー用の OffsetsDB 統計カード.
 * Verra VCS / Gold Standard 等、Carbomir entity が OffsetsDB の registry と
 * 紐付くときに、該当 registry の累計プロジェクト・発行・償却数を表示し、
 * フィルタ済みプロジェクト一覧へ deep link する。
 */

type Props = {
  /** OffsetsDB registry code (例: "verra", "gold-standard") */
  registry: string;
  /** registry の集計レコード */
  stat: OffsetsDbRegistryStat;
};

function fmtMt(v: number): string {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k`;
  return v.toString();
}

const REGISTRY_DISPLAY: Record<string, string> = {
  verra: "Verra (VCS)",
  "gold-standard": "Gold Standard",
};

export function OffsetsDbInlineCard({ registry, stat }: Props) {
  const projectsUrl = `/atlas/offsets-db/projects?registry=${encodeURIComponent(registry)}`;
  const retiredPct = stat.issued > 0 ? (stat.retired / stat.issued) * 100 : 0;
  return (
    <Card className="bg-gradient-to-br from-card to-muted/30">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <Database className="h-2.5 w-2.5 mr-1" />
            OffsetsDB Atlas
          </Badge>
        </div>
        <p className="label-mono text-muted-foreground mb-1">
          {REGISTRY_DISPLAY[registry] ?? registry}
        </p>

        <dl className="space-y-2 mb-3">
          <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-2">
            <dt className="label-mono text-muted-foreground self-center">プロジェクト</dt>
            <dd className="metric-number text-lg font-bold text-foreground leading-none">
              {stat.projects.toLocaleString()}
            </dd>
          </div>
          <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-2">
            <dt className="label-mono text-muted-foreground self-center">累計発行</dt>
            <dd className="metric-number text-base font-semibold text-accent leading-none">
              {fmtMt(stat.issued)} <span className="text-[10px] text-muted-foreground font-normal">tCO2e</span>
            </dd>
          </div>
          <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-2">
            <dt className="label-mono text-muted-foreground self-center">累計償却</dt>
            <dd className="metric-number text-base font-semibold text-foreground/85 leading-none">
              {fmtMt(stat.retired)} <span className="text-[10px] text-muted-foreground font-normal">tCO2e</span>
            </dd>
          </div>
        </dl>

        {/* 償却率の bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between label-mono text-muted-foreground mb-1">
            <span>償却率</span>
            <span className="metric-number text-foreground">
              {retiredPct.toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded bg-muted overflow-hidden">
            <div
              className="h-full bg-accent/70"
              style={{ width: `${Math.min(100, retiredPct)}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Link
            href={projectsUrl}
            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:bg-accent/90 transition-colors"
          >
            プロジェクト一覧へ
            <ExternalLink className="h-3 w-3" />
          </Link>
          <Link
            href="/atlas/offsets-db"
            className="label-mono text-muted-foreground hover:text-foreground text-center"
          >
            OffsetsDB Overview ↗
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
