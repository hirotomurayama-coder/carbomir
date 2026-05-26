import type { Metadata } from "next";
import { Globe2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listInstruments } from "@/lib/data/queries";
import { getInstrumentLinkedEntity } from "@/lib/data/atlas";
import { InstrumentsTable } from "@/components/atlas/instruments-table";
import { WorldMapLeaflet } from "@/components/atlas/world-map-leaflet";
import { jurisdictionToIso3 } from "@/lib/data/country-geo";
import { ATLAS_SOURCE_LABEL, ATLAS_SOURCE_URL } from "@/lib/types";

export const metadata: Metadata = {
  title: "Carbon Pricing 制度 (世界マップ)",
  description:
    "World Bank Carbon Pricing Dashboard が追跡する世界 139 の Compliance 炭素価格制度 (ETS + 炭素税)。",
};

export default async function InstrumentsPage() {
  const instruments = await listInstruments();
  const implementedCount = instruments.filter((i) => i.status === "Implemented").length;
  const etsCount = instruments.filter((i) => i.type === "ETS").length;
  const taxCount = instruments.filter((i) => i.type === "Carbon tax").length;

  // Carbomir entity との手動マッピングをまとめて Client に渡す
  const linkageMap: Record<string, string> = {};
  for (const ins of instruments) {
    const slug = getInstrumentLinkedEntity(ins.unique_id);
    if (slug) linkageMap[ins.unique_id] = slug;
  }

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <Globe2 className="h-2.5 w-2.5 mr-1" />
            Atlas / Carbon Pricing
          </Badge>
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider text-emerald-600 dark:text-emerald-400 border-emerald-600/40 dark:border-emerald-400/40"
          >
            {implementedCount} implemented
          </Badge>
          <Badge variant="secondary" className="font-mono text-[10px] tracking-wider">
            {etsCount} ETS · {taxCount} 炭素税
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          世界の Carbon Pricing 制度
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          World Bank Carbon Pricing Dashboard が追跡する全 {instruments.length}{" "}
          の Compliance 炭素価格制度。Implemented / Scheduled / Under consideration
          の各段階を含む。Carbomir の `/policies` (編集主要 15 件)
          が深掘り、こちらが網羅性のリファレンス。
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
            国別の炭素価格制度数を可視化
          </span>
        </div>
        <Card className="p-4">
          <WorldMapLeaflet
            data={buildInstrumentMapData(instruments)}
            sizeScale={3}
            legend={[
              { key: "Carbon tax", label: "Carbon tax 主体", color: "#10b981" },
              { key: "ETS", label: "ETS 主体", color: "#0ea5e9" },
              { key: "Both", label: "両方併用", color: "#a855f7" },
              { key: "Other", label: "未分類", color: "#94a3b8" },
            ]}
          />
        </Card>
      </section>

      <InstrumentsTable instruments={instruments} linkageMap={linkageMap} />

      <Card className="mt-6">
        <CardContent className="p-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">構造化属性</strong>:
            各制度の type / status / 管轄 / 適用セクター /
            適用ガス・燃料 / 価格 / 排出量カバレッジ / 配分手法 等を World Bank が標準化して収録。
          </p>
          <p>
            <strong className="text-foreground">注意</strong>: 価格は 2026 年 4 月 1 日時点 USD 換算。最新の現地通貨価格は World Bank ダッシュボードでご確認ください。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Instruments を ISO3 ごとに集約 + Carbon tax / ETS / Both を判定.
 * Implemented + Under development + Under consideration 全て含むが、
 * 主に Implemented 件数を主体に primaryType を決める.
 */
function buildInstrumentMapData(
  instruments: Awaited<ReturnType<typeof listInstruments>>
) {
  type Agg = {
    iso3: string;
    count: number;
    taxCount: number;
    etsCount: number;
  };
  const byCountry = new Map<string, Agg>();
  for (const i of instruments) {
    const iso3 = jurisdictionToIso3(i.jurisdiction);
    if (!iso3) continue;
    if (i.status !== "Implemented") continue; // 視覚的なノイズ回避: 実装済のみ
    const agg = byCountry.get(iso3) ?? {
      iso3,
      count: 0,
      taxCount: 0,
      etsCount: 0,
    };
    agg.count++;
    if (i.type === "Carbon tax") agg.taxCount++;
    if (i.type === "ETS") agg.etsCount++;
    byCountry.set(iso3, agg);
  }
  return [...byCountry.values()].map((a) => {
    let primaryType = "Other";
    if (a.taxCount > 0 && a.etsCount > 0) primaryType = "Both";
    else if (a.taxCount > 0) primaryType = "Carbon tax";
    else if (a.etsCount > 0) primaryType = "ETS";
    return {
      iso3: a.iso3,
      count: a.count,
      primaryType,
      label: "実装制度",
    };
  });
}
