import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { listPublishedCaseStudies } from "@/lib/data/queries";
import { CASE_STUDY_CATEGORY_LABEL, type CaseStudy } from "@/lib/types";

export const metadata: Metadata = {
  title: "ケーススタディ",
  description:
    "個別企業のクレジット調達・組成事例。Microsoft / 三菱商事 / Apple / 日本郵船 / Stripe Frontier 等の取り組みを編集解説。",
};

export default async function CaseStudiesPage() {
  const studies = await listPublishedCaseStudies();

  // カテゴリ別グループ化
  const byCategory = new Map<string, CaseStudy[]>();
  for (const s of studies) {
    const k = s.category;
    const arr = byCategory.get(k) ?? [];
    arr.push(s);
    byCategory.set(k, arr);
  }

  const order: (keyof typeof CASE_STUDY_CATEGORY_LABEL)[] = [
    "procurement",
    "supply",
    "reporting",
    "compliance",
  ];

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <BookOpen className="h-2.5 w-2.5 mr-1" />
            {studies.length.toString().padStart(2, "0")} Studies
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          ケーススタディ
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          個別企業のクレジット調達・組成・報告活用事例を Carbomir 編集部が解説。
          「他社はどうやっているか」を上司・取締役会への説明素材として使えるよう、規模・コスト・学び・編集部の論点を構造化する。
        </p>
      </header>

      <div className="space-y-8">
        {order.map((cat) => {
          const items = byCategory.get(cat) ?? [];
          if (items.length === 0) return null;
          return (
            <section key={cat} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="label-mono text-foreground">
                  {CASE_STUDY_CATEGORY_LABEL[cat]}
                </h2>
                <span className="metric-number text-[10px] text-muted-foreground">
                  {items.length.toString().padStart(2, "0")}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((s) => (
                  <CaseStudyCard key={s.slug} study={s} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <Link href={`/case-studies/${study.slug}`}>
      <Card className="h-full p-5 hover:border-accent/60 hover:shadow-[0_4px_24px_-8px_rgba(14,165,233,0.18)] transition-all group">
        <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10.5px] text-foreground/80">
              {study.company}
            </span>
            <span className="metric-number text-[10.5px] text-muted-foreground">
              {study.year}
            </span>
          </div>
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-accent transition-colors" />
        </div>
        <h3 className="text-base font-semibold text-foreground group-hover:text-accent mb-1 leading-snug">
          {study.title}
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-3">
          {study.summary}
        </p>
        <div className="grid grid-cols-2 gap-1.5 label-mono text-muted-foreground">
          <span className="truncate">
            <span className="opacity-70">地域: </span>
            <span className="text-foreground/85">{study.region}</span>
          </span>
          {study.credit_type && (
            <span className="truncate">
              <span className="opacity-70">クレジット: </span>
              <span className="text-foreground/85">{study.credit_type}</span>
            </span>
          )}
          {study.scale_note && (
            <span className="col-span-2 truncate">
              <span className="opacity-70">規模: </span>
              <span className="text-foreground/85">{study.scale_note}</span>
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}
