import type { Metadata } from "next";
import { Handshake, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listCooperativeAgreements } from "@/lib/data/queries";
import { CooperativeTable } from "@/components/atlas/cooperative-table";
import { CooperativeNetwork } from "@/components/atlas/cooperative-network";
import { ATLAS_SOURCE_LABEL, ATLAS_SOURCE_URL } from "@/lib/types";
import { countryNameJa } from "@/lib/data/country-geo";
import { JCM_PARTNERS } from "@/lib/data/atlas/jcm-partners";

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

      {/* === JCM パートナー (別データセット、併置表示) === */}
      <section className="mt-12 pt-8 border-t border-border">
        <div className="mb-4 flex items-baseline justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground mb-1">
              日本 JCM (二国間クレジット制度)
            </h2>
            <p className="text-[12.5px] text-muted-foreground leading-relaxed max-w-3xl">
              日本は 2013 年から JCM (Joint Crediting Mechanism) を独自に運営してきた経緯があり、World Bank の Article 6.2 cooperative_agreements 表とは別に扱われている。{" "}
              <strong className="text-foreground">{JCM_PARTNERS.length} か国</strong>{" "}
              のパートナー (Buyer = 日本) と二国間合意を締結済み。詳細は{" "}
              <a href="/entities/jcm" className="text-accent hover:underline">
                /entities/jcm
              </a>{" "}
              参照。Carbomir 編集データ ([要確認]: 環境省公式の最新版で定期検証).
            </p>
          </div>
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider border-orange-500/40 text-orange-600 dark:text-orange-400"
          >
            日本 = 唯一の Buyer
          </Badge>
        </div>

        <div className="mb-3 flex items-baseline justify-between gap-3 flex-wrap">
          <h3 className="label-mono text-foreground">
            日本 ↔ {JCM_PARTNERS.length} か国 パートナーシップ
          </h3>
          <span className="label-mono text-muted-foreground text-[10.5px]">
            線の濃さ = 進捗段階 (MOC → 実施 → 6.2 条移行)
          </span>
        </div>
        <CooperativeNetwork
          agreements={JCM_PARTNERS.map((p) => ({
            buyer: "Japan",
            seller: p.partner,
            year_of_agreement: p.year,
            status: p.status,
          }))}
        />

        <Card className="mt-6">
          <CardContent className="p-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
            <p>
              <strong className="text-foreground">JCM の位置付け</strong>: 当初は UNFCCC 体系外の独自スキームとして始まったが、現在は Article 6.2 への変換が進行中。モンゴルでは既に 6.2 条クレジットとしての発行が始まっている。
            </p>
            <p>
              <strong className="text-foreground">ステータスの意味</strong>: MOC 締結 = 二国間協力覚書 / 実施段階 = 実質的なプロジェクト実装が進行 / 6.2 条移行済 = Article 6.2 認可済み.
            </p>
          </CardContent>
        </Card>
      </section>

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
