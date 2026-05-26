import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  Database,
  ExternalLink,
  ArrowUpRight,
  Building2,
  Globe,
  Tag,
  Layers,
  CalendarClock,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { findOffsetsDbProject } from "@/lib/data/queries";
import { getOffsetsRegistryLinkedEntity } from "@/lib/data/atlas";
import {
  translateOffsetsCategory,
  translateOffsetsProjectType,
} from "@/lib/data/atlas-i18n";
import { countryNameJa } from "@/lib/data/country-geo";
import {
  OFFSETS_DB_SOURCE_LABEL,
  OFFSETS_DB_SOURCE_URL,
  OFFSETS_DB_TERMS_URL,
} from "@/lib/types";

// SSG はせず on-demand SSR (Node module cache で in-memory ヒット)
export const dynamicParams = true;

const REGISTRY_LABEL: Record<string, string> = {
  verra: "Verra (VCS)",
  "gold-standard": "Gold Standard",
  "climate-action-reserve": "Climate Action Reserve",
  "american-carbon-registry": "American Carbon Registry",
  cercarbono: "CercaCarbono",
  isometric: "Isometric",
  "art-trees": "ART TREES",
};

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await findOffsetsDbProject(id);
  if (!project) return { title: "Project not found" };
  return {
    title: `${project.name} (${project.project_id})`,
    description: `${REGISTRY_LABEL[project.registry] ?? project.registry} に登録された ${project.country ?? "—"} のオフセットプロジェクト。累計発行 ${fmtTonnes(project.issued)}、累計償却 ${fmtTonnes(project.retired)}。`,
  };
}

function fmtTonnes(n: number): string {
  if (!n || n === 0) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return Math.round(n).toLocaleString();
}

function fmtFullNum(n: number): string {
  return Math.round(n).toLocaleString();
}

export default async function OffsetsProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const project = await findOffsetsDbProject(id);
  if (!project) notFound();

  const linkedRegistry = getOffsetsRegistryLinkedEntity(project.registry);
  const registryLabel = REGISTRY_LABEL[project.registry] ?? project.registry;
  const net = project.issued - project.retired;
  const retirementRate =
    project.issued > 0 ? (project.retired / project.issued) * 100 : 0;

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1100px] mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-2 label-mono text-muted-foreground">
        <Link
          href="/atlas/offsets-db"
          className="hover:text-foreground transition-colors"
        >
          OffsetsDB
        </Link>
        <span>/</span>
        <Link
          href="/atlas/offsets-db/projects"
          className="hover:text-foreground transition-colors"
        >
          Projects
        </Link>
        <span>/</span>
        <span className="text-foreground/80">{project.project_id}</span>
      </nav>

      {/* Header */}
      <header className="mb-6 pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <Database className="h-2.5 w-2.5 mr-1" />
            Atlas / OffsetsDB / Project
          </Badge>
          <Badge variant="secondary" className="font-mono text-[10px] tracking-wider">
            {registryLabel}
          </Badge>
          {project.status && (
            <Badge
              variant="outline"
              className={`font-mono text-[10px] tracking-wider ${
                project.status === "registered" || project.status === "active"
                  ? "text-emerald-600 dark:text-emerald-400 border-emerald-600/40 dark:border-emerald-400/40"
                  : "text-muted-foreground border-border"
              }`}
            >
              {project.status}
            </Badge>
          )}
          {project.is_compliance && (
            <Badge
              variant="outline"
              className="font-mono text-[10px] tracking-wider text-amber-600 dark:text-amber-400 border-amber-600/40 dark:border-amber-400/40"
            >
              <ShieldCheck className="h-2.5 w-2.5 mr-1" />
              Compliance use
            </Badge>
          )}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
          {project.name}
        </h1>
        <p className="font-mono text-[11px] text-muted-foreground mt-2">
          Project ID: <span className="text-foreground/80">{project.project_id}</span>
          {project.proponent && (
            <>
              {" · "}
              Proponent:{" "}
              <span className="text-foreground/80">{project.proponent}</span>
            </>
          )}
        </p>

        {/* Action bar */}
        <div className="mt-4 flex items-center gap-2 flex-wrap">
          {project.project_url && (
            <a
              href={project.project_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground hover:bg-accent/90 transition-colors"
            >
              レジストリ公式ページ
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          )}
          {linkedRegistry && (
            <Link
              href={`/entities/${linkedRegistry}`}
              className="inline-flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              {registryLabel} の Carbomir 解説
            </Link>
          )}
          <Link
            href={`/atlas/offsets-db/projects?registry=${project.registry}`}
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
          >
            同じ Registry の他案件
          </Link>
        </div>
      </header>

      {/* Metrics */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="累計発行 (Issued)"
          value={fmtTonnes(project.issued)}
          subValue={`${fmtFullNum(project.issued)} tCO2e`}
          accent
        />
        <MetricCard
          label="累計償却 (Retired)"
          value={fmtTonnes(project.retired)}
          subValue={`${fmtFullNum(project.retired)} tCO2e`}
        />
        <MetricCard
          label="差分 (発行−償却)"
          value={fmtTonnes(net)}
          subValue={
            project.issued > 0
              ? `償却率 ${retirementRate.toFixed(1)}%`
              : "発行実績なし"
          }
        />
        <MetricCard
          label="初回発行"
          value={project.first_issuance_at ?? "—"}
          subValue={project.first_issuance_at ? "first issuance date" : "未発行"}
        />
      </section>

      {/* Meta table */}
      <section className="mb-8">
        <h2 className="label-mono text-foreground mb-3">プロジェクト属性</h2>
        <Card className="overflow-hidden p-0">
          <dl className="divide-y divide-border text-sm">
            <MetaRow
              icon={<Building2 className="h-3.5 w-3.5" />}
              label="Registry"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-foreground">{registryLabel}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    ({project.registry})
                  </span>
                  {linkedRegistry && (
                    <Link
                      href={`/entities/${linkedRegistry}`}
                      className="ml-1 inline-flex items-center gap-0.5 rounded border border-accent/40 bg-accent/10 px-1.5 py-0 text-[10px] text-accent hover:bg-accent/20"
                    >
                      <ExternalLink className="h-2.5 w-2.5" />
                      Carbomir
                    </Link>
                  )}
                </span>
              }
            />
            <MetaRow
              icon={<Tag className="h-3.5 w-3.5" />}
              label="Category"
              value={
                project.category
                  ? translateOffsetsCategory(project.category)
                  : "—"
              }
            />
            <MetaRow
              icon={<Layers className="h-3.5 w-3.5" />}
              label="Project Type"
              value={
                project.project_type
                  ? translateOffsetsProjectType(project.project_type)
                  : "—"
              }
            />
            <MetaRow
              icon={<Globe className="h-3.5 w-3.5" />}
              label="Country"
              value={
                project.country ? (
                  <span>
                    <span className="text-foreground">
                      {countryNameJa(project.country)}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground ml-1.5">
                      ({project.country})
                    </span>
                  </span>
                ) : (
                  "—"
                )
              }
            />
            <MetaRow
              icon={<CalendarClock className="h-3.5 w-3.5" />}
              label="First Issuance"
              value={project.first_issuance_at ?? "未発行"}
            />
            <MetaRow
              icon={<ShieldCheck className="h-3.5 w-3.5" />}
              label="Compliance Use"
              value={
                project.is_compliance ? (
                  <Badge
                    variant="outline"
                    className="font-mono text-[10px] tracking-wider text-amber-600 dark:text-amber-400 border-amber-600/40 dark:border-amber-400/40"
                  >
                    Yes
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">No (自主市場のみ)</span>
                )
              }
            />
          </dl>
        </Card>
      </section>

      {/* Notice: transactions are not bundled */}
      <Card className="mb-6 bg-muted/30 border-border">
        <CardContent className="p-5 text-sm text-muted-foreground leading-relaxed">
          <p className="text-foreground font-medium mb-1.5 text-[13px]">
            取引履歴の詳細について
          </p>
          <p>
            このページの「累計発行 / 累計償却」値は、CarbonPlan OffsetsDB が集約した
            <span className="metric-number text-foreground/85 mx-0.5">53 万件</span>
            の取引履歴を本プロジェクト単位で合算したものです。発行・償却の個別取引タイムライン
            (vintage 別 / バイヤー別) は現状 Carbomir には収録していません。詳細は
            {project.project_url ? (
              <>
                {" "}
                <a
                  href={project.project_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  レジストリ公式ページ
                </a>{" "}
                または
              </>
            ) : (
              " "
            )}{" "}
            <a
              href={OFFSETS_DB_SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              CarbonPlan OffsetsDB
            </a>
            を参照してください。
          </p>
        </CardContent>
      </Card>

      {/* Source */}
      <Card>
        <CardContent className="p-5 space-y-2 text-sm text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">Source</strong>:{" "}
            <a
              href={OFFSETS_DB_SOURCE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline inline-flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              {OFFSETS_DB_SOURCE_LABEL}
            </a>{" "}
            ·{" "}
            <a
              href={OFFSETS_DB_TERMS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground underline underline-offset-2"
            >
              Terms of Data Access
            </a>
          </p>
          <p className="text-xs">
            元データは{" "}
            <span className="text-foreground/80">{registryLabel}</span>{" "}
            が公開する事実情報。Carbomir はこれを編集・翻訳・関連付け加工して提供しています。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({
  label,
  value,
  subValue,
  accent,
}: {
  label: string;
  value: string;
  subValue: string;
  accent?: boolean;
}) {
  return (
    <Card className="p-4">
      <p className="label-mono text-muted-foreground mb-1">{label}</p>
      <p
        className={`metric-number text-2xl font-bold tracking-tight leading-none mb-1 ${
          accent ? "text-accent" : "text-foreground"
        }`}
      >
        {value}
      </p>
      <p className="label-mono text-muted-foreground/80 normal-case">
        {subValue}
      </p>
    </Card>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[180px_1fr] items-center gap-4 px-4 py-3">
      <dt className="flex items-center gap-2 label-mono text-muted-foreground">
        <span className="text-muted-foreground/70">{icon}</span>
        {label}
      </dt>
      <dd className="text-foreground/90 text-[13px]">{value}</dd>
    </div>
  );
}
