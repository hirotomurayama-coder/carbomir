"use client";

import * as React from "react";
import Link from "next/link";
import { MapPin, Calendar, ChevronRight } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { POLICY_STATUS_LABEL, type PolicyStatus } from "@/lib/types";
import { ReviewMarkedText } from "@/components/review-marks";
import type { CalendarEntry, JurisdictionGroup } from "@/lib/policies-calendar";

/**
 * 規制カレンダー Explorer (Client Component).
 * jurisdiction + 時間軸フィルタ + 年グループ表示.
 */

type JurisdictionFilter = "all" | JurisdictionGroup;
type HorizonFilter = "all" | "future" | "next-1y" | "next-90d" | "past";

const STATUS_BADGE_CLASS: Record<PolicyStatus, string> = {
  active:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  transition:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  pilot: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  draft: "border-muted-foreground/40 bg-muted/40 text-muted-foreground",
  discontinued:
    "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300",
  stayed:
    "border-orange-500/40 bg-orange-500/10 text-orange-700 dark:text-orange-300",
};

type Props = { entries: CalendarEntry[] };

export function CalendarExplorer({ entries }: Props) {
  const [jur, setJur] = React.useState<JurisdictionFilter>("all");
  const [horizon, setHorizon] = React.useState<HorizonFilter>("all");

  const filtered = React.useMemo(() => {
    return entries.filter((e) => {
      if (jur !== "all" && e.jurisdiction_group !== jur) return false;
      if (horizon === "future" && e.days_from_today < 0) return false;
      if (horizon === "past" && e.days_from_today >= 0) return false;
      if (horizon === "next-1y" && (e.days_from_today < 0 || e.days_from_today > 365)) return false;
      if (horizon === "next-90d" && (e.days_from_today < 0 || e.days_from_today > 90)) return false;
      return true;
    });
  }, [entries, jur, horizon]);

  // 年でグループ化
  const groupedByYear = React.useMemo(() => {
    const m = new Map<number, CalendarEntry[]>();
    for (const e of filtered) {
      const arr = m.get(e.date_year) ?? [];
      arr.push(e);
      m.set(e.date_year, arr);
    }
    return Array.from(m.entries()).sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  const currentYear = new Date().getFullYear();
  const jurOptions: JurisdictionFilter[] = [
    "all",
    "日本",
    "EU",
    "米国",
    "アジア (日本以外)",
    "国際",
  ];
  const jurLabel: Record<JurisdictionFilter, string> = {
    all: "すべて",
    "日本": "日本",
    EU: "EU",
    "米国": "米国",
    "アジア (日本以外)": "アジア",
    "国際": "国際",
    "その他": "その他",
  };
  const horizonOptions: { value: HorizonFilter; label: string }[] = [
    { value: "all", label: "全期間" },
    { value: "future", label: "未来のみ" },
    { value: "next-1y", label: "直近 1 年" },
    { value: "next-90d", label: "直近 90 日" },
    { value: "past", label: "過去" },
  ];

  return (
    <div>
      {/* Filters */}
      <div className="mb-5 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          <Tabs value={jur} onValueChange={(v) => setJur(v as JurisdictionFilter)}>
            <TabsList className="h-8">
              {jurOptions.map((opt) => (
                <TabsTrigger key={opt} value={opt} className="text-xs px-2.5">
                  {jurLabel[opt]}
                  {opt !== "all" && (
                    <span className="ml-1.5 metric-number text-[10px] text-muted-foreground">
                      {entries.filter((e) => e.jurisdiction_group === opt).length}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
          <Tabs value={horizon} onValueChange={(v) => setHorizon(v as HorizonFilter)}>
            <TabsList className="h-8">
              {horizonOptions.map((opt) => (
                <TabsTrigger key={opt.value} value={opt.value} className="text-xs px-2.5">
                  {opt.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <span className="ml-auto label-mono text-muted-foreground metric-number">
          {filtered.length.toString().padStart(2, "0")} / {entries.length.toString().padStart(2, "0")}
        </span>
      </div>

      {/* Calendar */}
      {filtered.length === 0 ? (
        <Card className="p-12">
          <p className="text-center label-mono text-muted-foreground">
            該当するマイルストーンはありません
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedByYear.map(([year, items]) => {
            const isCurrent = year === currentYear;
            const isPast = year < currentYear;
            return (
              <section key={year}>
                <div className="flex items-baseline gap-3 mb-2">
                  <h2
                    className={`text-lg font-bold tracking-tight metric-number ${
                      isCurrent
                        ? "text-accent"
                        : isPast
                          ? "text-muted-foreground"
                          : "text-foreground"
                    }`}
                  >
                    {year}
                  </h2>
                  {isCurrent && (
                    <span className="label-mono text-accent">today's year</span>
                  )}
                  <span className="ml-auto label-mono text-muted-foreground">
                    {items.length} milestone{items.length > 1 ? "s" : ""}
                  </span>
                </div>
                <Card className="overflow-hidden p-0">
                  <ul className="divide-y divide-border">
                    {items.map((e) => {
                      const isPastEntry = e.days_from_today < 0;
                      return (
                        <li key={`${e.slug}-${e.date_sort_key}`}>
                          <Link
                            href={`/entities/${e.slug}`}
                            className="group block px-5 py-3 hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-start gap-4">
                              {/* Date column */}
                              <div className="shrink-0 min-w-[90px]">
                                <div
                                  className={`metric-number text-[12.5px] font-semibold ${
                                    isPastEntry
                                      ? "text-muted-foreground"
                                      : e.days_from_today <= 90
                                        ? "text-accent"
                                        : "text-foreground"
                                  }`}
                                >
                                  {e.date_label}
                                </div>
                                <div
                                  className={`label-mono ${
                                    isPastEntry
                                      ? "text-muted-foreground/60"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {relativeDays(e.days_from_today)}
                                </div>
                              </div>

                              {/* Content */}
                              <div className={`flex-1 min-w-0 ${isPastEntry ? "opacity-70" : ""}`}>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className="text-[13.5px] font-semibold text-foreground group-hover:text-accent">
                                    {e.name_ja}
                                  </span>
                                  {e.policy_status && (
                                    <span
                                      className={`inline-flex items-center rounded border px-1.5 py-0 text-[10px] font-mono ${STATUS_BADGE_CLASS[e.policy_status]}`}
                                    >
                                      {POLICY_STATUS_LABEL[e.policy_status]}
                                    </span>
                                  )}
                                  <span className="label-mono text-muted-foreground ml-auto">
                                    {e.jurisdiction}
                                  </span>
                                </div>
                                <p className="text-[12.5px] text-foreground/80 leading-relaxed">
                                  <ReviewMarkedText>{e.content}</ReviewMarkedText>
                                </p>
                              </div>
                              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-accent shrink-0 mt-1" />
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function relativeDays(days: number): string {
  if (days === 0) return "今日";
  if (days > 0) {
    if (days < 30) return `${days} 日後`;
    if (days < 365) return `${Math.floor(days / 30)} ヶ月後`;
    return `${Math.floor(days / 365)} 年後`;
  }
  const a = Math.abs(days);
  if (a < 30) return `${a} 日前`;
  if (a < 365) return `${Math.floor(a / 30)} ヶ月前`;
  return `${Math.floor(a / 365)} 年前`;
}
