import type { Metadata } from "next";
import { Stamp, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listMechanisms } from "@/lib/data/queries";
import { MechanismsTable } from "@/components/atlas/mechanisms-table";
import { WorldMapLeaflet } from "@/components/atlas/world-map-leaflet";
import {
  DonutChart,
  HorizontalBarChart,
  DualBarChart,
} from "@/components/atlas/atlas-charts";
import { COUNTRY_GEO, jurisdictionToIso3 } from "@/lib/data/country-geo";
import { ATLAS_SOURCE_LABEL, ATLAS_SOURCE_URL } from "@/lib/types";
import type { CreditingMechanism } from "@/lib/types";

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
            世界マップ / クレジットメカニズム
          </Badge>
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider text-emerald-600 dark:text-emerald-400 border-emerald-600/40 dark:border-emerald-400/40"
          >
            {implementedCount} 件 実施中
          </Badge>
          <Badge variant="secondary" className="font-mono text-[10px] tracking-wider">
            ~{(totalIssued / 1000).toFixed(0)} Mt 発行 ·{" "}
            {totalProjects.toLocaleString()} 案件
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          世界のクレジットメカニズム
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          World Bank Carbon Pricing Dashboard が追跡する全 {mechanisms.length}{" "}
          件のクレジットメカニズム (政府運営 / 民間 / 国際機関)。Carbomir が編集解説する Verra VCS / Gold Standard / Plan Vivo / JCM / J-Credit 等は「Carbomir」リンクバッジで識別できる。
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
          <WorldMapLeaflet
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

      {/* === 詳細チャート === */}
      <section className="mb-8 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <p className="label-mono text-foreground mb-1">運営主体の構成</p>
          <p className="label-mono text-muted-foreground text-[10.5px] mb-3">
            全 {mechanisms.length} メカニズムの運営区分
          </p>
          <DonutChart
            segments={buildAdminSegments(mechanisms)}
            total={mechanisms.length}
            centerLabel={mechanisms.length.toString()}
            centerSubLabel="メカニズム"
          />
          <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
            クレジット市場は <strong className="text-foreground">政府運営</strong> が圧倒的多数 (中国の地方 ETS / 各国独自レジストリ等). 民間 (Verra/Gold Standard 等) は件数こそ少ないが、累計発行量では主要シェア.
          </p>
        </Card>

        <Card className="p-5">
          <p className="label-mono text-foreground mb-1">範囲 (スコープ) 別</p>
          <p className="label-mono text-muted-foreground text-[10.5px] mb-3">
            国際 / 国家 / 地域 / サブナショナル
          </p>
          <HorizontalBarChart
            items={buildScopeBars(mechanisms)}
            barColor="#a855f7"
          />
        </Card>

        <Card className="p-5 lg:col-span-2">
          <p className="label-mono text-foreground mb-1">累計発行量 Top 10 (Mt CO2e)</p>
          <p className="label-mono text-muted-foreground text-[10.5px] mb-3">
            発行量 (青) と償却量 (灰) の比較. 償却率の低いメカニズムは「在庫」が積み上がっている
          </p>
          <DualBarChart
            items={buildTop10Issuance(mechanisms)}
            primaryLabel="累計発行 (Mt)"
            secondaryLabel="累計償却 (Mt)"
            primaryColor="#0ea5e9"
            secondaryColor="#94a3b8"
            valueFormatter={(n) => n.toFixed(1)}
          />
          <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
            CDM・Verra・京都議定書 Joint Implementation など過去発行量の多いメカニズムは償却率が記録されていない (CDM は元データで償却 0). 一方 California / Australia ACCU などの compliance 系は発行 → 償却フローが追える.
          </p>
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
            <strong className="text-foreground">単位</strong>: 発行 / 償却 / 取消は kt CO2e (World Bank 表記)、テーブル上は Mt / k に丸めて表示。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================================================
 * Aggregations
 * ============================================================ */

function buildAdminSegments(mechanisms: CreditingMechanism[]) {
  const counts = new Map<string, number>();
  for (const m of mechanisms) {
    const k = m.administration ?? "Unknown";
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const palette: Record<string, string> = {
    Governmental: "#0ea5e9",
    Independent: "#10b981",
    International: "#a855f7",
  };
  const labelMap: Record<string, string> = {
    Governmental: "政府運営",
    Independent: "民間 / 独立",
    International: "国際機関",
    Unknown: "未分類",
  };
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({
      label: labelMap[key] ?? key,
      value,
      color: palette[key] ?? "#94a3b8",
    }));
}

function buildScopeBars(mechanisms: CreditingMechanism[]) {
  const counts = new Map<string, number>();
  for (const m of mechanisms) {
    const k = m.scope ?? "Unknown";
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  const labelMap: Record<string, string> = {
    Global: "国際",
    National: "国家",
    Regional: "地域",
    Subnational: "サブナショナル",
    Unknown: "未分類",
  };
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key, value]) => ({
      label: labelMap[key] ?? key,
      value,
    }));
}

function buildTop10Issuance(mechanisms: CreditingMechanism[]) {
  return [...mechanisms]
    .filter((m) => (m.cumulative_issued_kt ?? 0) > 0)
    .sort(
      (a, b) => (b.cumulative_issued_kt ?? 0) - (a.cumulative_issued_kt ?? 0)
    )
    .slice(0, 10)
    .map((m) => ({
      label: m.mechanism,
      primary: (m.cumulative_issued_kt ?? 0) / 1000, // kt → Mt
      secondary: (m.cumulative_retired_kt ?? 0) / 1000,
    }));
}

/**
 * Mechanisms を ISO3 別に集約.
 * primaryType = administration (Governmental / Independent / International).
 *
 * データ事情: WB の mechanism JSON は `countries_iso3` が全件 null。
 * National / Subnational / Regional scope は administering_jurisdiction を
 * jurisdictionToIso3 で ISO3 に解決して使う (Subnational は親国に集約).
 * Global scope (Verra / Gold Standard / CDM 等) は単一国に紐付けられないため除外.
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
    let isos: string[] = (m.countries_iso3 ?? []) as string[];
    if (isos.length === 0) {
      const iso3 = jurisdictionToIso3(m.administering_jurisdiction);
      if (iso3) isos = [iso3];
    }
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
