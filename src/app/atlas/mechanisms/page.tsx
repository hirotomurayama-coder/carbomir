import type { Metadata } from "next";
import { Stamp, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listMechanisms } from "@/lib/data/queries";
import { MechanismsTable } from "@/components/atlas/mechanisms-table";
import { WorldBubbleMap } from "@/components/atlas/world-bubble-map";
import { COUNTRY_GEO } from "@/lib/data/country-geo";
import { ATLAS_SOURCE_LABEL, ATLAS_SOURCE_URL } from "@/lib/types";

export const metadata: Metadata = {
  title: "Crediting Mechanisms (世界マップ)",
  description:
    "World Bank Carbon Pricing Dashboard が追跡する世界 57 の Crediting Mechanism。",
};

export default async function MechanismsPage() {
  const mechanisms = await listMechanisms();
  const implementedCount = mechanisms.filter((m) => m.status === "Implemented").length;
  const totalIssued = mechanisms.reduce(
    (s, m) => s + (m.cumulative_issued_kt ?? 0),
    0
  );
  const totalProjects = mechanisms.reduce(
    (s, m) => s + (m.cumulative_projects ?? 0),
    0
  );

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <Stamp className="h-2.5 w-2.5 mr-1" />
            Atlas / Crediting Mechanisms
          </Badge>
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider text-emerald-600 dark:text-emerald-400 border-emerald-600/40 dark:border-emerald-400/40"
          >
            {implementedCount} implemented
          </Badge>
          <Badge variant="secondary" className="font-mono text-[10px] tracking-wider">
            ~{(totalIssued / 1000).toFixed(0)} Mt issued ·{" "}
            {totalProjects.toLocaleString()} projects
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          世界の Crediting Mechanisms
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          World Bank Carbon Pricing Dashboard が追跡する全 {mechanisms.length}{" "}
          の Crediting Mechanism (Governmental / Independent / International)。Carbomir が編集解説する Verra VCS / Gold Standard / Plan Vivo / JCM / J-Credit 等は「Carbomir」リンクバッジで識別できる。
        </p>
        <p className="label-mono text-muted-foreground mt-2">
          Source:{" "}
          <a
            href={ATLAS_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline inline-flex items-center gap-1 normal-case"
          >
            <ExternalLink className="h-3 w-3" />
            {ATLAS_SOURCE_LABEL}
          </a>
        </p>
      </header>

      {/* === 世界マップ === */}
      <section className="mb-8">
        <div className="mb-3 flex items-baseline justify-between gap-3 flex-wrap">
          <h2 className="label-mono text-foreground">地理分布マップ</h2>
          <span className="label-mono text-muted-foreground text-[10.5px]">
            国別に発行案件数を色 / バブルサイズで可視化
          </span>
        </div>
        <Card className="p-4">
          <WorldBubbleMap
            data={buildMechanismsMapData(mechanisms)}
            sizeScale={2.2}
            legend={[
              { key: "Governmental", label: "政府運営", color: "#0ea5e9" },
              { key: "Independent", label: "民間 / 独立", color: "#10b981" },
              { key: "International", label: "国際機関", color: "#a855f7" },
              { key: "Other", label: "その他 / 混合", color: "#94a3b8" },
            ]}
          />
        </Card>
      </section>

      <MechanismsTable mechanisms={mechanisms} />

      <Card className="mt-6">
        <CardContent className="p-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">「Carbomir」リンクバッジ</strong>: World Bank
            の収録名と Carbomir 既存エンティティが一致するレジストリ。クリックで Carbomir
            の編集解説ページへ。
          </p>
          <p>
            <strong className="text-foreground">単位</strong>: Issued / Retired / Cancelled は kt CO2e (World Bank 表記)、テーブル上は Mt / k に丸めて表示。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Mechanisms を ISO3 別に集約.
 * countries_iso3 配列を持つので素直に展開.
 * primaryType = administration (Governmental / Independent / International).
 */
function buildMechanismsMapData(
  mechanisms: Awaited<ReturnType<typeof listMechanisms>>
) {
  type Agg = {
    iso3: string;
    count: number;
    govCount: number;
    indCount: number;
    intlCount: number;
  };
  const byCountry = new Map<string, Agg>();
  for (const m of mechanisms) {
    if (m.status !== "Implemented") continue;
    const isos = m.countries_iso3 ?? [];
    if (isos.length === 0) continue;
    for (const iso3 of isos) {
      if (!COUNTRY_GEO[iso3]) continue;
      const agg = byCountry.get(iso3) ?? {
        iso3,
        count: 0,
        govCount: 0,
        indCount: 0,
        intlCount: 0,
      };
      agg.count++;
      const adm = m.administration ?? "";
      if (adm === "Governmental") agg.govCount++;
      else if (adm === "Independent") agg.indCount++;
      else if (adm === "International") agg.intlCount++;
      byCountry.set(iso3, agg);
    }
  }
  return [...byCountry.values()].map((a) => {
    let primaryType = "Other";
    const max = Math.max(a.govCount, a.indCount, a.intlCount);
    if (max > 0) {
      if (a.govCount === max) primaryType = "Governmental";
      else if (a.indCount === max) primaryType = "Independent";
      else if (a.intlCount === max) primaryType = "International";
    }
    return {
      iso3: a.iso3,
      count: a.count,
      primaryType,
      label: "案件",
    };
  });
}
