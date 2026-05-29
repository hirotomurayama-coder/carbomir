import type { Metadata } from "next";
import Link from "next/link";
import {
  Globe2,
  Stamp,
  Handshake,
  Database,
  ArrowUpRight,
  ExternalLink,
  TrendingUp,
  Map as MapIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  listInstruments,
  listMechanisms,
  listCooperativeAgreements,
  getOffsetsDbAggregates,
} from "@/lib/data/queries";
import {
  ATLAS_SOURCE_LABEL,
  ATLAS_SOURCE_URL,
  OFFSETS_DB_SOURCE_LABEL,
  OFFSETS_DB_SOURCE_URL,
} from "@/lib/types";
import {
  DonutChart,
  HorizontalBarChart,
  StackedStatusBar,
} from "@/components/atlas/atlas-charts";
import { countryNameJa } from "@/lib/data/country-geo";
import {
  translateInstrumentType,
  translateStatus,
  translateRegion,
} from "@/lib/data/atlas-i18n";

export const metadata: Metadata = {
  title: "Atlas (世界マップ)",
  description:
    "World Bank Carbon Pricing Dashboard + CarbonPlan OffsetsDB を取り込んだ、カーボンクレジットのグローバル網羅データセット。図解付き.",
};

/**
 * Atlas index ページ — 抜本リデザイン.
 *
 * 設計判断:
 *   - 旧版は 4 つのデータセットカードを並べるだけで「世界規模感」が伝わらなかった.
 *   - 新版は SVG チャート (donut / horizontal bar / stacked) で
 *     データ分布を可視化し、その下に詳細ページへの導線を配置.
 *   - 外部チャートライブラリ不使用、SVG インライン描画でバンドル最小化.
 */
export default async function AtlasIndexPage() {
  const [instruments, mechanisms, cooperative, offsetsAgg] = await Promise.all([
    listInstruments(),
    listMechanisms(),
    listCooperativeAgreements(),
    getOffsetsDbAggregates(),
  ]);

  // ===== 集計 =====
  // Instruments by type
  const typeCounts = countBy(instruments, (i) => i.type ?? "Undefined");
  // Instruments by status
  const statusCounts = countBy(instruments, (i) => i.status ?? "Unknown");
  // Top jurisdictions by instrument count.
  // countryNameJa で国・地域名に正規化してから集計する。WB データはカナダ連邦 +
  // 州 (Alberta / British Columbia 等) を別管轄で持つため、生 jurisdiction で
  // 集計すると表示時に同じ「カナダ」へ畳まれ重複バーになる (集計を表示名に揃える)。
  const jurCounts = countBy(instruments, (i) => countryNameJa(i.jurisdiction));
  const topJurisdictions = [...jurCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  // Mechanisms by region
  const regionCounts = countBy(
    mechanisms,
    (m) => (m.region as string | null) ?? "未設定"
  );
  const regionList = [...regionCounts.entries()].sort((a, b) => b[1] - a[1]);
  // Cooperative buyers
  const buyerCounts = countBy(cooperative, (c) => c.buyer);
  const topBuyers = [...buyerCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  // 計算: アクティブ国数
  const allCountries = new Set<string>();
  for (const i of instruments) {
    if (i.jurisdiction) allCountries.add(i.jurisdiction);
  }
  for (const m of mechanisms) {
    for (const c of m.countries_iso3 ?? []) allCountries.add(c);
  }
  for (const c of cooperative) {
    if (c.buyer) allCountries.add(c.buyer);
    if (c.seller) allCountries.add(c.seller);
  }

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      {/* === ヘッダー === */}
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <Globe2 className="h-2.5 w-2.5 mr-1" />
            Atlas / 世界マップ
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          世界マップ
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
          外部の権威あるデータセットを取り込んだリファレンス。
          <strong className="text-foreground">「グローバル網羅性」</strong>{" "}
          を担当する 4 データセットを、まず分布チャートで俯瞰し、必要に応じて詳細テーブルへ降りる。
        </p>
        <p className="label-mono text-muted-foreground mt-2 text-[10.5px]">
          Sources:{" "}
          <a
            href={ATLAS_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline inline-flex items-center gap-1 normal-case"
          >
            <ExternalLink className="h-3 w-3" />
            {ATLAS_SOURCE_LABEL}
          </a>
          {" · "}
          <a
            href={OFFSETS_DB_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline inline-flex items-center gap-1 normal-case"
          >
            <ExternalLink className="h-3 w-3" />
            {OFFSETS_DB_SOURCE_LABEL}
          </a>
        </p>
      </header>

      {/* === キーメトリクス === */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <MetricBlock
          label="カーボンプライシング制度"
          value={instruments.length}
          unit="制度"
          sub={`${countBy(instruments, (i) => i.status).get("Implemented") ?? 0} 件 実施中`}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricBlock
          label="クレジットメカニズム"
          value={mechanisms.length}
          unit="メカニズム"
          sub={`${countBy(mechanisms, (m) => m.status).get("Implemented") ?? 0} 件 実施中`}
          icon={<Stamp className="h-4 w-4" />}
        />
        <MetricBlock
          label="二国間協定"
          value={cooperative.length}
          unit="協定"
          sub="パリ協定 6.2 条"
          icon={<Handshake className="h-4 w-4" />}
        />
        <MetricBlock
          label="関連国数 (重複なし)"
          value={allCountries.size}
          unit="か国"
          sub={`OffsetsDB プロジェクト ${offsetsAgg.totals.projects.toLocaleString()} 件`}
          icon={<MapIcon className="h-4 w-4" />}
        />
      </div>

      {/* === Charts row 1: Type donut + Status stacked bar === */}
      <section className="mb-8">
        <h2 className="label-mono text-foreground mb-3">
          炭素価格制度 — 全体構成
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <p className="label-mono text-muted-foreground mb-3">
              種別 (炭素税 vs 排出量取引)
            </p>
            <DonutChart
              segments={mapToSegments(typeCounts, TYPE_COLORS, translateInstrumentType)}
              total={instruments.length}
              centerLabel={instruments.length.toString()}
              centerSubLabel="制度"
            />
          </Card>
          <Card className="p-5">
            <p className="label-mono text-muted-foreground mb-3">
              ステータス別 (実施中 / 検討中 / 準備中 / 廃止)
            </p>
            <StackedStatusBar
              segments={mapToSegments(statusCounts, STATUS_COLORS, translateStatus)}
              total={instruments.length}
            />
            <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
              世界で <strong className="text-foreground">
                {(((statusCounts.get("Implemented") ?? 0) / instruments.length) * 100).toFixed(0)}%
              </strong>{" "}
              の炭素価格制度が既に稼働中。検討中・準備中を併せて{" "}
              <strong className="text-foreground">
                {(statusCounts.get("Under consideration") ?? 0) +
                  (statusCounts.get("Under development") ?? 0)}
              </strong>{" "}
              件あり、今後数年で制度数は更に拡大の見込み。
            </p>
          </Card>
        </div>
      </section>

      {/* === Charts row 2: Top jurisdictions + Region distribution === */}
      <section className="mb-8">
        <h2 className="label-mono text-foreground mb-3">
          地域分布
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5">
            <p className="label-mono text-muted-foreground mb-3">
              国・地域別 Top 10 (制度件数)
            </p>
            <HorizontalBarChart
              items={topJurisdictions.map(([label, value]) => ({
                label,
                value,
              }))}
              barColor="#0ea5e9"
            />
          </Card>
          <Card className="p-5">
            <p className="label-mono text-muted-foreground mb-3">
              クレジットメカニズム — 地域別件数
            </p>
            <HorizontalBarChart
              items={regionList.map(([label, value]) => ({
                label: translateRegion(label),
                value,
              }))}
              barColor="#10b981"
            />
          </Card>
        </div>
      </section>

      {/* === Charts row 3: Cooperative buyers === */}
      <section className="mb-8">
        <h2 className="label-mono text-foreground mb-3">
          パリ協定 6.2 条 二国間協定 — 主要 Buyer (買い手)
        </h2>
        <Card className="p-5">
          <div className="flex flex-col gap-3">
            <p className="text-[11.5px] text-muted-foreground leading-relaxed">
              二国間協定は <strong className="text-foreground">Buyer 5 か国</strong>
              {" "}に集中。シンガポール (22) とスイス (14) が累計の半数以上。
              韓国・ノルウェー・スウェーデンが後続。日本は JCM (二国間クレジット制度) を
              UNFCCC 体系外で運営してきた経緯があり、6.2 条に直接登場する協定数は限定的。
            </p>
            <HorizontalBarChart
              items={topBuyers.map(([label, value]) => ({
                label: countryNameJa(label),
                value,
                sublabel: `${((value / cooperative.length) * 100).toFixed(0)}%`,
              }))}
              barColor="#a855f7"
            />
          </div>
        </Card>
      </section>

      {/* === Dataset entry cards === */}
      <section>
        <h2 className="label-mono text-foreground mb-3">
          データセット詳細へ
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DatasetCard
            href="/atlas/instruments"
            icon={<TrendingUp className="h-4 w-4" />}
            label="カーボンプライシング制度"
            count={instruments.length}
            unit="制度"
            tagline="139 件の世界全 ETS + 炭素税。価格 / セクター / オフセット適格"
          />
          <DatasetCard
            href="/atlas/mechanisms"
            icon={<Stamp className="h-4 w-4" />}
            label="クレジットメカニズム"
            count={mechanisms.length}
            unit="メカニズム"
            tagline="Verra・Gold Standard・地域レジストリ。発行 / 償却 / 国"
          />
          <DatasetCard
            href="/atlas/cooperative"
            icon={<Handshake className="h-4 w-4" />}
            label="二国間協定 (6.2 条)"
            count={cooperative.length}
            unit="協定"
            tagline="パリ協定 6.2 条 二国間協定。Buyer / Seller / 締結年"
          />
          <DatasetCard
            href="/atlas/offsets-db"
            icon={<Database className="h-4 w-4" />}
            label="OffsetsDB (CarbonPlan)"
            count={offsetsAgg.totals.projects}
            unit="件"
            tagline="7 レジストリ集約。発行 / 償却 / 詳細プロジェクト一覧"
          />
        </div>
      </section>
    </div>
  );
}

/* ============================================================
 * Helpers
 * ============================================================ */

function countBy<T, K>(items: T[], key: (x: T) => K): Map<K, number> {
  const m = new Map<K, number>();
  for (const it of items) {
    const k = key(it);
    m.set(k, (m.get(k) ?? 0) + 1);
  }
  return m;
}

function mapToSegments(
  counts: Map<string, number>,
  colorMap: Record<string, string>,
  translate?: (s: string) => string
): Array<{ label: string; value: number; color: string }> {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label: translate ? translate(label) : label,
      value,
      color: colorMap[label] ?? "#94a3b8",
    }));
}

const TYPE_COLORS: Record<string, string> = {
  "Carbon tax": "#10b981",
  "ETS": "#0ea5e9",
  "Undefined": "#94a3b8",
};

const STATUS_COLORS: Record<string, string> = {
  "Implemented": "#10b981",
  "Under consideration": "#f59e0b",
  "Under development": "#0ea5e9",
  "Abolished": "#94a3b8",
};

/* ============================================================
 * Metric block (top row)
 * ============================================================ */

function MetricBlock({
  label,
  value,
  unit,
  sub,
  icon,
}: {
  label: string;
  value: number;
  unit: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
        {icon}
        <span className="label-mono text-[10.5px]">{label}</span>
      </div>
      <p className="metric-number text-2xl font-bold text-foreground tracking-tight leading-none">
        {value.toLocaleString()}
        <span className="text-[11px] font-mono text-muted-foreground ml-1.5">
          {unit}
        </span>
      </p>
      <p className="label-mono text-muted-foreground/85 mt-1.5 text-[10px]">
        {sub}
      </p>
    </Card>
  );
}

/* ============================================================
 * Dataset entry card (small, compact)
 * ============================================================ */

function DatasetCard({
  href,
  icon,
  label,
  count,
  unit,
  tagline,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  count: number;
  unit: string;
  tagline: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full p-4 hover:border-accent/60 hover:shadow-[0_4px_24px_-8px_rgba(14,165,233,0.18)] transition-all group">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent/10 text-accent">
            {icon}
          </span>
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-accent transition-colors" />
        </div>
        <p className="label-mono text-muted-foreground mb-0.5 text-[10px]">
          {label}
        </p>
        <p className="metric-number text-xl font-bold text-foreground tracking-tight leading-none mb-1.5">
          {count.toLocaleString()}
          <span className="text-[10px] font-mono text-muted-foreground ml-1.5">
            {unit}
          </span>
        </p>
        <p className="text-[10.5px] text-muted-foreground leading-relaxed">
          {tagline}
        </p>
      </Card>
    </Link>
  );
}
