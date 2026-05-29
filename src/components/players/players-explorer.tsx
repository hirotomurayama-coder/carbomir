"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUpRight, ExternalLink, Building2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import type { Entity } from "@/lib/types";
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
import { STICKY_TH } from "@/components/explorer/use-sticky-toolbar";

type Props = {
  players: Entity[];
};

const ROLE_ORDER = [
  // ガバナンス層
  "レジストリ運営",
  "国際ガバナンス",
  "国際ガバナンス (需要側)",
  "認証 / ガイドライン",
  // 供給側
  "DAC 事業者",
  // 需要側
  "大手需要家 (CDR offtake)",
  "需要家集約 (CDR / NBS 共同基金)",
  "投資ファンド",
  // 国内仲介
  "国内取扱業者 (商社)",
  "国内取扱業者 (プラットフォーム)",
] as const;

const ROLE_SHORT_LABEL: Record<string, string> = {
  レジストリ運営: "レジストリ",
  国際ガバナンス: "ガバナンス",
  "国際ガバナンス (需要側)": "ガバナンス(需要)",
  "認証 / ガイドライン": "認証",
  "DAC 事業者": "DAC",
  "大手需要家 (CDR offtake)": "需要家",
  "需要家集約 (CDR / NBS 共同基金)": "需要集約",
  投資ファンド: "ファンド",
  "国内取扱業者 (商社)": "商社",
  "国内取扱業者 (プラットフォーム)": "国内 PF",
};

type RoleFilter = "all" | string;

export function PlayersExplorer({ players }: Props) {
  const [view, setView] = React.useState<ViewMode>("list");
  const [density, setDensity] = React.useState<Density>("compact");
  const [role, setRole] = React.useState<RoleFilter>("all");

  // 役割の出現リスト
  const availableRoles = React.useMemo(() => {
    const set = new Set<string>();
    for (const p of players) set.add(p.business_role ?? "その他");
    // ROLE_ORDER 優先で並べ替え
    const order: string[] = [];
    for (const r of ROLE_ORDER) if (set.has(r)) order.push(r);
    for (const r of set) if (!order.includes(r)) order.push(r);
    return order;
  }, [players]);

  const roleFiltered = React.useMemo(() => {
    if (role === "all") return players;
    return players.filter((p) => (p.business_role ?? "その他") === role);
  }, [players, role]);

  const controls = useTableControls<Entity>({
    items: roleFiltered,
    searchText: (p) =>
      [
        p.name_ja,
        p.name_en ?? "",
        p.abbreviation ?? "",
        p.summary ?? "",
        p.jurisdiction ?? "",
        p.parent_company ?? "",
        p.business_role ?? "",
        ...(p.tags ?? []),
      ].join(" "),
    sortableColumns: [
      { key: "name", sortValue: (p) => p.name_en ?? p.name_ja },
      { key: "role", sortValue: (p) => p.business_role ?? "" },
      { key: "jurisdiction", sortValue: (p) => p.jurisdiction ?? "" },
      { key: "founded", sortValue: (p) => p.established_year ?? Infinity },
      { key: "reviewed", sortValue: (p) => p.last_reviewed_at },
    ],
    defaultSort: { key: "role", dir: "asc" },
  });

  const tabFilter = (
    <Tabs
      value={role}
      onValueChange={(v) => setRole(v as RoleFilter)}
      className="min-w-0"
    >
      <TabsList className="h-8">
        <TabsTrigger value="all" className="text-xs px-2.5">
          すべて
          <span className="ml-1.5 metric-number text-[10px] text-muted-foreground">
            {players.length}
          </span>
        </TabsTrigger>
        {availableRoles.map((r) => {
          const count = players.filter(
            (p) => (p.business_role ?? "その他") === r
          ).length;
          return (
            <TabsTrigger key={r} value={r} className="text-xs px-2.5">
              {ROLE_SHORT_LABEL[r] ?? r}
              <span className="ml-1.5 metric-number text-[10px] text-muted-foreground">
                {count}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
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
        totalCount={players.length}
        itemLabel="players"
        placeholder="プレイヤー名・本拠地・親会社で絞り込み..."
        leftSlot={tabFilter}
        sticky
      />

      {controls.visible.length === 0 ? (
        <Card className="p-12">
          <p className="text-center label-mono text-muted-foreground">
            該当するプレイヤーはありません
          </p>
        </Card>
      ) : view === "list" ? (
        <ListView
          players={controls.visible}
          density={density}
          sort={controls.sort}
          onToggleSort={controls.toggleSort}
        />
      ) : (
        <GridView players={controls.visible} />
      )}
    </div>
  );
}

/* ============================================================
 * List view
 * ============================================================ */

function ListView({
  players,
  density,
  sort,
  onToggleSort,
}: {
  players: Entity[];
  density: Density;
  sort: { key: string; dir: "asc" | "desc" } | null;
  onToggleSort: (key: string) => void;
}) {
  const rowPad = density === "compact" ? "py-2" : "py-3";

  return (
    <Card className="overflow-clip p-0">
      <table className="w-full text-sm border-separate border-spacing-0">
          <thead>
            <tr className="border-b border-border">
              <SortableHeader
                sortKey="name"
                current={sort}
                onToggle={onToggleSort}
                minWidth="260px"
                className={STICKY_TH}
              >
                Name
              </SortableHeader>
              <SortableHeader
                sortKey="role"
                current={sort}
                onToggle={onToggleSort}
                minWidth="120px"
                className={STICKY_TH}
              >
                役割
              </SortableHeader>
              <SortableHeader
                sortKey="jurisdiction"
                current={sort}
                onToggle={onToggleSort}
                minWidth="80px"
                className={`hidden md:table-cell ${STICKY_TH}`}
              >
                本拠
              </SortableHeader>
              <SortableHeader
                sortKey="founded"
                current={sort}
                onToggle={onToggleSort}
                minWidth="70px"
                className={`hidden lg:table-cell ${STICKY_TH}`}
              >
                設立
              </SortableHeader>
              <StaticHeader minWidth="180px" className={`hidden xl:table-cell ${STICKY_TH}`}>
                親会社 / 規模
              </StaticHeader>
              <SortableHeader
                sortKey="reviewed"
                current={sort}
                onToggle={onToggleSort}
                minWidth="100px"
                className={`hidden md:table-cell ${STICKY_TH}`}
              >
                Reviewed
              </SortableHeader>
              <th className={`w-10 px-3 py-2 ${STICKY_TH}`}></th>
            </tr>
          </thead>
          <tbody>
            {players.map((p) => (
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
                      <p className="font-mono text-[10.5px] text-muted-foreground mt-0.5 truncate max-w-[360px]">
                        {p.name_en}
                        {p.abbreviation && (
                          <span className="ml-2 opacity-70">({p.abbreviation})</span>
                        )}
                      </p>
                    )}
                  </Link>
                </td>
                <td className={`px-3 ${rowPad} align-top`}>
                  <span className="inline-flex items-center rounded border border-border bg-muted/50 px-1.5 py-0 text-[10px] leading-[16px] text-foreground/80">
                    {ROLE_SHORT_LABEL[p.business_role ?? "その他"] ??
                      p.business_role ??
                      "—"}
                  </span>
                </td>
                <td
                  className={`px-3 ${rowPad} align-top hidden md:table-cell text-[12.5px] text-foreground/85`}
                >
                  {p.jurisdiction ?? "—"}
                </td>
                <td
                  className={`px-3 ${rowPad} align-top hidden lg:table-cell metric-number text-[12px] text-muted-foreground`}
                >
                  {p.established_year ?? "—"}
                </td>
                <td
                  className={`px-3 ${rowPad} align-top hidden xl:table-cell text-[12px] text-muted-foreground`}
                >
                  <span className="truncate block max-w-[220px]">
                    {p.parent_company ?? p.geographic_scope ?? "—"}
                  </span>
                </td>
                <td
                  className={`px-3 ${rowPad} align-top hidden md:table-cell metric-number text-[11px] text-muted-foreground`}
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
    </Card>
  );
}

/* ============================================================
 * Grid view (compact gallery)
 * ============================================================ */

function GridView({ players }: { players: Entity[] }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {players.map((p) => (
        <Card
          key={p.slug}
          className="h-full p-3.5 hover:border-accent/60 hover:shadow-[0_4px_24px_-8px_rgba(14,165,233,0.18)] transition-all group"
        >
          <Link href={`/entities/${p.slug}`} className="block mb-2">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                {p.jurisdiction && (
                  <span className="inline-flex items-center rounded border border-border bg-muted/50 px-1.5 py-0 text-[10px] leading-[16px] text-foreground/80">
                    {p.jurisdiction}
                  </span>
                )}
                {p.business_role && (
                  <span className="inline-flex items-center rounded border border-accent/30 bg-accent/5 px-1.5 py-0 text-[10px] leading-[16px] text-accent">
                    <Building2 className="h-2.5 w-2.5 mr-0.5" />
                    {ROLE_SHORT_LABEL[p.business_role] ?? p.business_role}
                  </span>
                )}
              </div>
              <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-accent transition-colors" />
            </div>
            <h3 className="text-[14px] font-semibold text-foreground mb-0.5 leading-tight group-hover:text-accent">
              {p.name_ja}
            </h3>
            {p.name_en && p.name_en !== p.name_ja && (
              <p className="font-mono text-[10.5px] text-muted-foreground mb-1.5 truncate">
                {p.name_en}
              </p>
            )}
            <p className="text-[12.5px] text-muted-foreground leading-relaxed line-clamp-2">
              {p.summary}
            </p>
          </Link>
          <div className="flex items-center gap-2 label-mono text-[10px] text-muted-foreground">
            {p.established_year !== undefined && (
              <span>
                <span className="opacity-70">est. </span>
                <span className="metric-number text-foreground/85">
                  {p.established_year}
                </span>
              </span>
            )}
            {p.website_url && (
              <a
                href={p.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto inline-flex items-center gap-1 text-accent hover:underline normal-case"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}
