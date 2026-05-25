import type { Metadata } from "next";
import { Columns3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { listPublishedMatrices } from "@/lib/data/queries";
import { MatricesExplorer } from "@/components/matrices/matrices-explorer";
import { MATRIX_CATEGORY_LABEL } from "@/lib/types";

export const metadata: Metadata = {
  title: "比較行列",
  description:
    "Carbomir の比較行列一覧。VCM領域の主要対比を専門家編集で提供する。",
};

export default async function MatricesIndexPage() {
  const matrices = await listPublishedMatrices();

  // 集計メトリクス (ヘッダー表示用)
  const totalDimensions = matrices.reduce((s, m) => s + m.dimensions.length, 0);
  const totalEntities = new Set(
    matrices.flatMap((m) => m.entities.map((e) => e.slug))
  ).size;
  let totalCells = 0;
  for (const m of matrices) {
    for (const e of m.entities) {
      const row = m.cells[e.slug];
      if (!row) continue;
      for (const d of m.dimensions) {
        if (row[d.key]) totalCells++;
      }
    }
  }

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
            制度・メソドロジー・プレイヤー・指標を、実務判断に直結する軸で対比する。Carbomir
            の主力商品。各セルは事実・出典・編集部の品質観を保持する。
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-right">
          <Metric label="Matrices" value={matrices.length} />
          <Metric label="Dimensions" value={totalDimensions} />
          <Metric label="Entities (uniq)" value={totalEntities} />
        </div>
      </header>

      <MatricesExplorer matrices={matrices} />

      {/* Help card */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Columns3 className="h-4 w-4 text-accent" />
            比較行列の構成
          </CardTitle>
        </CardHeader>
        <Separator />
        <CardContent className="pt-4 space-y-3">
          <CardDescription className="text-sm leading-relaxed">
            すべての行列は{" "}
            <strong className="text-foreground">エンティティ × 軸</strong>{" "}
            の交差をセルで埋めた構造で、各セルは
            <span className="font-mono text-foreground"> value / source / note </span>
            の 3 要素を持つ。事実列・出典列・編集部の品質観列を並列に扱える。
          </CardDescription>
          <CardDescription className="text-sm leading-relaxed">
            カテゴリは現在{" "}
            {(Object.keys(MATRIX_CATEGORY_LABEL) as Array<keyof typeof MATRIX_CATEGORY_LABEL>)
              .map((k) => MATRIX_CATEGORY_LABEL[k])
              .join(" / ")}
            。今後の拡張で追加していく。
          </CardDescription>
        </CardContent>
      </Card>
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
