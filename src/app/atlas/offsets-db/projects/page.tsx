import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Database, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { listOffsetsDbProjects } from "@/lib/data/queries";
import { getOffsetsRegistryLinkedEntity } from "@/lib/data/atlas";
import { OffsetsProjectsTable } from "@/components/atlas/offsets-projects-table";
import {
  OFFSETS_DB_SOURCE_LABEL,
  OFFSETS_DB_SOURCE_URL,
  OFFSETS_DB_TERMS_URL,
} from "@/lib/types";

export const metadata: Metadata = {
  title: "OffsetsDB Projects",
  description:
    "CarbonPlan OffsetsDB が集約する 11,640 件のオフセットプロジェクト個別。Registry / Category / Country / Status でフィルタ可能。",
};

export default async function OffsetsProjectsPage() {
  const projects = await listOffsetsDbProjects();

  // Registry → Carbomir entity slug の linkage map
  const registryLinkage: Record<string, string> = {};
  for (const p of projects) {
    if (!registryLinkage[p.registry]) {
      const slug = getOffsetsRegistryLinkedEntity(p.registry);
      if (slug) registryLinkage[p.registry] = slug;
    }
  }

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <Database className="h-2.5 w-2.5 mr-1" />
            Atlas / OffsetsDB / Projects
          </Badge>
          <Badge variant="secondary" className="font-mono text-[10px] tracking-wider">
            {projects.length.toLocaleString()} projects
          </Badge>
          <Link
            href="/atlas/offsets-db"
            className="label-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            ← 集計サマリへ
          </Link>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          オフセットプロジェクト一覧
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          CarbonPlan OffsetsDB に収録されている全{" "}
          {projects.length.toLocaleString()}{" "}
          件のプロジェクト個別。各行のリンク (↗) は元のレジストリ公式ページへ。
        </p>
        <p className="label-mono text-muted-foreground mt-2">
          Source:{" "}
          <a
            href={OFFSETS_DB_SOURCE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline inline-flex items-center gap-1 normal-case"
          >
            <ExternalLink className="h-3 w-3" />
            {OFFSETS_DB_SOURCE_LABEL}
          </a>{" "}
          ·{" "}
          <a
            href={OFFSETS_DB_TERMS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground underline underline-offset-2 normal-case"
          >
            Terms
          </a>
        </p>
      </header>

      <Suspense fallback={null}>
        <OffsetsProjectsTable projects={projects} registryLinkage={registryLinkage} />
      </Suspense>

      <Card className="mt-6">
        <CardContent className="p-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">単位</strong>: Issued / Retired は tCO2e (1k = 1,000、1M = 1,000,000)。
          </p>
          <p>
            <strong className="text-foreground">「Carbomir」リンク</strong>:
            Verra / Gold Standard など Carbomir が編集している registry。クリックで詳細解説ページへ。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
