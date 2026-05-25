import type { Metadata } from "next";
import { Globe2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listInstruments } from "@/lib/data/queries";
import { getInstrumentLinkedEntity } from "@/lib/data/atlas";
import { InstrumentsTable } from "@/components/atlas/instruments-table";
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
