import { Suspense } from "react";
import type { Metadata } from "next";
import { Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { listPublishedEntities } from "@/lib/data/queries";
import { EntitiesExplorer } from "@/components/entities/entities-explorer";

export const metadata: Metadata = {
  title: "概念体系",
  description:
    "Carbomir の概念体系。制度・メソドロジー・プレイヤー・市場・技術を専門家編集で構造化する。",
};

export default async function EntitiesIndexPage() {
  const entities = await listPublishedEntities();

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent">
              <Network className="h-2.5 w-2.5 mr-1" />
              {entities.length.toString().padStart(2, "0")} Published
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            概念体系
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
            制度・メソドロジー・プレイヤー・市場・技術を構造化する。各エンティティは関連エンティティ・関連比較行列・出典を保持する。
          </p>
        </div>
      </header>

      <Suspense fallback={null}>
        <EntitiesExplorer entities={entities} />
      </Suspense>
    </div>
  );
}
