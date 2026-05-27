"use client";

import * as React from "react";
import { Search } from "lucide-react";
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
import type { CooperativeAgreement } from "@/lib/types";
import { translateStatus } from "@/lib/data/atlas-i18n";
import { countryNameJa } from "@/lib/data/country-geo";
import {
  useStickyToolbarHeight,
  STICKY_TH,
} from "@/components/explorer/use-sticky-toolbar";

type Props = {
  agreements: CooperativeAgreement[];
};

const STATUS_COLOR: Record<string, string> = {
  "Bilteral authorization Completed":
    "text-emerald-600 dark:text-emerald-400 border-emerald-600/40 dark:border-emerald-400/40",
  "Implementing Agreement Signed":
    "text-sky-600 dark:text-sky-400 border-sky-600/40 dark:border-sky-400/40",
  "Framework Agreement Signed":
    "text-amber-600 dark:text-amber-400 border-amber-600/40 dark:border-amber-400/40",
};

export function CooperativeTable({ agreements }: Props) {
  const toolbarRef = useStickyToolbarHeight(true);
  const [query, setQuery] = React.useState("");
  const [buyerFilter, setBuyerFilter] = React.useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = React.useState<Set<string>>(new Set());

  const allBuyers = React.useMemo(
    () => Array.from(new Set(agreements.map((a) => a.buyer))).sort(),
    [agreements]
  );
  const allStatuses = React.useMemo(
    () => Array.from(new Set(agreements.map((a) => a.status))).sort(),
    [agreements]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return agreements
      .filter((a) => {
        if (buyerFilter.size > 0 && !buyerFilter.has(a.buyer)) return false;
        if (statusFilter.size > 0 && !statusFilter.has(a.status)) return false;
        if (q) {
          const hay = [a.buyer, a.seller, a.status, a.notes ?? ""]
            .join(" ")
            .toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          (b.year_of_agreement ?? 0) - (a.year_of_agreement ?? 0) ||
          a.buyer.localeCompare(b.buyer)
      );
  }, [agreements, query, buyerFilter, statusFilter]);

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
      <div
        ref={toolbarRef}
        className="sticky top-0 z-20 bg-background -mx-2 px-2 py-3 border-b border-border flex items-center justify-between gap-3 flex-wrap"
      >
        <div className="relative min-w-[260px] flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buyer / Seller / 備考 で絞り込み..."
            className="h-9 pl-8 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterDropdown
            label="Buyer"
            options={allBuyers}
            translate={countryNameJa}
            active={buyerFilter}
            onToggle={(v) => toggle(setBuyerFilter, v)}
            onClear={() => setBuyerFilter(new Set())}
          />
          <FilterDropdown
            label="ステータス"
            options={allStatuses}
            translate={translateStatus}
            active={statusFilter}
            onToggle={(v) => toggle(setStatusFilter, v)}
            onClear={() => setStatusFilter(new Set())}
          />
          <span className="label-mono text-muted-foreground">
            <span className="metric-number text-foreground">
              {filtered.length.toString().padStart(2, "0")}
            </span>
            /
            <span className="metric-number">
              {agreements.length.toString().padStart(2, "0")}
            </span>
          </span>
        </div>
      </div>

      <Card className="overflow-clip p-0">
        <table className="w-full text-sm border-separate border-spacing-0">
            <thead>
              <tr>
                <th className={`text-left label-mono text-muted-foreground font-normal px-4 py-2.5 min-w-[140px] ${STICKY_TH}`}>Buyer (買い手)</th>
                <th className={`text-left label-mono text-muted-foreground font-normal px-4 py-2.5 min-w-[140px] ${STICKY_TH}`}>Seller (売り手)</th>
                <th className={`text-left label-mono text-muted-foreground font-normal px-4 py-2.5 ${STICKY_TH}`}>締結年</th>
                <th className={`text-left label-mono text-muted-foreground font-normal px-4 py-2.5 min-w-[180px] ${STICKY_TH}`}>ステータス</th>
                <th className={`text-left label-mono text-muted-foreground font-normal px-4 py-2.5 ${STICKY_TH}`}>備考</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center label-mono text-muted-foreground">
                    該当する agreement はありません
                  </td>
                </tr>
              ) : (
                filtered.map((a, idx) => (
                  <tr
                    key={`${a.buyer}-${a.seller}-${idx}`}
                    className="border-t border-border hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-2.5 align-top text-foreground font-medium text-[13px]">
                      {countryNameJa(a.buyer)}
                    </td>
                    <td className="px-4 py-2.5 align-top text-foreground/85 text-[13px]">
                      {countryNameJa(a.seller)}
                    </td>
                    <td className="px-4 py-2.5 align-top metric-number text-[13px] text-foreground">
                      {a.year_of_agreement}
                    </td>
                    <td className="px-4 py-2.5 align-top">
                      <Badge
                        variant="outline"
                        className={`font-mono text-[10px] tracking-wider ${
                          STATUS_COLOR[a.status] ??
                          "text-muted-foreground border-border"
                        }`}
                      >
                        {translateStatus(a.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 align-top text-foreground/75 text-[12.5px] leading-relaxed">
                      {a.notes ?? <span className="text-muted-foreground/60">—</span>}
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
