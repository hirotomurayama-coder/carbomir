import type { Metadata } from "next";
import { Handshake, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listCooperativeAgreements } from "@/lib/data/queries";
import { CooperativeTable } from "@/components/atlas/cooperative-table";
import { CooperativeNetwork } from "@/components/atlas/cooperative-network";
import { ATLAS_SOURCE_LABEL, ATLAS_SOURCE_URL } from "@/lib/types";
import { countryNameJa } from "@/lib/data/country-geo";

export const metadata: Metadata = {
  title: "Cooperative Approaches (Article 6.2)",
  description:
    "World Bank Carbon Pricing Dashboard が追跡する Article 6.2 二国間協定の世界マップ。",
};

export default async function CooperativePage() {
  const agreements = await listCooperativeAgreements();
  const buyerCounts = new Map<string, number>();
  for (const a of agreements) {
    buyerCounts.set(a.buyer, (buyerCounts.get(a.buyer) ?? 0) + 1);
  }
  const topBuyer = Array.from(buyerCounts.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0];

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <Handshake className="h-2.5 w-2.5 mr-1" />
            世界マップ / 二国間協定
          </Badge>
          <Badge variant="secondary" className="font-mono text-[10px] tracking-wider">
            パリ協定 6.2 条
          </Badge>
          {topBuyer && (
            <Badge variant="outline" className="font-mono text-[10px] tracking-wider">
              最大 Buyer: {countryNameJa(topBuyer[0])} ({topBuyer[1]})
            </Badge>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          二国間協定 (パリ協定 6.2 条)
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          World Bank が追跡する全 {agreements.length} 件のパリ協定 6.2 条 (Cooperative Approaches) 二国間協定。Buyer 国 (買い手) と Seller 国 (売り手) の関係、合意年、状況 (枠組み合意 / 実施協定 / 個別認可) を整理。日本の JCM は Cooperative Approaches とは別カテゴリで運用されるが、6.2 条の一部として活用検討中の枠組み。
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

      {/* === ネットワーク図 === */}
      <section className="mb-8">
        <div className="mb-3 flex items-baseline justify-between gap-3 flex-wrap">
          <h2 className="label-mono text-foreground">Buyer ↔ Seller 関係図</h2>
          <span className="label-mono text-muted-foreground text-[10.5px]">
            線の濃さ = 締結ステータス、色 = Buyer
          </span>
        </div>
        <CooperativeNetwork agreements={agreements} />
      </section>

      <CooperativeTable agreements={agreements} />

      <Card className="mt-6">
        <CardContent className="p-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">ステータスの意味</strong>:
            MoU 締結 → 基本合意の覚書 / 実施協定締結 → 実施運用ルールに合意 / 個別認可完了 → 個別案件の二国間認可済み。
          </p>
          <p>
            <strong className="text-foreground">関連</strong>: 日本の JCM は別枠組みだが Cooperative Approaches の一形態。詳細は{" "}
            <a href="/entities/jcm" className="text-accent hover:underline">
              /entities/jcm
            </a>{" "}
            参照。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
