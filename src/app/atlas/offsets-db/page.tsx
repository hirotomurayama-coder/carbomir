import type { Metadata } from "next";
import Link from "next/link";
import { Database, ExternalLink, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getOffsetsDbAggregates } from "@/lib/data/queries";
import { getOffsetsRegistryLinkedEntity } from "@/lib/data/atlas";
import { WorldBubbleMap } from "@/components/atlas/world-bubble-map";
import { DonutChart } from "@/components/atlas/atlas-charts";
import { jurisdictionToIso3 } from "@/lib/data/country-geo";
import {
  OFFSETS_DB_SOURCE_LABEL,
  OFFSETS_DB_SOURCE_URL,
  OFFSETS_DB_TERMS_URL,
} from "@/lib/types";

export const metadata: Metadata = {
  title: "OffsetsDB (世界のオフセットプロジェクト)",
  description:
    "CarbonPlan OffsetsDB が集約する全 11,640 件のオフセットプロジェクトと累計 28 億 t-CO2 のクレジット発行データ。",
};

function fmtMt(kt: number): string {
  return `${(kt / 1_000_000).toFixed(1)}M`;
}

function fmtNum(n: number): string {
  return n.toLocaleString();
}

const REGISTRY_LABEL: Record<string, string> = {
  verra: "Verra (VCS)",
  "gold-standard": "Gold Standard",
  "climate-action-reserve": "Climate Action Reserve",
  "american-carbon-registry": "American Carbon Registry",
  cercarbono: "CercaCarbono",
  isometric: "Isometric",
  "art-trees": "ART TREES",
};

const REGISTRY_COLORS = [
  "#0ea5e9", // sky
  "#10b981", // emerald
  "#a855f7", // violet
  "#f59e0b", // amber
  "#ef4444", // red
  "#14b8a6", // teal
  "#ec4899", // pink
];

const PROJECT_TYPE_COLORS = [
  "#0ea5e9",
  "#10b981",
  "#a855f7",
  "#f59e0b",
  "#ef4444",
];

export default async function OffsetsDbPage() {
  const a = await getOffsetsDbAggregates();
  const maxRegistryProjects = Math.max(...a.by_registry.map((r) => r.projects));
  const maxCategoryProjects = Math.max(...a.by_category.map((r) => r.projects));
  const maxCountryProjects = Math.max(
    ...a.by_country_top30.map((r) => r.projects)
  );

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <Database className="h-2.5 w-2.5 mr-1" />
            Atlas / OffsetsDB
          </Badge>
          <Badge variant="secondary" className="font-mono text-[10px] tracking-wider">
            {a.totals.registries} registries · {a.totals.countries} countries
          </Badge>
          <Badge variant="outline" className="font-mono text-[10px] tracking-wider">
            Snapshot {a.source.generated_at.slice(0, 10)}
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          世界のオフセットプロジェクト集約 (OffsetsDB)
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          CarbonPlan が 7 主要レジストリ (Verra / Gold Standard / CAR / ACR / ART
          TREES / CercaCarbono / Isometric) から集約した{" "}
          <strong className="text-foreground">{fmtNum(a.totals.projects)} プロジェクト</strong>{" "}
          と <strong className="text-foreground">{fmtNum(a.totals.credits_transactions)}{" "}
          件の取引記録</strong> から計算した集計指標。プロジェクト個別の探索は{" "}
          <Link href="/atlas/offsets-db/projects" className="text-accent hover:underline">
            /atlas/offsets-db/projects
          </Link>{" "}
          へ。
        </p>
        <p className="label-mono text-muted-foreground mt-2">
          Source:{" "}
          <a
            href={OFFSETS_DB_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline inline-flex items-center gap-1 normal-case"
          >
            <ExternalLink className="h-3 w-3" />
            {OFFSETS_DB_SOURCE_LABEL}
          </a>{" "}
          ·{" "}
          <a
            href={OFFSETS_DB_TERMS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground underline underline-offset-2 normal-case"
          >
            Terms of Data Access
          </a>
        </p>
      </header>

      {/* Totals */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TotalCard label="プロジェクト数" value={fmtNum(a.totals.projects)} unit="projects" />
        <TotalCard
          label="累計発行"
          value={fmtMt(a.totals.total_issued)}
          unit="tCO2e issued"
          accent
        />
        <TotalCard
          label="累計償却"
          value={fmtMt(a.totals.total_retired)}
          unit="tCO2e retired"
        />
        <TotalCard
          label="取引履歴"
          value={fmtNum(a.totals.credits_transactions)}
          unit="transactions"
        />
      </section>

      {/* === World bubble map: project distribution === */}
      <section className="mb-8">
        <div className="mb-3 flex items-baseline justify-between gap-3 flex-wrap">
          <h2 className="label-mono text-foreground">プロジェクト所在 — 世界マップ</h2>
          <span className="label-mono text-muted-foreground text-[10.5px]">
            円サイズ = プロジェクト件数 (Top 30 国)
          </span>
        </div>
        <Card className="p-4">
          <WorldBubbleMap
            data={a.by_country_top30
              .map((r) => {
                const iso3 = jurisdictionToIso3(r.label);
                if (!iso3) return null;
                return {
                  iso3,
                  count: r.projects,
                  primaryType: r.projects > 1000 ? "Top" : r.projects > 200 ? "Mid" : "Other",
                  label: `件 (${(r.issued / 1e6).toFixed(1)}M tCO2e 発行)`,
                };
              })
              .filter((x): x is NonNullable<typeof x> => x !== null)}
            sizeScale={1.0}
            legend={[
              { key: "Top", label: "Top (>1,000 件)", color: "#a855f7" },
              { key: "Mid", label: "Mid (200-1,000)", color: "#0ea5e9" },
              { key: "Other", label: "その他", color: "#94a3b8" },
            ]}
          />
        </Card>
      </section>

      {/* === Project type donut + Status donut === */}
      <section className="mb-8 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <p className="label-mono text-muted-foreground mb-3">
            レジストリ別プロジェクト数
          </p>
          <DonutChart
            segments={a.by_registry
              .sort((x, y) => y.projects - x.projects)
              .slice(0, 7)
              .map((r, i) => ({
                label: REGISTRY_LABEL[r.registry] ?? r.registry,
                value: r.projects,
                color: REGISTRY_COLORS[i] ?? "#94a3b8",
              }))}
            total={a.totals.projects}
            centerLabel={fmtNum(a.totals.projects)}
            centerSubLabel="projects"
          />
        </Card>
        <Card className="p-5">
          <p className="label-mono text-muted-foreground mb-3">
            プロジェクトタイプ Top 5
          </p>
          <DonutChart
            segments={a.project_types_top20.slice(0, 5).map((t, i) => ({
              label: t.label,
              value: t.count,
              color: PROJECT_TYPE_COLORS[i] ?? "#94a3b8",
            }))}
            total={a.project_types_top20
              .slice(0, 5)
              .reduce((s, t) => s + t.count, 0)}
            centerLabel={fmtNum(
              a.project_types_top20.slice(0, 5).reduce((s, t) => s + t.count, 0)
            )}
            centerSubLabel="top 5 合計"
          />
        </Card>
      </section>

      {/* By registry */}
      <section className="mb-8">
        <h2 className="label-mono text-foreground mb-3">レジストリ別</h2>
        <Card className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5">Registry</th>
                <th className="text-right label-mono text-muted-foreground font-normal px-4 py-2.5">Projects</th>
                <th className="text-right label-mono text-muted-foreground font-normal px-4 py-2.5">Issued (tCO2e)</th>
                <th className="text-right label-mono text-muted-foreground font-normal px-4 py-2.5">Retired (tCO2e)</th>
                <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5">分布</th>
              </tr>
            </thead>
            <tbody>
              {a.by_registry.map((r) => {
                const linked = getOffsetsRegistryLinkedEntity(r.registry);
                const pct = (r.projects / maxRegistryProjects) * 100;
                return (
                  <tr key={r.registry} className="border-t border-border">
                    <td className="px-4 py-2.5 align-middle">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-foreground">
                          {REGISTRY_LABEL[r.registry] ?? r.registry}
                        </span>
                        {linked && (
                          <Link
                            href={`/entities/${linked}`}
                            className="inline-flex items-center gap-0.5 rounded border border-accent/40 bg-accent/10 px-1 py-0 text-[9.5px] text-accent hover:bg-accent/20"
                          >
                            <ExternalLink className="h-2.5 w-2.5" />
                            Carbomir
                          </Link>
                        )}
                      </div>
                      <p className="font-mono text-[10.5px] text-muted-foreground mt-0.5">
                        {r.registry}
                      </p>
                    </td>
                    <td className="px-4 py-2.5 text-right metric-number text-foreground">
                      {fmtNum(r.projects)}
                    </td>
                    <td className="px-4 py-2.5 text-right metric-number text-foreground/85">
                      {fmtMt(r.issued)}
                    </td>
                    <td className="px-4 py-2.5 text-right metric-number text-foreground/85">
                      {fmtMt(r.retired)}
                    </td>
                    <td className="px-4 py-2.5 align-middle">
                      <div className="w-full max-w-[200px] h-2 rounded bg-muted overflow-hidden">
                        <div
                          className="h-full bg-accent"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </section>

      {/* By category & By country */}
      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden p-0">
          <div className="px-4 py-2.5 border-b border-border bg-muted/40">
            <h2 className="label-mono text-foreground">プロジェクト分野別</h2>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {a.by_category.map((r) => {
                const pct = (r.projects / maxCategoryProjects) * 100;
                return (
                  <tr key={r.category} className="border-t border-border first:border-t-0">
                    <td className="px-4 py-2 align-middle text-foreground text-[13px]">
                      {r.category}
                    </td>
                    <td className="px-4 py-2 text-right metric-number text-foreground w-[80px]">
                      {fmtNum(r.projects)}
                    </td>
                    <td className="px-4 py-2 align-middle w-[150px]">
                      <div className="w-full h-1.5 rounded bg-muted overflow-hidden">
                        <div
                          className="h-full bg-accent/70"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="px-4 py-2.5 border-b border-border bg-muted/40 flex items-center justify-between">
            <h2 className="label-mono text-foreground">プロジェクト所在国 (Top 15)</h2>
            <span className="label-mono text-muted-foreground">{a.totals.countries} countries total</span>
          </div>
          <table className="w-full text-sm">
            <tbody>
              {a.by_country_top30.slice(0, 15).map((r) => {
                const pct = (r.projects / maxCountryProjects) * 100;
                return (
                  <tr key={r.label} className="border-t border-border first:border-t-0">
                    <td className="px-4 py-2 align-middle text-foreground text-[13px]">
                      {r.label}
                    </td>
                    <td className="px-4 py-2 text-right metric-number text-foreground w-[80px]">
                      {fmtNum(r.projects)}
                    </td>
                    <td className="px-4 py-2 align-middle w-[150px]">
                      <div className="w-full h-1.5 rounded bg-muted overflow-hidden">
                        <div
                          className="h-full bg-accent/70"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Year-over-year */}
      <section className="mb-8">
        <Card className="overflow-hidden p-0">
          <div className="px-4 py-2.5 border-b border-border bg-muted/40">
            <h2 className="label-mono text-foreground">年別の発行・償却フロー</h2>
          </div>
          <YearlyFlowChart years={a.by_year} />
        </Card>
      </section>

      {/* Project types */}
      <section className="mb-8">
        <Card className="overflow-hidden p-0">
          <div className="px-4 py-2.5 border-b border-border bg-muted/40">
            <h2 className="label-mono text-foreground">プロジェクトタイプ (Top 12)</h2>
          </div>
          <div className="p-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {a.project_types_top20.slice(0, 12).map((t) => (
              <div
                key={t.label}
                className="flex items-center justify-between px-3 py-2 rounded border border-border bg-card"
              >
                <span className="text-sm text-foreground truncate">{t.label}</span>
                <span className="metric-number text-xs text-muted-foreground shrink-0">
                  {fmtNum(t.count)}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Explore */}
      <Card className="bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border-accent/30">
        <CardContent className="p-5">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/15 text-accent shrink-0">
              <Database className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">
                プロジェクト個別を探す ({fmtNum(a.totals.projects)} 件)
              </p>
              <p className="text-xs text-muted-foreground">
                Registry / Category / Country / Status でフィルタ可能なテーブル
              </p>
            </div>
            <Link
              href="/atlas/offsets-db/projects"
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:bg-accent/90 transition-colors"
            >
              開く
              <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardContent className="p-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">Source notice</strong>:
            このページは{" "}
            <a
              href={OFFSETS_DB_SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              CarbonPlan OffsetsDB
            </a>
            の MIT ライセンス公開データから Carbomir が集計を計算したもの。元データは Verra / Gold Standard / CAR / ACR / ART TREES / CercaCarbono / Isometric が各レジストリで公開する事実情報。各レジストリの権利関係は{" "}
            <a
              href={OFFSETS_DB_TERMS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              Terms of Data Access
            </a>{" "}
            を参照。
          </p>
          <p>
            <strong className="text-foreground">Snapshot</strong>: 生成日{" "}
            <span className="metric-number text-foreground">
              {a.source.generated_at.slice(0, 10)}
            </span>
            。Carbomir 同期は{" "}
            <span className="metric-number text-foreground">
              {a.source.synced_at_utc.slice(0, 10)}
            </span>
            。再同期は{" "}
            <code className="font-mono text-[12px] px-1 mx-0.5 bg-muted/60 rounded border border-border">
              python3 scripts/sync-offsets-db.py
            </code>{" "}
            で実行。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function TotalCard({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string;
  unit: string;
  accent?: boolean;
}) {
  return (
    <Card className="p-4">
      <p className="label-mono text-muted-foreground mb-1">{label}</p>
      <p
        className={`metric-number text-2xl font-bold tracking-tight leading-none mb-1 ${
          accent ? "text-accent" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p className="label-mono text-muted-foreground/80">{unit}</p>
    </Card>
  );
}

function YearlyFlowChart({
  years,
}: {
  years: { year: number; issued: number; retired: number }[];
}) {
  const max = Math.max(...years.flatMap((y) => [y.issued, y.retired]));
  return (
    <div className="p-4">
      <div className="flex items-end gap-1 h-[180px]">
        {years.map((y) => {
          const issuedH = (y.issued / max) * 100;
          const retiredH = (y.retired / max) * 100;
          return (
            <div
              key={y.year}
              className="flex flex-col items-center gap-0.5 flex-1 min-w-0 group"
              title={`${y.year}: issued ${(y.issued / 1e6).toFixed(1)}M, retired ${(y.retired / 1e6).toFixed(1)}M`}
            >
              <div className="flex items-end gap-px h-full w-full justify-center">
                <div
                  className="w-2.5 bg-accent/70 rounded-t-sm transition-all group-hover:bg-accent"
                  style={{ height: `${issuedH}%` }}
                />
                <div
                  className="w-2.5 bg-muted-foreground/40 rounded-t-sm transition-all group-hover:bg-muted-foreground/70"
                  style={{ height: `${retiredH}%` }}
                />
              </div>
              <span className="metric-number text-[9px] text-muted-foreground mt-1">
                {y.year}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 label-mono text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-accent/70 rounded-sm" />
          Issued
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-muted-foreground/40 rounded-sm" />
          Retired
        </span>
      </div>
    </div>
  );
}
