import type { Metadata } from "next";
import { Stamp, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listMechanisms } from "@/lib/data/queries";
import { MechanismsTable } from "@/components/atlas/mechanisms-table";
import { ATLAS_SOURCE_LABEL, ATLAS_SOURCE_URL } from "@/lib/types";

export const metadata: Metadata = {
  title: "Crediting Mechanisms (世界マップ)",
  description:
    "World Bank Carbon Pricing Dashboard が追跡する世界 57 の Crediting Mechanism。",
};

export default async function MechanismsPage() {
  const mechanisms = await listMechanisms();
  const implementedCount = mechanisms.filter((m) => m.status === "Implemented").length;
  const totalIssued = mechanisms.reduce(
    (s, m) => s + (m.cumulative_issued_kt ?? 0),
    0
  );
  const totalProjects = mechanisms.reduce(
    (s, m) => s + (m.cumulative_projects ?? 0),
    0
  );

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <Stamp className="h-2.5 w-2.5 mr-1" />
            Atlas / Crediting Mechanisms
          </Badge>
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider text-emerald-600 dark:text-emerald-400 border-emerald-600/40 dark:border-emerald-400/40"
          >
            {implementedCount} implemented
          </Badge>
          <Badge variant="secondary" className="font-mono text-[10px] tracking-wider">
            ~{(totalIssued / 1000).toFixed(0)} Mt issued ·{" "}
            {totalProjects.toLocaleString()} projects
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          世界の Crediting Mechanisms
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          World Bank Carbon Pricing Dashboard が追跡する全 {mechanisms.length}{" "}
          の Crediting Mechanism (Governmental / Independent / International)。Carbomir が編集解説する Verra VCS / Gold Standard / Plan Vivo / JCM / J-Credit 等は「Carbomir」リンクバッジで識別できる。
        </p>
        <p className="label-mono text-muted-foreground mt-2">
          Source:{" "}
          <a
            href={ATLAS_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline inline-flex items-center gap-1 normal-case"
          >
            <ExternalLink className="h-3 w-3" />
            {ATLAS_SOURCE_LABEL}
          </a>
        </p>
      </header>

      <MechanismsTable mechanisms={mechanisms} />

      <Card className="mt-6">
        <CardContent className="p-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">「Carbomir」リンクバッジ</strong>: World Bank
            の収録名と Carbomir 既存エンティティが一致するレジストリ。クリックで Carbomir
            の編集解説ページへ。
          </p>
          <p>
            <strong className="text-foreground">単位</strong>: Issued / Retired / Cancelled は kt CO2e (World Bank 表記)、テーブル上は Mt / k に丸めて表示。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
