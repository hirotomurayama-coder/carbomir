import type { Metadata } from "next";
import Link from "next/link";
import { Scale, CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { listPublishedEntities } from "@/lib/data/queries";
import { PoliciesExplorer } from "@/components/policies/policies-explorer";

export const metadata: Metadata = {
  title: "政策・規制",
  description:
    "Carbomir の政策・規制トラッカー。各国/地域の主要制度のステータス・次のマイルストーン・運営主体を一覧する。",
};

export default async function PoliciesPage() {
  const all = await listPublishedEntities();
  const policies = all.filter((e) => e.type === "regulation");

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <Scale className="h-2.5 w-2.5 mr-1" />
            {policies.length.toString().padStart(2, "0")} Published
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          政策・規制
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
          各国/地域の主要なカーボン関連制度のステータスと次マイルストーンを集約。事業会社の中期計画・調達設計の前提条件をすぐ把握できるよう、jurisdiction で大分類する。
        </p>
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <Link
            href="/policies/calendar"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-xs font-medium"
          >
            <CalendarClock className="h-3.5 w-3.5" />
            規制カレンダーを開く →
          </Link>
          <Link
            href="/timeline"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/40 text-foreground/80 hover:bg-muted/60 transition-colors text-xs font-medium"
          >
            時系列 (全イベント統合) →
          </Link>
        </div>
      </header>

      <PoliciesExplorer policies={policies} />
    </div>
  );
}
