"use client";

import * as React from "react";
import Link from "next/link";
import { Search, ExternalLink } from "lucide-react";
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
import type { CreditingMechanism } from "@/lib/types";
import {
  translateStatus,
  translateAdmin,
  translateScope,
} from "@/lib/data/atlas-i18n";
import { countryNameJa } from "@/lib/data/country-geo";

type Props = {
  mechanisms: CreditingMechanism[];
};

function formatKt(v?: number): string {
  if (v == null) return "—";
  // kt → Mt 換算で見やすく
  if (v >= 1000) return `${(v / 1000).toFixed(1)}M`;
  return `${Math.round(v)}k`;
}

export function MechanismsTable({ mechanisms }: Props) {
  const [query, setQuery] = React.useState("");
  const [adminFilter, setAdminFilter] = React.useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = React.useState<Set<string>>(new Set());
  const [scopeFilter, setScopeFilter] = React.useState<Set<string>>(new Set());

  const allAdmins = React.useMemo(
    () => Array.from(new Set(mechanisms.map((m) => m.administration ?? "—"))).sort(),
    [mechanisms]
  );
  const allStatuses = React.useMemo(
    () => Array.from(new Set(mechanisms.map((m) => m.status ?? "—"))).sort(),
    [mechanisms]
  );
  const allScopes = React.useMemo(
    () => Array.from(new Set(mechanisms.map((m) => m.scope ?? "—"))).sort(),
    [mechanisms]
  );

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return mechanisms.filter((m) => {
      if (adminFilter.size > 0 && !adminFilter.has(m.administration ?? "—"))
        return false;
      if (statusFilter.size > 0 && !statusFilter.has(m.status ?? "—")) return false;
      if (scopeFilter.size > 0 && !scopeFilter.has(m.scope ?? "—")) return false;
      if (q) {
        const hay = [
          m.mechanism,
          m.administering_jurisdiction ?? "",
          m.credit_name ?? "",
          m.region ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [mechanisms, query, adminFilter, statusFilter, scopeFilter]);

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
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative min-w-[260px] flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="名前 / クレジット名 / 地域 で絞り込み..."
            className="h-9 pl-8 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <FilterDropdown
            label="運営"
            options={allAdmins}
            translate={translateAdmin}
            active={adminFilter}
            onToggle={(v) => toggle(setAdminFilter, v)}
            onClear={() => setAdminFilter(new Set())}
          />
          <FilterDropdown
            label="ステータス"
            options={allStatuses}
            translate={translateStatus}
            active={statusFilter}
            onToggle={(v) => toggle(setStatusFilter, v)}
            onClear={() => setStatusFilter(new Set())}
          />
          <FilterDropdown
            label="範囲"
            options={allScopes}
            translate={translateScope}
            active={scopeFilter}
            onToggle={(v) => toggle(setScopeFilter, v)}
            onClear={() => setScopeFilter(new Set())}
          />
          <span className="label-mono text-muted-foreground">
            <span className="metric-number text-foreground">
              {filtered.length.toString().padStart(2, "0")}
            </span>
            /
            <span className="metric-number">
              {mechanisms.length.toString().padStart(2, "0")}
            </span>
          </span>
        </div>
      </div>

      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5 min-w-[280px]">メカニズム名</th>
                <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5">運営</th>
                <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5">ステータス</th>
                <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5">範囲</th>
                <th className="text-left label-mono text-muted-foreground font-normal px-4 py-2.5">開始年</th>
                <th className="text-right label-mono text-muted-foreground font-normal px-4 py-2.5">累計発行 (Mt)</th>
                <th className="text-right label-mono text-muted-foreground font-normal px-4 py-2.5">案件数</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center label-mono text-muted-foreground">
                    該当する mechanism はありません
                  </td>
                </tr>
              ) : (
                filtered.map((m, idx) => (
                  <tr key={`${m.mechanism}-${idx}`} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-2.5 align-top">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-foreground text-[13.5px]">
                          {m.mechanism}
                        </span>
                        {m.linked_entity_slug && (
                          <Link
                            href={`/entities/${m.linked_entity_slug}`}
                            className="inline-flex items-center gap-0.5 rounded border border-accent/40 bg-accent/10 px-1 py-0 text-[9.5px] text-accent hover:bg-accent/20"
                            aria-label="Carbomir エンティティ詳細"
                          >
                            <ExternalLink className="h-2.5 w-2.5" />
                            Carbomir
                          </Link>
                        )}
                      </div>
                      {m.administering_jurisdiction && (
                        <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">
                          {countryNameJa(m.administering_jurisdiction)}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-2.5 align-top">
                      <span className="inline-flex items-center rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10.5px] text-foreground/80">
                        {translateAdmin(m.administration)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 align-top">
                      <Badge
                        variant="outline"
                        className={`font-mono text-[10px] tracking-wider ${
                          m.status === "Implemented"
                            ? "text-emerald-600 dark:text-emerald-400 border-emerald-600/40 dark:border-emerald-400/40"
                            : "text-muted-foreground border-border"
                        }`}
                      >
                        {translateStatus(m.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5 align-top text-foreground/85 text-[12.5px]">
                      {translateScope(m.scope)}
                    </td>
                    <td className="px-4 py-2.5 align-top metric-number text-[12.5px] text-foreground">
                      {m.year_of_implementation ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 align-top text-right metric-number text-[12.5px] text-foreground">
                      {formatKt(m.cumulative_issued_kt)}
                    </td>
                    <td className="px-4 py-2.5 align-top text-right metric-number text-[12.5px] text-foreground">
                      {m.cumulative_projects?.toLocaleString() ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
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
