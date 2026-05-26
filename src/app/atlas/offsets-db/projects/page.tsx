import type { Metadata } from "next";
import Link from "next/link";
import { Database, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  listOffsetsDbProjectsFiltered,
  getOffsetsDbFilterOptions,
  getOffsetsDbAggregates,
  type OffsetsDbProjectsQuery,
  type OffsetsDbSortKey,
} from "@/lib/data/queries";
import { getOffsetsRegistryLinkedEntity } from "@/lib/data/atlas";
import { OffsetsProjectsFilters } from "@/components/atlas/offsets-projects-filters";
import { OffsetsProjectsTable } from "@/components/atlas/offsets-projects-table";
import { OffsetsProjectsPagination } from "@/components/atlas/offsets-projects-pagination";
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

const PAGE_SIZE = 50;
const VALID_SORTS: OffsetsDbSortKey[] = ["issued", "retired", "name"];

type Props = {
  searchParams: Promise<{
    q?: string;
    registry?: string | string[];
    category?: string | string[];
    status?: string | string[];
    onlyIssued?: string;
    sort?: string;
    page?: string;
  }>;
};

function toArr(v: string | string[] | undefined): string[] | undefined {
  if (v == null) return undefined;
  const arr = Array.isArray(v) ? v : [v];
  const trimmed = arr.map((s) => s.trim()).filter((s) => s.length > 0);
  return trimmed.length > 0 ? trimmed : undefined;
}

export default async function OffsetsProjectsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const sortKey = (
    sp.sort && (VALID_SORTS as string[]).includes(sp.sort)
      ? (sp.sort as OffsetsDbSortKey)
      : "issued"
  );
  const page = Math.max(0, parseInt(sp.page ?? "0", 10) || 0);

  const query: OffsetsDbProjectsQuery = {
    query: sp.q?.trim() || undefined,
    registries: toArr(sp.registry),
    categories: toArr(sp.category),
    statuses: toArr(sp.status),
    onlyIssued: sp.onlyIssued === "1",
    sortKey,
    page,
    pageSize: PAGE_SIZE,
  };

  const [{ rows, totalCount }, filterOptions, aggregates] = await Promise.all([
    listOffsetsDbProjectsFiltered(query),
    getOffsetsDbFilterOptions(),
    getOffsetsDbAggregates(),
  ]);
  const totalProjects = aggregates.totals.projects;

  // Registry → Carbomir entity の linkage map (option 全部分)
  const registryLinkage: Record<string, string> = {};
  for (const reg of filterOptions.registries) {
    const slug = getOffsetsRegistryLinkedEntity(reg);
    if (slug) registryLinkage[reg] = slug;
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
            {totalProjects.toLocaleString()} projects
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
          {totalProjects.toLocaleString()} 件のプロジェクト個別。各行をクリックで詳細ページへ、
          外部リンク (↗) は元のレジストリ公式ページへ。
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

      <div className="space-y-3">
        <OffsetsProjectsFilters
          initial={query}
          filterOptions={filterOptions}
          totalCount={totalCount}
          totalProjects={totalProjects}
          page={page}
          pageSize={PAGE_SIZE}
        />
        <OffsetsProjectsTable rows={rows} registryLinkage={registryLinkage} />
        <OffsetsProjectsPagination
          page={page}
          pageSize={PAGE_SIZE}
          totalCount={totalCount}
        />
      </div>

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
