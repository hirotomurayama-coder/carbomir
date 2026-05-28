import * as React from "react";
import { Lock } from "lucide-react";
import type { PaywallTier } from "@/lib/types";
import { PAYWALL_TIER_LABEL } from "@/lib/types";

/**
 * 課金階層バッジ (PaywallBadge).
 *
 * Phase Δ で先行投入。データモデル (paywall_tier) と UI ラベルだけ整え、
 * 実際のマスキング・認証フローは Phase 4 で追加する。
 *
 * - tier="free" または未指定: 何も描画しない (null)
 * - tier="standard": 紫系の "Standard 会員限定" バッジ
 * - tier="pro": 琥珀寄りの "Pro 会員限定" バッジ
 *
 * 既存の FreshnessIndicator / ReviewCountBadge と並べたときに視覚的に
 * 干渉しないトーンを選んだ (status warning は琥珀/薔薇、freshness も琥珀系)。
 */

const TIER_CLASS: Record<Exclude<PaywallTier, "free">, string> = {
  standard:
    "border-violet-500/40 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  pro:
    "border-amber-500/50 bg-amber-500/15 text-amber-700 dark:text-amber-300",
};

type PaywallBadgeProps = {
  tier?: PaywallTier;
  /** コンパクト表示: ラベルテキストを省略しアイコンと tier 名のみ */
  compact?: boolean;
  /** 追加クラス */
  className?: string;
};

export function PaywallBadge({
  tier,
  compact = false,
  className,
}: PaywallBadgeProps) {
  if (!tier || tier === "free") return null;

  const label = PAYWALL_TIER_LABEL[tier];
  const shortLabel = tier === "standard" ? "Standard" : "Pro";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] tracking-wider ${TIER_CLASS[tier]} ${className ?? ""}`}
      title={label}
      aria-label={label}
    >
      <Lock className="h-2.5 w-2.5 opacity-80" aria-hidden="true" />
      {compact ? shortLabel : label}
    </span>
  );
}
