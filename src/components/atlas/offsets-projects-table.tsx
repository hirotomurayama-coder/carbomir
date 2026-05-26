import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { OffsetsDbProject } from "@/lib/types";

type Props = {
  rows: OffsetsDbProject[];
  registryLinkage: Record<string, string>;
};

const REGISTRY_LABEL: Record<string, string> = {
  verra: "Verra (VCS)",
  "gold-standard": "Gold Standard",
  "climate-action-reserve": "Climate Action Reserve",
  "american-carbon-registry": "American Carbon Registry",
  cercarbono: "CercaCarbono",
  isometric: "Isometric",
  "art-trees": "ART TREES",
};

function fmtNum(n?: number): string {
  if (n == null || n === 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return Math.round(n).toString();
}

/**
 * 純粋に渡された rows を描画する Server Component.
 * フィルタ・ソート・ページネーションは親側 (page.tsx + URL params) が担当。
 */
export function OffsetsProjectsTable({ rows, registryLinkage }: Props) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5 min-w-[280px]">
                Project
              </th>
              <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5">
                Registry
              </th>
              <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5">
                Category
              </th>
              <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5">
                Country
              </th>
              <th className="text-right label-mono text-muted-foreground font-normal px-4 py-2.5">
                Issued
              </th>
              <th className="text-right label-mono text-muted-foreground font-normal px-4 py-2.5">
                Retired
              </th>
              <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5">
                Status
              </th>
              <th className="w-12 px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center label-mono text-muted-foreground"
                >
                  該当するプロジェクトはありません
                </td>
              </tr>
            ) : (
              rows.map((p) => {
                const linkedRegistry = registryLinkage[p.registry];
                return (
                  <tr
                    key={p.project_id}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-2 align-top">
                      <Link
                        href={`/atlas/offsets-db/projects/${p.project_id}`}
                        className="font-medium text-foreground text-[13px] line-clamp-2 hover:text-accent transition-colors"
                      >
                        {p.name}
                      </Link>
                      <p className="font-mono text-[10.5px] text-muted-foreground mt-0.5">
                        {p.project_id}
                        {p.proponent && (
                          <>
                            {" · "}
                            <span className="text-muted-foreground/80">
                              {p.proponent.length > 40
                                ? p.proponent.slice(0, 40) + "…"
                                : p.proponent}
                            </span>
                          </>
                        )}
                      </p>
                    </td>
                    <td className="px-4 py-2 align-top">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10.5px] text-foreground/80">
                          {REGISTRY_LABEL[p.registry] ?? p.registry}
                        </span>
                        {linkedRegistry && (
                          <Link
                            href={`/entities/${linkedRegistry}`}
                            className="inline-flex items-center gap-0.5 rounded border border-accent/40 bg-accent/10 px-1 py-0 text-[9.5px] text-accent hover:bg-accent/20"
                          >
                            <ExternalLink className="h-2.5 w-2.5" />
                          </Link>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 align-top text-foreground/85 text-[12.5px]">
                      {p.category ?? "—"}
                    </td>
                    <td className="px-4 py-2 align-top text-foreground/85 text-[12.5px]">
                      {p.country ?? "—"}
                    </td>
                    <td className="px-4 py-2 align-top text-right metric-number text-[12.5px] text-foreground">
                      {fmtNum(p.issued)}
                    </td>
                    <td className="px-4 py-2 align-top text-right metric-number text-[12.5px] text-foreground">
                      {fmtNum(p.retired)}
                    </td>
                    <td className="px-4 py-2 align-top">
                      <Badge
                        variant="outline"
                        className={`font-mono text-[10px] tracking-wider ${
                          p.status === "registered" || p.status === "active"
                            ? "text-emerald-600 dark:text-emerald-400 border-emerald-600/40 dark:border-emerald-400/40"
                            : "text-muted-foreground border-border"
                        }`}
                      >
                        {p.status ?? "—"}
                      </Badge>
                    </td>
                    <td className="px-4 py-2 align-top text-right">
                      {p.project_url && (
                        <a
                          href={p.project_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-accent transition-colors"
                          aria-label="レジストリの公式ページを開く"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
