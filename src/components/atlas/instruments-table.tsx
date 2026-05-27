"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import type { CarbonPricingInstrument } from "@/lib/types";
import {
  translateStatus,
  translateInstrumentType,
  translateInstrumentSector,
} from "@/lib/data/atlas-i18n";
import { countryNameJa } from "@/lib/data/country-geo";
import {
  useStickyToolbarHeight,
  STICKY_TH,
} from "@/components/explorer/use-sticky-toolbar";

type Props = {
  instruments: CarbonPricingInstrument[];
  /** Unique ID → Carbomir entity slug の手動マッピング */
  linkageMap: Record<string, string>;
};

const STATUS_BADGE_COLOR: Record<string, string> = {
  Implemented: "text-emerald-600 dark:text-emerald-400 border-emerald-600/40 dark:border-emerald-400/40",
  Scheduled: "text-sky-600 dark:text-sky-400 border-sky-600/40 dark:border-sky-400/40",
  "Under consideration": "text-amber-600 dark:text-amber-400 border-amber-600/40 dark:border-amber-400/40",
  Abolished: "text-muted-foreground border-border",
};

export function InstrumentsTable({ instruments, linkageMap }: Props) {
  const toolbarRef = useStickyToolbarHeight(true);
  const [query, setQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = React.useState<Set<string>>(new Set());

  const allTypes = React.useMemo(
    () => Array.from(new Set(instruments.map((i) => i.type))).sort(),
    [instruments]
  );
  const allStatuses = React.useMemo(
    () => Array.from(new Set(instruments.map((i) => i.status))).sort(),
    [instruments]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return instruments.filter((ins) => {
      if (typeFilter.size > 0 && !typeFilter.has(ins.type)) return false;
      if (statusFilter.size > 0 && !statusFilter.has(ins.status)) return false;
      if (q) {
        const hay = [
          ins.name,
          ins.jurisdiction ?? "",
          ins.unique_id,
          ins.type,
          ins.status,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [instruments, query, typeFilter, statusFilter]);

  const toggleSet = (
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
    value: string
  ) => {
    setter((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {/* Toolbar (sticky, opaque) */}
      <div
        ref={toolbarRef}
        className="sticky top-0 z-20 bg-background -mx-2 px-2 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap"
      >
        <div className="relative min-w-[280px] flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="名前 / 国 / Unique ID で絞り込み..."
            className="h-9 pl-8 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterDropdown
            label="種別"
            options={allTypes}
            translate={translateInstrumentType}
            active={typeFilter}
            onToggle={(v) => toggleSet(setTypeFilter, v)}
            onClear={() => setTypeFilter(new Set())}
          />
          <FilterDropdown
            label="ステータス"
            options={allStatuses}
            translate={translateStatus}
            active={statusFilter}
            onToggle={(v) => toggleSet(setStatusFilter, v)}
            onClear={() => setStatusFilter(new Set())}
          />
          <span className="label-mono text-muted-foreground">
            <span className="metric-number text-foreground">
              {filtered.length.toString().padStart(3, "0")}
            </span>
            /
            <span className="metric-number">
              {instruments.length.toString().padStart(3, "0")}
            </span>
          </span>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-clip p-0">
        <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr>
                <th className={`text-left label-mono text-muted-foreground font-normal px-4 py-2.5 min-w-[280px] ${STICKY_TH}`}>制度名</th>
                <th className={`text-left label-mono text-muted-foreground font-normal px-4 py-2.5 ${STICKY_TH}`}>種別</th>
                <th className={`text-left label-mono text-muted-foreground font-normal px-4 py-2.5 ${STICKY_TH}`}>ステータス</th>
                <th className={`text-left label-mono text-muted-foreground font-normal px-4 py-2.5 ${STICKY_TH}`}>管轄</th>
                <th className={`text-right label-mono text-muted-foreground font-normal px-4 py-2.5 ${STICKY_TH}`}>価格 2026 (USD/t)</th>
                <th className={`text-left label-mono text-muted-foreground font-normal px-4 py-2.5 min-w-[200px] ${STICKY_TH}`}>対象セクター</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center label-mono text-muted-foreground">
                    該当する instrument はありません
                  </td>
                </tr>
              ) : (
                filtered.map((ins) => (
                  <tr key={ins.unique_id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 align-top">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="font-medium text-foreground text-[13.5px]">{ins.name}</p>
                        {linkageMap[ins.unique_id] && (
                          <Link
                            href={`/entities/${linkageMap[ins.unique_id]}`}
                            className="inline-flex items-center gap-0.5 rounded border border-accent/40 bg-accent/10 px-1 py-0 text-[9.5px] text-accent hover:bg-accent/20"
                            aria-label="Carbomir エンティティ詳細"
                          >
                            <ExternalLink className="h-2.5 w-2.5" />
                            Carbomir
                          </Link>
                        )}
                      </div>
                      <p className="font-mono text-[10.5px] text-muted-foreground mt-0.5">{ins.unique_id}</p>
                    </td>
                    <td className="px-4 py-2.5 align-top">
                      <span className="inline-flex items-center rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10.5px] text-foreground/80">
                        {translateInstrumentType(ins.type)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 align-top">
                      <Badge
                        variant="outline"
                        className={`font-mono text-[10px] tracking-wider ${STATUS_BADGE_COLOR[ins.status] ?? "text-muted-foreground border-border"}`}
                      >
                        {translateStatus(ins.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 align-top text-foreground/85 text-[13px]">
                      {ins.jurisdiction ? countryNameJa(ins.jurisdiction) : "—"}
                    </td>
                    <td className="px-4 py-2.5 align-top text-right metric-number text-[13px] text-foreground">
                      {ins.price_2026_usd != null
                        ? Number(ins.price_2026_usd).toFixed(2)
                        : "—"}
                    </td>
                    <td className="px-4 py-2.5 align-top">
                      {ins.sectors_covered.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {ins.sectors_covered.slice(0, 3).map((s) => {
                            const ja = translateInstrumentSector(s);
                            return (
                              <span
                                key={s}
                                className="inline-flex items-center rounded border border-border bg-background px-1.5 py-0.5 text-[10.5px] text-muted-foreground"
                                title={s}
                              >
                                {ja}
                              </span>
                            );
                          })}
                          {ins.sectors_covered.length > 3 && (
                            <span className="label-mono text-muted-foreground">
                              +{ins.sectors_covered.length - 3}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="label-mono text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
        </table>
      </Card>
    </div>
  );
}

function FilterDropdown({
  label,
  options,
  active,
  onToggle,
  onClear,
  translate,
}: {
  label: string;
  options: string[];
  active: Set<string>;
  onToggle: (v: string) => void;
  onClear: () => void;
  translate?: (s: string) => string;
}) {
  const display = (s: string) => (translate ? translate(s) : s);
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
      <DropdownMenuContent align="end" className="max-w-[280px] max-h-[360px] overflow-y-auto">
        <DropdownMenuLabel className="font-mono text-[10.5px] tracking-wider text-muted-foreground">
          {label} で絞り込み
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
            {display(opt)}
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
