"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  X,
  Shield,
  Sparkles,
  TrendingUp,
  Award,
  ArrowUpRight,
  Layers,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { ComparisonMatrix } from "@/lib/types";

/**
 * /matrices 抜本デザイン.
 *
 * 設計判断:
 *   - 旧版は「全件をテーブル/カードで並べる」だけで、ユーザーが
 *     "どの行列を見るべきか" を判断する材料が乏しかった.
 *   - 新版は質問駆動 (Scenario) → テーマ別グルーピング → 詳細 の 3 段構成.
 *   - 各カードは entity チップ + key 軸 + 充填率の 3 要素で「中身の予感」を提示.
 *   - 検索はシナリオ/テーマ navigation の後の "微調整" 用に位置付け.
 */

type ScenarioKey =
  | "all"
  | "regulation"
  | "quality"
  | "market"
  | "standard";

type Scenario = {
  key: ScenarioKey;
  label: string;
  description: string;
  icon: React.ReactNode;
  accent: string;
  matrixSlugs: string[];
};

const SCENARIOS: Scenario[] = [
  {
    key: "regulation",
    label: "規制対応 / 開示準備",
    description:
      "TCFD → IFRS S2 / SSBJ 移行戦略、ETS 制度比較、クレジット適格性",
    icon: <Shield className="h-4 w-4" />,
    accent:
      "border-sky-500/40 hover:border-sky-500/70 bg-sky-500/5",
    matrixSlugs: [
      "climate-disclosure-comparison",
      "ets-international-comparison",
      "credit-eligibility",
    ],
  },
  {
    key: "quality",
    label: "クレジット品質を見極める",
    description:
      "NBS / Engineered Removal の品質比較、ICVCM・VCMI 等の品質ガバナンス枠組み",
    icon: <Sparkles className="h-4 w-4" />,
    accent:
      "border-emerald-500/40 hover:border-emerald-500/70 bg-emerald-500/5",
    matrixSlugs: [
      "engineered-removal-comparison",
      "nbs-quality-comparison",
      "vcm-integrity-governance-comparison",
    ],
  },
  {
    key: "market",
    label: "市場・調達戦略",
    description:
      "CDR 需要集約モデル、J-クレジット / JCM / Verra 制度対比、パリ協定 6 条メカニズム",
    icon: <TrendingUp className="h-4 w-4" />,
    accent:
      "border-violet-500/40 hover:border-violet-500/70 bg-violet-500/5",
    matrixSlugs: [
      "cdr-buyer-coalition-comparison",
      "jcredit-jcm-verra",
      "paris-article-6-comparison",
    ],
  },
  {
    key: "standard",
    label: "スタンダード比較",
    description: "Verra / Gold Standard / Plan Vivo 等の民間スタンダード対比",
    icon: <Award className="h-4 w-4" />,
    accent:
      "border-amber-500/40 hover:border-amber-500/70 bg-amber-500/5",
    matrixSlugs: ["vcm-standards"],
  },
];

const CATEGORY_LABEL: Record<string, string> = {
  regulation: "規制",
  scheme: "制度",
  methodology: "メソドロジー",
  standard: "スタンダード",
  eligibility: "適格性",
  market: "市場",
};

type Props = {
  matrices: ComparisonMatrix[];
};

export function MatricesGallery({ matrices }: Props) {
  const [activeScenario, setActiveScenario] = React.useState<ScenarioKey>("all");
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    let result = matrices;
    if (activeScenario !== "all") {
      const sc = SCENARIOS.find((s) => s.key === activeScenario);
      if (sc) {
        const set = new Set(sc.matrixSlugs);
        result = result.filter((m) => set.has(m.slug));
      }
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      result = result.filter((m) => {
        const haystack = [
          m.title,
          m.description,
          ...m.entities.map((e) => e.name_ja),
          ...m.entities.map((e) => e.name_en ?? ""),
          ...m.dimensions.map((d) => d.label_ja),
          ...(m.tags ?? []),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }
    return result;
  }, [matrices, activeScenario, query]);

  // テーマ別グループ化
  const grouped = React.useMemo(() => {
    const groups = new Map<string, ComparisonMatrix[]>();
    for (const m of filtered) {
      const cat = m.category ?? "その他";
      if (!groups.has(cat)) groups.set(cat, []);
      groups.get(cat)!.push(m);
    }
    return groups;
  }, [filtered]);

  return (
    <div className="space-y-8">
      {/* === 1. シナリオ駆動 hero === */}
      <section>
        <div className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
          <h2 className="label-mono text-foreground">
            あなたの判断軸を選ぶ
          </h2>
          <span className="label-mono text-muted-foreground text-[10.5px]">
            シナリオ別に最適な行列を絞り込む
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ScenarioCard
            scenario={{
              key: "all",
              label: "すべて見る",
              description: `全 ${matrices.length} 件の比較行列を一覧`,
              icon: <Layers className="h-4 w-4" />,
              accent: "border-border hover:border-accent/60 bg-card",
              matrixSlugs: [],
            }}
            active={activeScenario === "all"}
            onClick={() => setActiveScenario("all")}
            count={matrices.length}
          />
          {SCENARIOS.map((sc) => (
            <ScenarioCard
              key={sc.key}
              scenario={sc}
              active={activeScenario === sc.key}
              onClick={() => setActiveScenario(sc.key)}
              count={sc.matrixSlugs.length}
            />
          ))}
        </div>
      </section>

      {/* === 2. 検索 (二次的 / 微調整用) === */}
      <div className="flex items-center gap-2 flex-wrap sticky top-0 z-20 bg-background -mx-2 px-2 py-2 border-b border-border">
        <div className="relative min-w-[280px] flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="行列・エンティティ・軸で絞り込み..."
            className="h-8 pl-8 pr-8 text-sm"
            aria-label="検索"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="検索クリア"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 inline-flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-muted/60"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        {activeScenario !== "all" && (
          <button
            type="button"
            onClick={() => setActiveScenario("all")}
            className="inline-flex items-center gap-1.5 label-mono text-[10.5px] text-accent hover:underline"
          >
            <Filter className="h-3 w-3" />
            シナリオフィルタ解除
          </button>
        )}
        <span className="ml-auto label-mono text-muted-foreground text-[10.5px]">
          <span className="metric-number text-foreground">
            {filtered.length.toString().padStart(2, "0")}
          </span>
          <span className="mx-1 opacity-50">/</span>
          <span className="metric-number">
            {matrices.length.toString().padStart(2, "0")}
          </span>
          <span className="ml-1">行列</span>
        </span>
      </div>

      {/* === 3. テーマ別カードギャラリー === */}
      {filtered.length === 0 ? (
        <Card className="p-12">
          <p className="text-center label-mono text-muted-foreground">
            条件に一致する行列がありません
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.entries()).map(([cat, items]) => (
            <section key={cat}>
              <div className="flex items-baseline gap-2 mb-3 px-1">
                <h3 className="label-mono text-foreground">
                  {CATEGORY_LABEL[cat] ?? cat}
                </h3>
                <span className="metric-number text-[10px] text-muted-foreground">
                  {items.length.toString().padStart(2, "0")}
                </span>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {items.map((m) => (
                  <MatrixCard key={m.slug} matrix={m} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
 * Scenario Card (hero entry)
 * ============================================================ */

function ScenarioCard({
  scenario,
  active,
  onClick,
  count,
}: {
  scenario: Scenario;
  active: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-lg border p-3.5 transition-all ${
        active
          ? "border-accent bg-accent/10 shadow-[0_0_0_1px_var(--accent)]"
          : scenario.accent
      }`}
      aria-pressed={active}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div
          className={`rounded-md p-1.5 ${
            active ? "bg-accent/20 text-accent" : "bg-muted/40 text-foreground/80"
          }`}
        >
          {scenario.icon}
        </div>
        <span className="metric-number text-[10px] text-muted-foreground">
          {count.toString().padStart(2, "0")} 行列
        </span>
      </div>
      <p className="text-[13.5px] font-semibold text-foreground leading-snug mb-1">
        {scenario.label}
      </p>
      <p className="text-[11.5px] text-muted-foreground leading-relaxed line-clamp-2">
        {scenario.description}
      </p>
    </button>
  );
}

/* ============================================================
 * Matrix Card (rich preview)
 * ============================================================ */

function MatrixCard({ matrix }: { matrix: ComparisonMatrix }) {
  // 充填率を計算
  const totalCells = matrix.entities.length * matrix.dimensions.length;
  let filledCells = 0;
  for (const e of matrix.entities) {
    for (const d of matrix.dimensions) {
      const cell = matrix.cells[e.slug]?.[d.key];
      if (cell && cell.value && cell.value.trim().length > 0) {
        filledCells++;
      }
    }
  }
  const percent = totalCells === 0 ? 0 : Math.round((filledCells / totalCells) * 100);
  const fillColor =
    percent >= 80
      ? "bg-emerald-500"
      : percent >= 50
        ? "bg-accent"
        : "bg-amber-500";

  // entity 表示数: 最大 5 個
  const visibleEntities = matrix.entities.slice(0, 5);
  const remainingEntities = matrix.entities.length - visibleEntities.length;

  // 軸キーワード: 最大 3 個
  const visibleDims = matrix.dimensions.slice(0, 3);
  const remainingDims = matrix.dimensions.length - visibleDims.length;

  return (
    <Link
      href={`/matrices/${matrix.slug}`}
      className="group block rounded-lg border border-border bg-card p-4 hover:border-accent/60 hover:shadow-[0_6px_24px_-12px_rgba(14,165,233,0.25)] transition-all"
    >
      {/* Header: タイトル + ArrowIcon */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className="text-[14px] font-semibold text-foreground group-hover:text-accent leading-snug">
            {matrix.title}
          </h4>
          {matrix.description && (
            <p className="text-[12px] text-muted-foreground leading-relaxed mt-1 line-clamp-2">
              {matrix.description}
            </p>
          )}
        </div>
        <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-accent transition-colors shrink-0 mt-1" />
      </div>

      {/* Entity heads */}
      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
        <span className="label-mono text-muted-foreground text-[9.5px]">
          ENTITY
        </span>
        {visibleEntities.map((e) => (
          <span
            key={e.slug}
            className="inline-flex items-center rounded border border-border bg-muted/30 px-1.5 py-0.5 text-[10.5px] text-foreground/85"
          >
            {e.name_ja}
          </span>
        ))}
        {remainingEntities > 0 && (
          <span className="label-mono text-muted-foreground text-[10px]">
            +{remainingEntities}
          </span>
        )}
      </div>

      {/* Dimensions */}
      <div className="mt-2 flex items-center gap-1.5 flex-wrap">
        <span className="label-mono text-muted-foreground text-[9.5px]">
          軸
        </span>
        {visibleDims.map((d) => (
          <span
            key={d.key}
            className="inline-flex items-center text-[10.5px] text-foreground/70"
          >
            {d.label_ja}
          </span>
        ))}
        {remainingDims > 0 && (
          <span className="label-mono text-muted-foreground text-[10px]">
            + {remainingDims} 軸
          </span>
        )}
      </div>

      {/* Footer: 充填率 + メトリクス */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="metric-number text-[10.5px] text-foreground">
            {matrix.entities.length} × {matrix.dimensions.length}
          </span>
          <span className="label-mono text-muted-foreground text-[10px]">
            = {totalCells} cells
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-16 h-1 rounded-full bg-muted/40 overflow-hidden"
            aria-hidden
          >
            <div
              className={`h-full transition-all ${fillColor}`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span
            className={`metric-number text-[11px] ${
              percent >= 80
                ? "text-emerald-600 dark:text-emerald-300"
                : percent >= 50
                  ? "text-accent"
                  : "text-amber-600 dark:text-amber-300"
            }`}
          >
            {percent}%
          </span>
        </div>
      </div>
    </Link>
  );
}
