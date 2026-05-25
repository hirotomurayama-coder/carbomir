import type { Metadata } from "next";
import { Columns3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { listPublishedMatrices } from "@/lib/data/queries";
import { MatricesExplorer } from "@/components/matrices/matrices-explorer";

export const metadata: Metadata = {
  title: "比較行列",
  description:
    "制度・メソドロジー・プレイヤー・指標を、実務判断に直結する軸で対比する一覧。",
};

export default async function MatricesIndexPage() {
  const matrices = await listPublishedMatrices();

  // 集計メトリクス (ヘッダー表示用)
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
              {matrices.length.toString().padStart(2, "0")} Published
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            比較行列
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
            制度・メソドロジー・プレイヤー・指標を、実務判断に直結する軸で対比する。各セルは事実・出典・編集部の品質観の 3 階層で構造化されている。
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-right">
          <Metric label="Matrices" value={matrices.length} />
          <Metric label="Dimensions" value={totalDimensions} />
          <Metric label="Entities (uniq)" value={totalEntities} />
        </div>
      </header>

      <MatricesExplorer matrices={matrices} />
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
