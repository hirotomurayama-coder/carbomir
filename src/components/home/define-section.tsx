import { Network, Building2, Scale } from "lucide-react";
import { SectionHeader } from "./section-header";
import { MiniAssetCard } from "./mini-asset-card";

/**
 * 「調べる」セクション — 概念体系 / プレイヤー / 政策・規制 への入口.
 */
export function DefineSection({
  conceptCount,
  playerCount,
  policyCount,
}: {
  conceptCount: number;
  playerCount: number;
  policyCount: number;
}) {
  return (
    <section className="mb-10">
      <SectionHeader
        label="調べる"
        description="制度・概念・プレイヤーを構造化属性 + 双方向リンクで定義"
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <MiniAssetCard
          href="/entities"
          icon={<Network className="h-4 w-4" />}
          label="概念体系"
          count={conceptCount}
          unit="concepts"
          tagline="メソドロジー / 技術 / 制度"
        />
        <MiniAssetCard
          href="/players"
          icon={<Building2 className="h-4 w-4" />}
          label="プレイヤー"
          count={playerCount}
          unit="players"
          tagline="レジストリ / 事業者 / 取扱業者"
        />
        <MiniAssetCard
          href="/policies"
          icon={<Scale className="h-4 w-4" />}
          label="政策・規制"
          count={policyCount}
          unit="policies"
          tagline="ステータス + 次マイルストーン付き"
        />
      </div>
    </section>
  );
}
