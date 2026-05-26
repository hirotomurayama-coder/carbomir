"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import type {
  OffsetsDbProjectsQuery,
  OffsetsDbFilterOptions,
  OffsetsDbSortKey,
} from "@/lib/data/queries";

type Props = {
  initial: OffsetsDbProjectsQuery;
  filterOptions: OffsetsDbFilterOptions;
  totalCount: number;
  totalProjects: number;
  page: number;
  pageSize: number;
};

const REGISTRY_LABEL: Record<string, string> = {
  verra: "Verra (VCS)",
  "gold-standard": "Gold Standard",
  "climate-action-reserve": "Climate Action Reserve",
  "american-carbon-registry": "American Carbon Registry",
  cercarbono: "CercaCarbono",
  isometric: "Isometric",
  "art-trees": "ART TREES",
};

const SORT_LABEL: Record<OffsetsDbSortKey, string> = {
  issued: "Issued (大→小)",
  retired: "Retired (大→小)",
  name: "Name (A→Z)",
};

export function OffsetsProjectsFilters({
  initial,
  filterOptions,
  totalCount,
  totalProjects,
  page,
  pageSize,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = React.useTransition();

  // 検索 input は debounce 用にローカル state
  const [query, setQuery] = React.useState(initial.query ?? "");

  // 初期値の query が外から変わった場合 (例: URL 直接編集) に追従
  React.useEffect(() => {
    setQuery(initial.query ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial.query]);

  // 共通の param 更新ヘルパー (page は filter 変更時にリセット)
  const updateParam = React.useCallback(
    (
      key: string,
      value: string | string[] | null,
      opts: { resetPage?: boolean } = { resetPage: true }
    ) => {
      const next = new URLSearchParams(sp.toString());
      if (value == null || value === "" || (Array.isArray(value) && value.length === 0)) {
        next.delete(key);
      } else if (Array.isArray(value)) {
        next.delete(key);
        for (const v of value) next.append(key, v);
      } else {
        next.set(key, value);
      }
      if (opts.resetPage !== false) next.delete("page");
      const qs = next.toString();
      startTransition(() => {
        router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      });
    },
    [router, pathname, sp]
  );

  // 検索 input: 300ms debounce で URL に書き出し
  React.useEffect(() => {
    const current = initial.query ?? "";
    if (query === current) return;
    const id = setTimeout(() => {
      updateParam("q", query.trim() || null);
    }, 300);
    return () => clearTimeout(id);
  }, [query, initial.query, updateParam]);

  const toggleFilter = (key: "registry" | "category" | "status", v: string) => {
    const currentArr: string[] =
      key === "registry"
        ? initial.registries ?? []
        : key === "category"
        ? initial.categories ?? []
        : initial.statuses ?? [];
    const next = new Set(currentArr);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    updateParam(key, Array.from(next));
  };

  const clearFilter = (key: "registry" | "category" | "status") => {
    updateParam(key, null);
  };

  const sortKey = initial.sortKey ?? "issued";
  const onlyIssued = !!initial.onlyIssued;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative min-w-[280px] flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="プロジェクト名 / 事業者 / Project ID で絞り込み..."
            className="h-9 pl-8 pr-8 text-sm"
            aria-label="検索"
          />
          {pending && (
            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin" />
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FilterDropdown
            label="Registry"
            options={filterOptions.registries}
            active={new Set(initial.registries ?? [])}
            onToggle={(v) => toggleFilter("registry", v)}
            onClear={() => clearFilter("registry")}
            optionLabel={(o) => REGISTRY_LABEL[o] ?? o}
          />
          <FilterDropdown
            label="Category"
            options={filterOptions.categories}
            active={new Set(initial.categories ?? [])}
            onToggle={(v) => toggleFilter("category", v)}
            onClear={() => clearFilter("category")}
          />
          <FilterDropdown
            label="Status"
            options={filterOptions.statuses}
            active={new Set(initial.statuses ?? [])}
            onToggle={(v) => toggleFilter("status", v)}
            onClear={() => clearFilter("status")}
          />
          <Button
            variant={onlyIssued ? "default" : "outline"}
            size="sm"
            className="h-9 text-xs"
            onClick={() => updateParam("onlyIssued", onlyIssued ? null : "1")}
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
            {totalCount.toLocaleString()}
          </span>
          /
          <span className="metric-number">{totalProjects.toLocaleString()}</span>{" "}
          projects ·
          <span className="ml-2">
            Page {page + 1} / {totalPages}
          </span>
          {pending && (
            <span className="ml-2 text-accent">…更新中</span>
          )}
        </span>
        <div className="flex items-center gap-1.5">
          <span>Sort:</span>
          <select
            className="bg-card border border-border rounded px-1.5 py-0.5 text-foreground"
            value={sortKey}
            onChange={(e) =>
              updateParam(
                "sort",
                e.target.value === "issued" ? null : e.target.value,
                { resetPage: false }
              )
            }
            aria-label="ソート順"
          >
            {(Object.keys(SORT_LABEL) as OffsetsDbSortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORT_LABEL[k]}
              </option>
            ))}
          </select>
        </div>
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
      <DropdownMenuContent
        align="end"
        className="max-w-[300px] max-h-[360px] overflow-y-auto"
      >
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
