"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  POLICY_STATUS_LABEL,
  type Entity,
  type PolicyStatus,
} from "@/lib/types";
import { useTableControls } from "@/components/explorer/use-table-controls";
import {
  SortableHeader,
  StaticHeader,
} from "@/components/explorer/sortable-header";
import {
  ExplorerToolbar,
  type Density,
  type ViewMode,
} from "@/components/explorer/explorer-toolbar";

type JurisdictionGroup =
  | "日本"
  | "EU"
  | "米国"
  | "国際"
  | "アジア (日本以外)"
  | "その他";

function classifyJurisdiction(jur: string | undefined): JurisdictionGroup {
  if (!jur) return "その他";
  if (jur.includes("日本") && !jur.includes("二国間")) return "日本";
  if (jur.startsWith("EU")) return "EU";
  if (jur.includes("米国")) return "米国";
  if (jur.includes("韓国") || jur.includes("中国")) return "アジア (日本以外)";
  if (
    jur.startsWith("国際") ||
    jur.includes("UNFCCC") ||
    jur.includes("民間") ||
    jur.includes("二国間")
  )
    return "国際";
  return "その他";
}

const JURISDICTION_ORDER: JurisdictionGroup[] = [
  "日本",
  "EU",
  "米国",
  "国際",
  "アジア (日本以外)",
  "その他",
];

const STATUS_BADGE_CLASS: Record<PolicyStatus, string> = {
  active:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  transition:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  pilot: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  draft: "border-muted-foreground/40 bg-muted/40 text-muted-foreground",
  discontinued:
    "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
};

type RegionFilter = "all" | JurisdictionGroup;
type StatusFilter = "all" | PolicyStatus;

type Props = {
  policies: Entity[];
};

export function PoliciesExplorer({ policies }: Props) {
  const [view, setView] = React.useState<ViewMode>("list");
  const [density, setDensity] = React.useState<Density>("compact");
  const [region, setRegion] = React.useState<RegionFilter>("all");
  const [status, setStatus] = React.useState<StatusFilter>("all");

  const availableRegions = React.useMemo(() => {
    const set = new Set<JurisdictionGroup>();
    for (const p of policies) set.add(classifyJurisdiction(p.jurisdiction));
    return JURISDICTION_ORDER.filter((g) => set.has(g));
  }, [policies]);

  const availableStatuses = React.useMemo(() => {
    const set = new Set<PolicyStatus>();
    for (const p of policies) if (p.policy_status) set.add(p.policy_status);
    return Array.from(set);
  }, [policies]);

  const regionFiltered = React.useMemo(() => {
    if (region === "all") return policies;
    return policies.filter(
      (p) => classifyJurisdiction(p.jurisdiction) === region
    );
  }, [policies, region]);

  const statusFiltered = React.useMemo(() => {
    if (status === "all") return regionFiltered;
    return regionFiltered.filter((p) => p.policy_status === status);
  }, [regionFiltered, status]);

  const controls = useTableControls<Entity>({
    items: statusFiltered,
    searchText: (p) =>
      [
        p.name_ja,
        p.name_en ?? "",
        p.abbreviation ?? "",
        p.summary ?? "",
        p.jurisdiction ?? "",
        p.operator ?? "",
        p.next_milestone ?? "",
        ...(p.tags ?? []),
      ].join(" "),
    sortableColumns: [
      { key: "name", sortValue: (p) => p.name_en ?? p.name_ja },
      { key: "region", sortValue: (p) => classifyJurisdiction(p.jurisdiction) },
      { key: "status", sortValue: (p) => p.policy_status ?? "zzz" },
      { key: "founded", sortValue: (p) => p.established_year ?? Infinity },
      { key: "next", sortValue: (p) => p.next_milestone ?? "zzz" },
      { key: "reviewed", sortValue: (p) => p.last_reviewed_at },
    ],
    defaultSort: { key: "region", dir: "asc" },
  });

  const regionTabs = (
    <Tabs
      value={region}
      onValueChange={(v) => setRegion(v as RegionFilter)}
      className="min-w-0"
    >
      <TabsList className="h-8">
        <TabsTrigger value="all" className="text-xs px-2.5">
          すべて
          <span className="ml-1.5 metric-number text-[10px] text-muted-foreground">
            {policies.length}
          </span>
        </TabsTrigger>
        {availableRegions.map((r) => {
          const count = policies.filter(
            (p) => classifyJurisdiction(p.jurisdiction) === r
          ).length;
          return (
            <TabsTrigger key={r} value={r} className="text-xs px-2.5">
              {r}
              <span className="ml-1.5 metric-number text-[10px] text-muted-foreground">
                {count}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );

  const statusChips = (
    <div className="flex items-center gap-1.5 flex-wrap">
      <button
        type="button"
        onClick={() => setStatus("all")}
        className={`inline-flex items-center rounded border px-2 py-0.5 text-[10.5px] transition-colors ${
          status === "all"
            ? "border-accent/50 bg-accent/15 text-accent"
            : "border-border bg-background text-muted-foreground hover:border-accent/40 hover:text-accent"
        }`}
      >
        ステータス: 全て
      </button>
      {availableStatuses.map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => setStatus(status === s ? "all" : s)}
          className={`inline-flex items-center rounded border px-2 py-0.5 text-[10.5px] font-mono transition-colors ${
            status === s
              ? STATUS_BADGE_CLASS[s]
              : "border-border bg-background text-muted-foreground hover:border-accent/40 hover:text-accent"
          }`}
        >
          {POLICY_STATUS_LABEL[s]}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-3">
      <ExplorerToolbar
        query={controls.query}
        onQueryChange={controls.setQuery}
        view={view}
        onViewChange={setView}
        density={density}
        onDensityChange={setDensity}
        matchCount={controls.visible.length}
        totalCount={policies.length}
        itemLabel="policies"
        placeholder="制度名・運営主体・次マイルストーンで絞り込み..."
        leftSlot={regionTabs}
        sticky
      />

      {statusChips}

      {controls.visible.length === 0 ? (
        <Card className="p-12">
          <p className="text-center label-mono text-muted-foreground">
            該当する制度はありません
          </p>
        </Card>
      ) : view === "list" ? (
        <ListView
          policies={controls.visible}
          density={density}
          sort={controls.sort}
          onToggleSort={controls.toggleSort}
        />
      ) : (
        <GridView policies={controls.visible} />
      )}
    </div>
  );
}

/* ============================================================
 * List view
 * ============================================================ */

function ListView({
  policies,
  density,
  sort,
  onToggleSort,
}: {
  policies: Entity[];
  density: Density;
  sort: { key: string; dir: "asc" | "desc" } | null;
  onToggleSort: (key: string) => void;
}) {
  const rowPad = density === "compact" ? "py-2" : "py-3";

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <SortableHeader
                sortKey="name"
                current={sort}
                onToggle={onToggleSort}
                minWidth="280px"
              >
                制度名
              </SortableHeader>
              <SortableHeader
                sortKey="region"
                current={sort}
                onToggle={onToggleSort}
                minWidth="90px"
              >
                地域
              </SortableHeader>
              <SortableHeader
                sortKey="status"
                current={sort}
                onToggle={onToggleSort}
                minWidth="100px"
              >
                ステータス
              </SortableHeader>
              <SortableHeader
                sortKey="next"
                current={sort}
                onToggle={onToggleSort}
                minWidth="220px"
                className="hidden md:table-cell"
              >
                次の節目
              </SortableHeader>
              <StaticHeader minWidth="120px" className="hidden lg:table-cell">
                運営
              </StaticHeader>
              <SortableHeader
                sortKey="reviewed"
                current={sort}
                onToggle={onToggleSort}
                minWidth="100px"
                className="hidden lg:table-cell"
              >
                Reviewed
              </SortableHeader>
              <th className="w-10 px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {policies.map((p) => (
              <tr
                key={p.slug}
                className="border-b border-border last:border-0 group hover:bg-muted/30 transition-colors"
              >
                <td className={`px-3 ${rowPad} align-top`}>
                  <Link href={`/entities/${p.slug}`} className="block">
                    <p className="font-medium text-foreground group-hover:text-accent leading-tight">
                      {p.name_ja}
                    </p>
                    {p.name_en && p.name_en !== p.name_ja && (
                      <p className="font-mono text-[10.5px] text-muted-foreground mt-0.5 truncate max-w-[380px]">
                        {p.name_en}
                        {p.abbreviation && (
                          <span className="ml-2 opacity-70">({p.abbreviation})</span>
                        )}
                      </p>
                    )}
                  </Link>
                </td>
                <td className={`px-3 ${rowPad} align-top text-[12.5px] text-foreground/85`}>
                  {classifyJurisdiction(p.jurisdiction)}
                </td>
                <td className={`px-3 ${rowPad} align-top`}>
                  {p.policy_status ? (
                    <span
                      className={`inline-flex items-center rounded border px-1.5 py-0 text-[10px] leading-[16px] font-mono ${STATUS_BADGE_CLASS[p.policy_status]}`}
                    >
                      {POLICY_STATUS_LABEL[p.policy_status]}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td
                  className={`px-3 ${rowPad} align-top hidden md:table-cell text-[12px] text-foreground/85 leading-snug max-w-[360px]`}
                >
                  {p.next_milestone ?? <span className="text-muted-foreground">—</span>}
                </td>
                <td
                  className={`px-3 ${rowPad} align-top hidden lg:table-cell text-[12px] text-muted-foreground`}
                >
                  <span className="truncate block max-w-[180px]">
                    {p.operator ?? "—"}
                  </span>
                </td>
                <td
                  className={`px-3 ${rowPad} align-top hidden lg:table-cell metric-number text-[11px] text-muted-foreground`}
                >
                  {p.last_reviewed_at}
                </td>
                <td className={`px-3 ${rowPad} align-top text-right`}>
                  <Link
                    href={`/entities/${p.slug}`}
                    className="inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-accent transition-colors"
                    aria-label="開く"
                  >
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ============================================================
 * Grid view (compact cards)
 * ============================================================ */

function GridView({ policies }: { policies: Entity[] }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {policies.map((p) => (
        <Card
          key={p.slug}
          className="h-full p-3.5 hover:border-accent/60 hover:shadow-[0_4px_24px_-8px_rgba(14,165,233,0.18)] transition-all group"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center rounded border border-border bg-muted/50 px-1.5 py-0 text-[10px] leading-[16px] text-foreground/80">
                {classifyJurisdiction(p.jurisdiction)}
              </span>
              {p.policy_status && (
                <span
                  className={`inline-flex items-center rounded border px-1.5 py-0 text-[10px] leading-[16px] font-mono ${STATUS_BADGE_CLASS[p.policy_status]}`}
                >
                  {POLICY_STATUS_LABEL[p.policy_status]}
                </span>
              )}
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-accent transition-colors" />
          </div>
          <Link href={`/entities/${p.slug}`} className="block mb-2">
            <h3 className="text-[14px] font-semibold text-foreground mb-0.5 leading-tight group-hover:text-accent">
              {p.name_ja}
            </h3>
            {p.name_en && p.name_en !== p.name_ja && (
              <p className="font-mono text-[10.5px] text-muted-foreground mb-1.5 truncate">
                {p.name_en}
              </p>
            )}
            <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">
              {p.summary}
            </p>
          </Link>
          {p.next_milestone && (
            <p className="text-[11px] text-foreground/80 leading-snug border-t border-border/60 pt-1.5 line-clamp-2">
              <span className="label-mono text-muted-foreground mr-1">次→</span>
              {p.next_milestone}
            </p>
          )}
          {p.website_url && (
            <a
              href={p.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 inline-flex items-center gap-1 label-mono text-[10px] text-accent hover:underline normal-case"
            >
              <ExternalLink className="h-3 w-3" />
              {p.website_url.replace(/^https?:\/\//, "").replace(/\/$/, "").slice(0, 40)}
            </a>
          )}
        </Card>
      ))}
    </div>
  );
}
