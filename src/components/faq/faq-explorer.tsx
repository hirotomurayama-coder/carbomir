"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown, Search, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownContent } from "@/components/markdown-content";
import { ReviewMarkedText } from "@/components/review-marks";
import { FAQ_CATEGORY_LABEL, type FAQItem, type FaqCategory } from "@/lib/types";

type Props = {
  items: FAQItem[];
  entityNameMap: Record<string, string>;
};

type Filter = "all" | FaqCategory;

export function FaqExplorer({ items, entityNameMap }: Props) {
  const [query, setQuery] = React.useState("");
  const [filter, setFilter] = React.useState<Filter>("all");
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set());

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((f) => {
      if (filter !== "all" && f.category !== filter) return false;
      if (q) {
        const hay = [
          f.question,
          f.short_answer,
          f.detailed_md,
          ...f.tags,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, query, filter]);

  const toggle = (slug: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });

  // 他ページ (entity 詳細の「In FAQ」逆リンク等) から /faq#<slug> で来たとき、
  // 該当 FAQ を絞り込みに関係なく開いてスクロールする。
  const [pendingScroll, setPendingScroll] = React.useState<string | null>(null);

  const applyHash = React.useCallback(() => {
    const hash = decodeURIComponent(
      (typeof window !== "undefined" ? window.location.hash : "").replace(
        /^#/,
        ""
      )
    );
    if (!hash || !items.some((f) => f.slug === hash)) return;
    setFilter("all");
    setQuery("");
    setExpanded((prev) => new Set(prev).add(hash));
    setPendingScroll(hash);
  }, [items]);

  React.useEffect(() => {
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [applyHash]);

  React.useEffect(() => {
    if (!pendingScroll) return;
    // コールドロードでは展開後にフォント・Markdown が遅れて描画され、一度の
    // scrollIntoView では着地位置がずれる。位置が 2 連続で安定するまで instant
    // スクロールを再試行し (最大 ~1.1s)、安定したら停止する。
    // behavior:"instant" で即時ジャンプ (コンテナの CSS scroll-behavior:smooth を回避。
    // smooth だと長距離スクロールがコールドロードの再描画で中断され着地しない)。
    let timer = 0;
    let tries = 0;
    let lastTop = Number.NaN;
    const step = () => {
      const el = document.getElementById(pendingScroll);
      if (el) {
        el.scrollIntoView({ block: "start", behavior: "instant" });
        const top = Math.round(el.getBoundingClientRect().top);
        if ((top === lastTop && tries > 1) || tries > 12) {
          setPendingScroll(null);
          return;
        }
        lastTop = top;
      }
      tries += 1;
      timer = window.setTimeout(step, 90);
    };
    timer = window.setTimeout(step, 0);
    return () => window.clearTimeout(timer);
  }, [pendingScroll]);

  const availableCats = React.useMemo(() => {
    const set = new Set<FaqCategory>();
    for (const f of items) set.add(f.category);
    return Array.from(set);
  }, [items]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative min-w-[280px] flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="質問・回答・タグで絞り込み..."
            className="h-9 pl-8 text-sm"
          />
        </div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList className="h-8">
            <TabsTrigger value="all" className="text-xs px-3">
              すべて
              <span className="ml-1.5 metric-number text-[10px] text-muted-foreground">
                {items.length}
              </span>
            </TabsTrigger>
            {availableCats.map((c) => {
              const count = items.filter((f) => f.category === c).length;
              return (
                <TabsTrigger key={c} value={c} className="text-xs px-3">
                  {FAQ_CATEGORY_LABEL[c]}
                  <span className="ml-1.5 metric-number text-[10px] text-muted-foreground">
                    {count}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-12">
          <p className="text-center label-mono text-muted-foreground">
            該当する FAQ はありません
          </p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {filtered.map((f) => {
            const isOpen = expanded.has(f.slug);
            return (
              <li key={f.slug} id={f.slug} className="scroll-mt-24">
                <Card className="overflow-hidden p-0">
                  <button
                    type="button"
                    onClick={() => toggle(f.slug)}
                    aria-expanded={isOpen}
                    className="w-full px-5 py-3.5 flex items-start gap-3 text-left hover:bg-muted/30 transition-colors"
                  >
                    <ChevronDown
                      className={`h-4 w-4 mt-0.5 shrink-0 text-muted-foreground transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <Badge
                          variant="outline"
                          className="font-mono text-[10px] tracking-wider"
                        >
                          {FAQ_CATEGORY_LABEL[f.category]}
                        </Badge>
                      </div>
                      <p className="font-semibold text-foreground text-[14.5px] leading-snug mb-1.5">
                        {f.question}
                      </p>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        <ReviewMarkedText>{f.short_answer}</ReviewMarkedText>
                      </p>
                    </div>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pl-12 border-t border-border bg-muted/10">
                      <div className="pt-4 space-y-4">
                        <MarkdownContent>{f.detailed_md}</MarkdownContent>

                        {f.source_urls && f.source_urls.length > 0 && (
                          <div>
                            <p className="label-mono text-muted-foreground mb-2">
                              Sources
                            </p>
                            <ul className="space-y-1">
                              {f.source_urls.map((src, i) => (
                                <li key={i}>
                                  <a
                                    href={src.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 label-mono text-accent hover:underline normal-case"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    {src.label}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {f.related_entity_slugs.length > 0 && (
                          <div>
                            <p className="label-mono text-muted-foreground mb-2">
                              関連エンティティ
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {f.related_entity_slugs.map((s) => (
                                <Link
                                  key={s}
                                  href={`/entities/${s}`}
                                  className="inline-flex items-center rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10.5px] text-foreground/85 hover:border-accent/50 hover:text-accent transition-colors"
                                >
                                  {entityNameMap[s] ?? s}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {f.related_matrix_slugs && f.related_matrix_slugs.length > 0 && (
                          <div>
                            <p className="label-mono text-muted-foreground mb-2">
                              関連 比較行列
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {f.related_matrix_slugs.map((s) => (
                                <Link
                                  key={s}
                                  href={`/matrices/${s}`}
                                  className="inline-flex items-center rounded border border-accent/40 bg-accent/10 px-1.5 py-0.5 text-[10.5px] text-accent hover:bg-accent/20 transition-colors"
                                >
                                  {s}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap label-mono text-muted-foreground px-1">
        <span>
          <span className="metric-number text-foreground">
            {filtered.length.toString().padStart(2, "0")}
          </span>
          <span className="mx-1 opacity-50">/</span>
          <span className="metric-number">
            {items.length.toString().padStart(2, "0")}
          </span>
          <span className="ml-1">FAQs</span>
        </span>
        <span>{expanded.size} 件展開中</span>
      </div>
    </div>
  );
}
