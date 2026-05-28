import Link from "next/link";
import { BookOpen, HelpCircle, ArrowUpRight } from "lucide-react";
import type { CaseStudy, FAQItem } from "@/lib/types";
import { SectionHeader } from "./section-header";

/**
 * 「学ぶ」セクション — ケーススタディ + FAQ への入口.
 */
export function ApplySection({
  caseStudies,
  faqs,
}: {
  caseStudies: CaseStudy[];
  faqs: FAQItem[];
}) {
  return (
    <section className="mb-10">
      <SectionHeader
        label="学ぶ"
        description="他社事例と Q&A を引いて、実務判断の土台にする"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/case-studies"
          className="block rounded-lg border border-border bg-card p-5 hover:border-accent/60 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent shrink-0">
              <BookOpen className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="label-mono text-muted-foreground">ケーススタディ</p>
                <span className="metric-number text-[10px] text-muted-foreground">
                  {caseStudies.length.toString().padStart(2, "0")} studies
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground group-hover:text-accent">
                個別企業の調達・組成・報告事例
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Microsoft / 三菱商事 / Apple / NYK / Stripe Frontier
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-accent transition-colors shrink-0" />
          </div>
        </Link>
        <Link
          href="/faq"
          className="block rounded-lg border border-border bg-card p-5 hover:border-accent/60 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/10 text-accent shrink-0">
              <HelpCircle className="h-5 w-5" />
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="label-mono text-muted-foreground">FAQ / 実務 Q&amp;A</p>
                <span className="metric-number text-[10px] text-muted-foreground">
                  {faqs.length.toString().padStart(2, "0")} Q&amp;A
                </span>
              </div>
              <p className="text-sm font-semibold text-foreground group-hover:text-accent">
                実務担当者向けの判断ポイント
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                GX-ETS / Verra / Scope3 / SBT 等の Q&amp;A
              </p>
            </div>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-accent transition-colors shrink-0" />
          </div>
        </Link>
      </div>
    </section>
  );
}
