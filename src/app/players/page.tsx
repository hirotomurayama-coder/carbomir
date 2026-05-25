import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { listPublishedEntities } from "@/lib/data/queries";
import { PlayersExplorer } from "@/components/players/players-explorer";

export const metadata: Metadata = {
  title: "プレイヤー",
  description:
    "Carbomir のプレイヤー一覧。レジストリ運営者・DAC 事業者・国内取扱業者・大手需要家を本拠地・役割・設立年などの構造化属性で整理する。",
};

export default async function PlayersPage() {
  const all = await listPublishedEntities();
  const players = all.filter((e) => e.type === "player");

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <Building2 className="h-2.5 w-2.5 mr-1" />
            {players.length.toString().padStart(2, "0")} Published
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
          プレイヤー
        </h1>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">
          レジストリ運営者・DAC 事業者・国内取扱業者・大手需要家を、本拠地・役割・設立年などの構造化属性で整理。比較行列や時系列イベントから自然にリンクする。
        </p>
      </header>

      <PlayersExplorer players={players} />
    </div>
  );
}
