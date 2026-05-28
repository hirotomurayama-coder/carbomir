import { Coins, TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PRICE_TREND_LABEL, type PriceLevel, type PriceTrend } from "@/lib/types";

/**
 * 価格水準 (相場観) パネル (STRATEGY §8).
 *
 * live feed ではなく、出典・時点つきのレンジ・方向感を editorial 属性として出す。
 * 「正確な実勢・執行価格ではない」ことを明示し、執行価格が要る瞬間は相談 (CradleTo)
 * へハンドオフする (price precision は意識的に取りに行かない)。
 */

const TREND_META: Record<
  PriceTrend,
  { Icon: React.ComponentType<{ className?: string }>; cls: string }
> = {
  rising: {
    Icon: TrendingUp,
    cls: "border-red-500/35 bg-red-500/10 text-red-700 dark:text-red-300",
  },
  falling: {
    Icon: TrendingDown,
    cls: "border-emerald-500/35 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  stable: {
    Icon: Minus,
    cls: "border-muted-foreground/30 bg-muted/50 text-muted-foreground",
  },
  volatile: {
    Icon: Activity,
    cls: "border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
};

export function PriceLevelPanel({ price }: { price: PriceLevel }) {
  const trend = price.trend ? TREND_META[price.trend] : null;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Coins className="h-3.5 w-3.5 text-accent" aria-hidden />
          <p className="label-mono text-muted-foreground">価格水準 (相場観)</p>
        </div>

        <div className="flex items-baseline gap-2 flex-wrap mb-1">
          <span className="metric-number text-2xl font-bold text-foreground">
            {price.range}
          </span>
          <span className="label-mono text-muted-foreground">{price.unit}</span>
          {trend && (
            <span
              className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10.5px] font-mono tracking-wider ${trend.cls}`}
            >
              <trend.Icon className="h-3 w-3" aria-hidden />
              {PRICE_TREND_LABEL[price.trend!]}
            </span>
          )}
        </div>

        {price.note && (
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            {price.note}
          </p>
        )}

        <div className="mt-3 pt-3 border-t border-border/60 space-y-1.5">
          <p className="label-mono text-muted-foreground metric-number">
            時点 {price.as_of}
          </p>
          {price.source_url ? (
            <a
              href={price.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 label-mono text-accent hover:underline normal-case"
            >
              <span className="font-mono">↗</span>
              {price.source_label}
            </a>
          ) : (
            <p className="label-mono text-muted-foreground normal-case">
              出典: {price.source_label}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground/80 leading-relaxed pt-1">
            実勢・執行価格ではない相場観。正確な価格・調達ルートは要相談。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
