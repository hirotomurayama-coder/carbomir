"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Search, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { OffsetsDbProject } from "@/lib/types";

type Props = {
  projects: OffsetsDbProject[];
  registryLinkage: Record<string, string>;
};

const PAGE_SIZE = 50;

const REGISTRY_LABEL: Record<string, string> = {
  verra: "Verra (VCS)",
  "gold-standard": "Gold Standard",
  "climate-action-reserve": "Climate Action Reserve",
  "american-carbon-registry": "American Carbon Registry",
  cercarbono: "CercaCarbono",
  isometric: "Isometric",
  "art-trees": "ART TREES",
};

function fmtNum(n?: number): string {
  if (n == null || n === 0) return "—";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return Math.round(n).toString();
}

export function OffsetsProjectsTable({ projects, registryLinkage }: Props) {
  const searchParams = useSearchParams();
  const initialRegistry = searchParams.get("registry");
  const initialCategory = searchParams.get("category");

  const [query, setQuery] = React.useState("");
  const [registryFilter, setRegistryFilter] = React.useState<Set<string>>(
    initialRegistry ? new Set([initialRegistry]) : new Set()
  );
  const [categoryFilter, setCategoryFilter] = React.useState<Set<string>>(
    initialCategory ? new Set([initialCategory]) : new Set()
  );
  const [statusFilter, setStatusFilter] = React.useState<Set<string>>(new Set());
  const [onlyIssued, setOnlyIssued] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const [sortKey, setSortKey] = React.useState<"issued" | "retired" | "name">(
    "issued"
  );

  const allRegistries = React.useMemo(
    () => Array.from(new Set(projects.map((p) => p.registry))).sort(),
    [projects]
  );
  const allCategories = React.useMemo(
    () => Array.from(new Set(projects.map((p) => p.category ?? "unknown"))).sort(),
    [projects]
  );
  const allStatuses = React.useMemo(
    () => Array.from(new Set(projects.map((p) => p.status ?? "unknown"))).sort(),
    [projects]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    const arr = projects.filter((p) => {
      if (registryFilter.size > 0 && !registryFilter.has(p.registry)) return false;
      if (categoryFilter.size > 0 && !categoryFilter.has(p.category ?? "unknown"))
        return false;
      if (statusFilter.size > 0 && !statusFilter.has(p.status ?? "unknown"))
        return false;
      if (onlyIssued && (!p.issued || p.issued <= 0)) return false;
      if (q) {
        const hay = [p.name, p.proponent ?? "", p.project_id, p.country ?? ""]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    // sort
    arr.sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      return (b[sortKey] ?? 0) - (a[sortKey] ?? 0);
    });
    return arr;
  }, [projects, query, registryFilter, categoryFilter, statusFilter, onlyIssued, sortKey]);

  // ページ番号がフィルタ後の総数を超えていたらリセット
  React.useEffect(() => {
    setPage(0);
  }, [query, registryFilter, categoryFilter, statusFilter, onlyIssued, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggle = (
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
    v: string
  ) =>
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative min-w-[280px] flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="プロジェクト名 / 事業者 / Project ID / 国 で絞り込み..."
            className="h-9 pl-8 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FilterDropdown
            label="Registry"
            options={allRegistries}
            active={registryFilter}
            onToggle={(v) => toggle(setRegistryFilter, v)}
            onClear={() => setRegistryFilter(new Set())}
            optionLabel={(o) => REGISTRY_LABEL[o] ?? o}
          />
          <FilterDropdown
            label="Category"
            options={allCategories}
            active={categoryFilter}
            onToggle={(v) => toggle(setCategoryFilter, v)}
            onClear={() => setCategoryFilter(new Set())}
          />
          <FilterDropdown
            label="Status"
            options={allStatuses}
            active={statusFilter}
            onToggle={(v) => toggle(setStatusFilter, v)}
            onClear={() => setStatusFilter(new Set())}
          />
          <Button
            variant={onlyIssued ? "default" : "outline"}
            size="sm"
            className="h-9 text-xs"
            onClick={() => setOnlyIssued(!onlyIssued)}
            aria-pressed={onlyIssued}
          >
            発行実績あり
          </Button>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap label-mono text-muted-foreground px-1">
        <span>
          <span className="metric-number text-foreground">
            {filtered.length.toLocaleString()}
          </span>
          /
          <span className="metric-number">{projects.length.toLocaleString()}</span>{" "}
          projects ·
          <span className="ml-2">Page {page + 1} / {totalPages}</span>
        </span>
        <div className="flex items-center gap-1.5">
          <span>Sort:</span>
          <select
            className="bg-card border border-border rounded px-1.5 py-0.5 text-foreground"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
          >
            <option value="issued">Issued (大→小)</option>
            <option value="retired">Retired (大→小)</option>
            <option value="name">Name (A→Z)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5 min-w-[280px]">Project</th>
                <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5">Registry</th>
                <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5">Category</th>
                <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5">Country</th>
                <th className="text-right label-mono text-muted-foreground font-normal px-4 py-2.5">Issued</th>
                <th className="text-right label-mono text-muted-foreground font-normal px-4 py-2.5">Retired</th>
                <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5">Status</th>
                <th className="w-12 px-4 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center label-mono text-muted-foreground">
                    該当するプロジェクトはありません
                  </td>
                </tr>
              ) : (
                pageRows.map((p) => {
                  const linkedRegistry = registryLinkage[p.registry];
                  return (
                    <tr key={p.project_id} className="border-t border-border hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-2 align-top">
                        <p className="font-medium text-foreground text-[13px] line-clamp-2">
                          {p.name}
                        </p>
                        <p className="font-mono text-[10.5px] text-muted-foreground mt-0.5">
                          {p.project_id}
                          {p.proponent && (
                            <>
                              {" · "}
                              <span className="text-muted-foreground/80">
                                {p.proponent.length > 40
                                  ? p.proponent.slice(0, 40) + "…"
                                  : p.proponent}
                              </span>
                            </>
                          )}
                        </p>
                      </td>
                      <td className="px-4 py-2 align-top">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10.5px] text-foreground/80">
                            {REGISTRY_LABEL[p.registry] ?? p.registry}
                          </span>
                          {linkedRegistry && (
                            <Link
                              href={`/entities/${linkedRegistry}`}
                              className="inline-flex items-center gap-0.5 rounded border border-accent/40 bg-accent/10 px-1 py-0 text-[9.5px] text-accent hover:bg-accent/20"
                            >
                              <ExternalLink className="h-2.5 w-2.5" />
                            </Link>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 align-top text-foreground/85 text-[12.5px]">
                        {p.category ?? "—"}
                      </td>
                      <td className="px-4 py-2 align-top text-foreground/85 text-[12.5px]">
                        {p.country ?? "—"}
                      </td>
                      <td className="px-4 py-2 align-top text-right metric-number text-[12.5px] text-foreground">
                        {fmtNum(p.issued)}
                      </td>
                      <td className="px-4 py-2 align-top text-right metric-number text-[12.5px] text-foreground">
                        {fmtNum(p.retired)}
                      </td>
                      <td className="px-4 py-2 align-top">
                        <Badge
                          variant="outline"
                          className={`font-mono text-[10px] tracking-wider ${
                            p.status === "registered" || p.status === "active"
                              ? "text-emerald-600 dark:text-emerald-400 border-emerald-600/40 dark:border-emerald-400/40"
                              : "text-muted-foreground border-border"
                          }`}
                        >
                          {p.status ?? "—"}
                        </Badge>
                      </td>
                      <td className="px-4 py-2 align-top text-right">
                        {p.project_url && (
                          <a
                            href={p.project_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-accent transition-colors"
                            aria-label="レジストリの公式ページを開く"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between gap-2 px-1">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          Prev
        </Button>
        <span className="label-mono text-muted-foreground">
          {(page * PAGE_SIZE + 1).toLocaleString()} –
          {" "}
          {Math.min((page + 1) * PAGE_SIZE, filtered.length).toLocaleString()}
          {" "}
          of {filtered.length.toLocaleString()}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
        >
          Next
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

function FilterDropdown({
  label,
  options,
  active,
  onToggle,
  onClear,
  optionLabel,
}: {
  label: string;
  options: string[];
  active: Set<string>;
  onToggle: (v: string) => void;
  onClear: () => void;
  optionLabel?: (o: string) => string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5">
          {label}
          {active.size > 0 && (
            <span className="rounded bg-accent/20 px-1 metric-number text-[10px] text-accent">
              {active.size}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-w-[300px] max-h-[360px] overflow-y-auto">
        <DropdownMenuLabel className="font-mono text-[10.5px] uppercase tracking-wider text-muted-foreground">
          Filter by {label}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {options.map((opt) => (
          <DropdownMenuCheckboxItem
            key={opt}
            checked={active.has(opt)}
            onSelect={(e) => {
              e.preventDefault();
              onToggle(opt);
            }}
            className="cursor-pointer text-xs"
          >
            {optionLabel ? optionLabel(opt) : opt}
          </DropdownMenuCheckboxItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            onClear();
          }}
          disabled={active.size === 0}
          className="text-xs"
        >
          クリア
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
