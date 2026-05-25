import type { Metadata } from "next";
import { HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { listPublishedEntities, listPublishedFaqs } from "@/lib/data/queries";
import { FaqExplorer } from "@/components/faq/faq-explorer";

export const metadata: Metadata = {
  title: "FAQ / 実務 Q&A",
  description:
    "事業会社の CSR / 調達 / 経企担当者が現場で直面する実務質問に編集部が回答。GX-ETS / Verra / Scope3 / SBT 等の判断ポイントを構造化。",
};

export default async function FaqPage() {
  const [items, entities] = await Promise.all([
    listPublishedFaqs(),
    listPublishedEntities(),
  ]);

  const entityNameMap: Record<string, string> = {};
  for (const e of entities) entityNameMap[e.slug] = e.name_ja;

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <HelpCircle className="h-2.5 w-2.5 mr-1" />
            {items.length.toString().padStart(2, "0")} Q&amp;A
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          FAQ / 実務 Q&amp;A
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          事業会社の CSR / 調達 / 経企担当者が現場で直面する実務質問への回答集。
          short answer で要点を確定し、詳細解説で議論を補強。上司・取締役会への説明素材として転用しやすい構造化された Q&amp;A。
        </p>
      </header>

      <FaqExplorer items={items} entityNameMap={entityNameMap} />
    </div>
  );
}
