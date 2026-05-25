import type { Metadata } from "next";
import Link from "next/link";
import {
  Globe2,
  Stamp,
  Handshake,
  Database,
  ArrowUpRight,
  ExternalLink,
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

export const metadata: Metadata = {
  title: "Atlas",
  description:
    "World Bank Carbon Pricing Dashboard を取り込んだグローバル網羅データセット。",
};

export default async function AtlasIndexPage() {
  const [instruments, mechanisms, cooperative, offsetsAgg] = await Promise.all([
    listInstruments(),
    listMechanisms(),
    listCooperativeAgreements(),
    getOffsetsDbAggregates(),
  ]);

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <header className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <Globe2 className="h-2.5 w-2.5 mr-1" />
            Atlas
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
          Atlas (世界網羅データセット)
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          外部の権威あるデータセットを取り込んだリファレンス。Carbomir
          編集の `/policies` (深掘り 15 件) と `/entities` (構造化属性) は併用前提で、こちらは
          <strong className="text-foreground">「グローバル網羅性」</strong>
          を担当する。
        </p>
        <p className="label-mono text-muted-foreground mt-2">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DatasetCard
          href="/atlas/instruments"
          icon={<Globe2 className="h-5 w-5" />}
          label="Carbon Pricing 制度"
          count={instruments.length}
          unit="instruments"
          submetric={`${instruments.filter((i) => i.status === "Implemented").length} implemented`}
          tagline="ETS + 炭素税の世界全体 master。type / status / 国 / 価格 / 適用セクター"
        />
        <DatasetCard
          href="/atlas/mechanisms"
          icon={<Stamp className="h-5 w-5" />}
          label="Crediting Mechanisms"
          count={mechanisms.length}
          unit="mechanisms"
          submetric={`${mechanisms.filter((m) => m.status === "Implemented").length} implemented`}
          tagline="Verra・Gold Standard・地域レジストリ等。発行量・登録案件数・適用セクター"
        />
        <DatasetCard
          href="/atlas/cooperative"
          icon={<Handshake className="h-5 w-5" />}
          label="Cooperative Approaches"
          count={cooperative.length}
          unit="agreements"
          submetric="Article 6.2 (Paris Agreement)"
          tagline="二国間協定 master。Buyer / Seller / 締結年 / Status / Notes"
        />
        <DatasetCard
          href="/atlas/offsets-db"
          icon={<Database className="h-5 w-5" />}
          label="OffsetsDB (CarbonPlan)"
          count={offsetsAgg.totals.projects}
          unit="projects"
          submetric={`${offsetsAgg.totals.registries} registries · ${(offsetsAgg.totals.total_issued / 1_000_000).toFixed(0)}M tCO2 issued`}
          tagline="7 主要レジストリ集約のプロジェクト & 取引履歴 (CarbonPlan)"
        />
      </div>
    </div>
  );
}

function DatasetCard({
  href,
  icon,
  label,
  count,
  unit,
  submetric,
  tagline,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  count: number;
  unit: string;
  submetric: string;
  tagline: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full p-5 hover:border-accent/60 hover:shadow-[0_4px_24px_-8px_rgba(14,165,233,0.18)] transition-all group">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 text-accent">
            {icon}
          </span>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-accent transition-colors" />
        </div>
        <p className="label-mono text-muted-foreground mb-1">{label}</p>
        <p className="metric-number text-3xl font-bold text-foreground tracking-tight leading-none mb-1">
          {count.toString().padStart(3, "0")}
          <span className="text-sm font-mono text-muted-foreground ml-2">{unit}</span>
        </p>
        <p className="label-mono text-muted-foreground/80 mb-3">{submetric}</p>
        <p className="text-xs text-muted-foreground leading-relaxed">{tagline}</p>
      </Card>
    </Link>
  );
}
