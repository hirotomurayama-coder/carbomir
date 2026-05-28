import Link from "next/link";
import { Globe2, ArrowUpRight } from "lucide-react";
import { SectionHeader } from "./section-header";

/**
 * 「世界マップ」セクション — World Bank + OffsetsDB 由来の網羅マスタへの入口.
 */
export function SurveySection({
  instrumentCount,
  mechanismCount,
  cooperativeCount,
}: {
  instrumentCount: number;
  mechanismCount: number;
  cooperativeCount: number;
}) {
  return (
    <section className="mb-10">
      <SectionHeader
        label="世界マップ"
        description="World Bank + CarbonPlan 由来の網羅マスタ。地理スコープで横断検索"
      />
      <Link
        href="/atlas/instruments"
        className="block rounded-lg border border-accent/30 bg-gradient-to-r from-accent/10 via-accent/5 to-transparent p-5 hover:border-accent/60 transition-colors group"
      >
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/15 text-accent shrink-0">
            <Globe2 className="h-5 w-5" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground group-hover:text-accent">
              グローバル網羅データセット
            </p>
            <p className="metric-number text-[10.5px] text-muted-foreground mt-0.5">
              {instrumentCount} 価格制度 · {mechanismCount} クレジット機構 · {cooperativeCount} 二国間協定 · 11k+ OffsetsDB projects
            </p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-accent transition-colors shrink-0" />
        </div>
      </Link>
    </section>
  );
}
