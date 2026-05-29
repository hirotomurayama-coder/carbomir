import type { Metadata } from "next";
import { Globe2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listInstruments } from "@/lib/data/queries";
import { getInstrumentLinkedEntity } from "@/lib/data/atlas";
import { InstrumentsTable } from "@/components/atlas/instruments-table";
import { WorldMapLeaflet } from "@/components/atlas/world-map-leaflet";
import {
  DonutChart,
  HistogramChart,
  HorizontalBarChart,
} from "@/components/atlas/atlas-charts";
import { jurisdictionToIso3, jurisdictionLabelJa } from "@/lib/data/country-geo";
import { ATLAS_SOURCE_LABEL, ATLAS_SOURCE_URL } from "@/lib/types";
import type { CarbonPricingInstrument } from "@/lib/types";

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
            世界マップ / カーボンプライシング
          </Badge>
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider text-emerald-600 dark:text-emerald-400 border-emerald-600/40 dark:border-emerald-400/40"
          >
            {implementedCount} 件 実施中
          </Badge>
          <Badge variant="secondary" className="font-mono text-[10px] tracking-wider">
            ETS {etsCount} · 炭素税 {taxCount}
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          世界の Carbon Pricing 制度
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          World Bank Carbon Pricing Dashboard が追跡する全 {instruments.length}{" "}
          件のコンプライアンス炭素価格制度。実施中・実施予定・検討中の各段階を含む。
          Carbomir の <a href="/policies" className="text-accent hover:underline">/policies</a> (編集主要 15 件)
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
              { key: "Carbon tax", label: "炭素税 主体", color: "#10b981" },
              { key: "ETS", label: "排出量取引 (ETS) 主体", color: "#0ea5e9" },
              { key: "Both", label: "両方併用", color: "#a855f7" },
              { key: "Other", label: "未分類", color: "#94a3b8" },
            ]}
          />
        </Card>
      </section>

      {/* === 詳細チャート === */}
      <section className="mb-8 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <p className="label-mono text-foreground mb-1">価格分布 (USD/t CO2e)</p>
          <p className="label-mono text-muted-foreground text-[10.5px] mb-3">
            実施中の制度のみ. 100 USD/t 超は高い水準
          </p>
          <HistogramChart
            bins={buildPriceBins(instruments)}
            barColor="#0ea5e9"
          />
          <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
            実施中 {instruments.filter((i) => i.status === "Implemented" && i.price_2026_usd != null).length} 件の価格分布. 中央値は{" "}
            <strong className="text-foreground">
              {medianPrice(instruments).toFixed(1)} USD/t
            </strong>
            . 制度数は低価格帯 (0-30 USD/t) に集中し、北欧諸国とスイスが 100 USD/t 超の高水準帯にいる.
          </p>
        </Card>

        <Card className="p-5">
          <p className="label-mono text-foreground mb-1">最高価格 Top 15 (USD/t CO2e)</p>
          <p className="label-mono text-muted-foreground text-[10.5px] mb-3">
            実施中の制度を価格降順. 北欧諸国と西欧が上位を占める
          </p>
          <HorizontalBarChart
            items={buildTopPrices(instruments)}
            barColor="#10b981"
          />
        </Card>

        <Card className="p-5 lg:col-span-2">
          <p className="label-mono text-foreground mb-1">オフセット利用可否</p>
          <p className="label-mono text-muted-foreground text-[10.5px] mb-3">
            制度内で外部クレジットによるオフセット使用が認められているか
          </p>
          <DonutChart
            segments={buildOffsetEligibility(instruments)}
            total={instruments.filter((i) => i.status === "Implemented").length}
            centerLabel={instruments
              .filter((i) => i.status === "Implemented")
              .length.toString()}
            centerSubLabel="実施中"
          />
          <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
            実施中制度の <strong className="text-foreground">約 4 割</strong> がオフセット利用を全面禁止. 認める制度の多くは「数量上限付き」(EU-ETS 等は近年認めない方向).
          </p>
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

/* ============================================================
 * Aggregations
 * ============================================================ */

function buildPriceBins(instruments: CarbonPricingInstrument[]) {
  const prices = instruments
    .filter((i) => i.status === "Implemented" && i.price_2026_usd != null)
    .map((i) => Number(i.price_2026_usd));
  const bins = [
    { label: "0–10", min: 0, max: 10 },
    { label: "10–30", min: 10, max: 30 },
    { label: "30–50", min: 30, max: 50 },
    { label: "50–100", min: 50, max: 100 },
    { label: "100+", min: 100, max: Infinity },
  ];
  return bins.map((b) => ({
    label: `${b.label} USD/t`,
    count: prices.filter((p) => p >= b.min && p < b.max).length,
  }));
}

function medianPrice(instruments: CarbonPricingInstrument[]): number {
  const prices = instruments
    .filter((i) => i.status === "Implemented" && i.price_2026_usd != null)
    .map((i) => Number(i.price_2026_usd))
    .sort((a, b) => a - b);
  if (prices.length === 0) return 0;
  return prices[Math.floor(prices.length / 2)];
}

function buildTopPrices(instruments: CarbonPricingInstrument[]) {
  return instruments
    .filter((i) => i.status === "Implemented" && i.price_2026_usd != null)
    .sort((a, b) => Number(b.price_2026_usd) - Number(a.price_2026_usd))
    .slice(0, 15)
    .map((i) => {
      const priceNum = Number(i.price_2026_usd);
      const jur = i.jurisdiction ? jurisdictionLabelJa(i.jurisdiction) : "";
      const typeShort = i.type === "Carbon tax" ? "炭素税" : i.type === "ETS" ? "ETS" : "";
      return {
        label: `${jur}${typeShort ? ` (${typeShort})` : ""}`,
        value: Math.round(priceNum * 10) / 10,
        sublabel: "USD/t",
      };
    });
}

function buildOffsetEligibility(instruments: CarbonPricingInstrument[]) {
  const buckets = {
    yesLimit: 0,
    yesUnlimited: 0,
    notPermitted: 0,
    unspecified: 0,
  };
  for (const i of instruments) {
    if (i.status !== "Implemented") continue;
    const v = (i.offset_eligibility ?? "").toLowerCase().trim();
    if (!v || v === "not identified" || v === "not specified" || v === "upstream") {
      buckets.unspecified++;
    } else if (v.startsWith("yes")) {
      if (v.includes("unlimited") && !v.includes("limit")) {
        buckets.yesUnlimited++;
      } else {
        buckets.yesLimit++;
      }
    } else if (
      v.startsWith("not") ||
      v.startsWith("no") ||
      v === "none." ||
      v === "none"
    ) {
      buckets.notPermitted++;
    } else {
      buckets.yesLimit++; // 詳細記述あり (使用許可と解釈)
    }
  }
  return [
    { label: "不可", value: buckets.notPermitted, color: "#94a3b8" },
    { label: "可 (上限付き)", value: buckets.yesLimit, color: "#0ea5e9" },
    { label: "可 (無制限)", value: buckets.yesUnlimited, color: "#10b981" },
    { label: "未定義", value: buckets.unspecified, color: "#cbd5e1" },
  ];
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
