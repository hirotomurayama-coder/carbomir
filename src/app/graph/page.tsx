import type { Metadata } from "next";
import { GitBranch } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listPublishedEntities } from "@/lib/data/queries";
import { RelationGraph } from "@/components/graph/relation-graph";
import { computeEdges } from "@/components/graph/graph-layout";

export const metadata: Metadata = {
  title: "関係グラフ",
  description:
    "Carbomir の関係グラフビュー。entity 間の forward relation を可視化し、業界構造を俯瞰する。",
};

export default async function GraphPage() {
  const entities = await listPublishedEntities();
  const edges = computeEdges(entities);

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge
              variant="outline"
              className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
            >
              <GitBranch className="h-2.5 w-2.5 mr-1" />
              {entities.length.toString().padStart(2, "0")} nodes ·{" "}
              {edges.length.toString().padStart(2, "0")} edges
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            関係グラフ
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
            すべての entity 間 forward relation を 1 枚に可視化。タイプ別にレイヤを分け、ホバーで接続関係を強調表示する。「業界構造を一目で俯瞰」するためのビュー。
          </p>
        </div>
      </header>

      <RelationGraph entities={entities} />

      {/* Notes */}
      <Card className="mt-6">
        <CardContent className="p-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">エッジの意味</strong>: 各 entity の
            <code className="font-mono text-[12px] px-1 mx-0.5 bg-muted/60 rounded border border-border">
              related
            </code>
            (forward relation) を線で表現する。reverse は自動補完される (Referenced By パネルと同じデータ)。
          </p>
          <p>
            <strong className="text-foreground">ノードサイズ</strong>:
            接続数に比例 (双方向の合計)。よく繋がる entity は大きく表示される。
          </p>
          <p>
            <strong className="text-foreground">ラベル表示</strong>:
            ホバー中、または接続数 4 以上のノードでのみ名前を表示してクラッターを抑える。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
