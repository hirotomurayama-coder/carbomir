import type { Metadata } from "next";
import { Columns3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { listPublishedMatrices } from "@/lib/data/queries";
import { MatricesGallery } from "@/components/matrices/matrices-gallery";

export const metadata: Metadata = {
  title: "比較行列",
  description:
    "カーボンクレジット領域の比較行列を、シナリオ別 / テーマ別に整理。規制対応・クレジット品質・市場戦略・スタンダードの判断軸別に navigate。",
};

/**
 * /matrices 抜本リデザイン.
 *
 * 設計判断:
 *   - 旧版は「テーブル/カード/グリッドの並べ替え」で flat なリストだった.
 *   - 新版は (1) 質問駆動のシナリオ入り口 → (2) テーマ別カードギャラリー → (3) 詳細
 *     の階層構造で、ユーザーが目的に応じて navigate できる体験に.
 *   - 検索/フィルタは sticky だが、シナリオ起点の navigation を補助する位置付け.
 */
export default async function MatricesIndexPage() {
  const matrices = await listPublishedMatrices();

  // 集計メトリクス
  const totalDimensions = matrices.reduce((s, m) => s + m.dimensions.length, 0);
  const totalEntities = new Set(
    matrices.flatMap((m) => m.entities.map((e) => e.slug))
  ).size;

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
            >
              <Columns3 className="h-2.5 w-2.5 mr-1" />
              {matrices.length.toString().padStart(2, "0")} Matrices
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            比較行列
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
            カーボンクレジット領域の判断軸を、シナリオ別・テーマ別に整理した行列群。
            各セルは <span className="text-foreground/85">事実 / 出典 / 編集部の品質観</span> の 3 階層で構造化されている。
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-right">
          <Metric label="Matrices" value={matrices.length} />
          <Metric label="Dimensions" value={totalDimensions} />
          <Metric label="Entities (uniq)" value={totalEntities} />
        </div>
      </header>

      <MatricesGallery matrices={matrices} />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className="label-mono text-muted-foreground">{label}</span>
      <span className="metric-number text-lg font-bold text-foreground tracking-tight leading-none">
        {value.toString().padStart(2, "0")}
      </span>
    </div>
  );
}
