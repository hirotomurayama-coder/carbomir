import { Suspense } from "react";
import type { Metadata } from "next";
import { BookOpenText, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { listPublishedEntities } from "@/lib/data/queries";
import { EntitiesExplorer } from "@/components/entities/entities-explorer";
import { listLinkedSlugs } from "@/lib/data/glossary-links";

export const metadata: Metadata = {
  title: "用語集 (Glossary)",
  description:
    "カーボンクレジット領域の用語集。制度・メソドロジー・スタンダード・概念を構造化定義 + 編集論点付きで提供。carboncredits.jp の用語集と相互参照。",
};

export default async function EntitiesIndexPage() {
  // プレイヤー (企業・機関) は /players で表現するため、用語集からは除外.
  // 用語集は「概念 / メソドロジー / 制度・規制 / 技術」のみに絞る.
  const allEntities = await listPublishedEntities();
  const entities = allEntities.filter((e) => e.type !== "player");
  const linkedSlugSet = new Set(listLinkedSlugs());
  const linkedCount = entities.filter((e) => linkedSlugSet.has(e.slug)).length;

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <header className="mb-6 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge
              variant="outline"
              className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
            >
              <BookOpenText className="h-2.5 w-2.5 mr-1" />
              {entities.length.toString().padStart(2, "0")} Terms
            </Badge>
            <Badge
              variant="outline"
              className="font-mono text-[10px] tracking-wider uppercase border-sky-500/40 text-sky-700 dark:text-sky-300"
            >
              <ExternalLink className="h-2.5 w-2.5 mr-1" />
              {linkedCount.toString().padStart(2, "0")} linked to
              carboncredits.jp
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            用語集 <span className="text-muted-foreground text-lg font-normal">(Glossary)</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl leading-relaxed">
            カーボンクレジット領域の用語を構造化定義 + 編集論点付きで提供。
            制度・規制・メソドロジー・技術・概念を横断的に整理し、
            関連エンティティ・関連比較行列・出典を保持する。
            (企業・機関の一覧は <a href="/players" className="text-accent hover:underline">プレイヤー</a> ページに分離)
            <a
              href="https://carboncredits.jp/glossary/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-accent hover:underline ml-1"
            >
              carboncredits.jp 用語集
              <ExternalLink className="h-3 w-3 inline" />
            </a>
            と相互参照可能。
          </p>
        </div>
      </header>

      <Suspense fallback={null}>
        <EntitiesExplorer entities={entities} />
      </Suspense>
    </div>
  );
}
