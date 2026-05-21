import Link from "next/link";
import {
  Columns3,
  Network,
  ArrowUpRight,
  CircleDot,
  Sparkles,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { listPublishedMatrices } from "@/lib/data/comparisons";
import { listPublishedEntities } from "@/lib/data/entities";

type UpdateItem = {
  type: "matrix" | "entity";
  slug: string;
  title: string;
  subtitle?: string;
  last_reviewed_at: string;
  href: string;
};

function getRecentUpdates(): UpdateItem[] {
  const matrices = listPublishedMatrices().map((m) => ({
    type: "matrix" as const,
    slug: m.slug,
    title: m.title,
    subtitle: `${m.entities.length}×${m.dimensions.length} comparison`,
    last_reviewed_at: m.last_reviewed_at,
    href: `/matrices/${m.slug}`,
  }));
  const entities = listPublishedEntities().map((e) => ({
    type: "entity" as const,
    slug: e.slug,
    title: e.name_ja,
    subtitle: e.name_en,
    last_reviewed_at: e.last_reviewed_at,
    href: `/entities/${e.slug}`,
  }));
  return [...matrices, ...entities].sort((a, b) =>
    b.last_reviewed_at.localeCompare(a.last_reviewed_at)
  );
}

export default function DashboardHome() {
  const matrices = listPublishedMatrices();
  const entities = listPublishedEntities();
  const updates = getRecentUpdates();
  const totalDimensions = matrices.reduce((sum, m) => sum + m.dimensions.length, 0);
  const latestDate = updates[0]?.last_reviewed_at ?? "—";

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="outline" className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent">
              <CircleDot className="h-2.5 w-2.5 mr-1 animate-pulse" />
              Live
            </Badge>
            <span className="label-mono text-muted-foreground">
              v3.0 · {latestDate}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            ホーム
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            VCM領域の構造化ナレッジベースの最新状態。
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/matrices"
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            比較行列を開く
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <MetricCard label="Matrices" value={matrices.length} hint="published" />
        <MetricCard label="Entities" value={entities.length} hint="published" />
        <MetricCard label="Dimensions" value={totalDimensions} hint="across matrices" />
        <MetricCard
          label="Last Update"
          value={latestDate}
          hint="reviewed"
          isText
        />
      </div>

      {/* Main grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Recent updates */}
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-row items-start justify-between gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent" />
                Recent Updates
              </CardTitle>
              <CardDescription className="mt-1">
                最近レビューされたエンティティと比較行列
              </CardDescription>
            </div>
            <Badge variant="secondary" className="font-mono text-[10px]">
              {updates.length.toString().padStart(2, "0")}
            </Badge>
          </CardHeader>
          <Separator />
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {updates.map((u) => (
                <li key={`${u.type}-${u.slug}`}>
                  <Link
                    href={u.href}
                    className="group flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors"
                  >
                    <span className={
                      u.type === "matrix"
                        ? "flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent"
                        : "flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary dark:text-accent"
                    }>
                      {u.type === "matrix" ? (
                        <Columns3 className="h-4 w-4" />
                      ) : (
                        <Network className="h-4 w-4" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate group-hover:text-accent">
                        {u.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {u.type === "matrix" ? "比較行列" : "エンティティ"}
                        {u.subtitle ? ` · ${u.subtitle}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="metric-number text-[11px] text-muted-foreground">
                        {u.last_reviewed_at}
                      </span>
                      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-accent transition-colors" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          <QuickAccessCard />
          <StatusCard
            matricesCount={matrices.length}
            entitiesCount={entities.length}
          />
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  hint,
  isText,
}: {
  label: string;
  value: number | string;
  hint?: string;
  isText?: boolean;
}) {
  const display = isText
    ? String(value)
    : typeof value === "number"
      ? value.toString().padStart(2, "0")
      : value;
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <p className="label-mono text-muted-foreground mb-2">{label}</p>
        <p className={
          isText
            ? "metric-number text-xl font-bold text-foreground tracking-tight"
            : "metric-number text-3xl font-bold text-foreground tracking-tight leading-none"
        }>
          {display}
        </p>
        {hint && (
          <p className="label-mono text-muted-foreground/70 mt-2">{hint}</p>
        )}
      </CardContent>
    </Card>
  );
}

function QuickAccessCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          Quick Access
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="p-3 space-y-1">
        <Link
          href="/matrices"
          className="group flex items-center justify-between gap-2 p-3 rounded-md hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent shrink-0">
              <Columns3 className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">比較行列</p>
              <p className="text-xs text-muted-foreground">対比で選ぶ・判断する</p>
            </div>
          </div>
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-accent transition-colors shrink-0" />
        </Link>
        <Link
          href="/entities"
          className="group flex items-center justify-between gap-2 p-3 rounded-md hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary dark:text-accent shrink-0">
              <Network className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">概念体系</p>
              <p className="text-xs text-muted-foreground">制度・メソドロジー・市場</p>
            </div>
          </div>
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-accent transition-colors shrink-0" />
        </Link>
      </CardContent>
    </Card>
  );
}

function StatusCard({
  matricesCount,
  entitiesCount,
}: {
  matricesCount: number;
  entitiesCount: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Status</CardTitle>
        <CardDescription>ナレッジベース運用状況</CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="p-4 space-y-3">
        <StatusRow label="Knowledge Base" status="ok" detail="Operational" />
        <StatusRow
          label="Review Queue"
          status="ok"
          detail={`${matricesCount + entitiesCount} published`}
        />
        <StatusRow label="AI Pipeline" status="pending" detail="Phase 1B" />
      </CardContent>
    </Card>
  );
}

function StatusRow({
  label,
  status,
  detail,
}: {
  label: string;
  status: "ok" | "warn" | "pending";
  detail: string;
}) {
  const color =
    status === "ok"
      ? "bg-emerald-500"
      : status === "warn"
        ? "bg-amber-500"
        : "bg-muted-foreground";
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 min-w-0">
        <span className={`h-2 w-2 rounded-full ${color} shrink-0`} />
        <span className="text-sm text-foreground truncate">{label}</span>
      </div>
      <span className="label-mono text-muted-foreground shrink-0">
        {detail}
      </span>
    </div>
  );
}
