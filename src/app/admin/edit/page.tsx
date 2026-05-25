import type { Metadata } from "next";
import Link from "next/link";
import {
  Network,
  Columns3,
  Clock,
  BookOpen,
  HelpCircle,
  ArrowUpRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { AdminBanner } from "@/components/admin/admin-banner";
import {
  listPublishedEntities,
  listPublishedMatrices,
  listPublishedTimelineEvents,
  listPublishedCaseStudies,
  listPublishedFaqs,
} from "@/lib/data/queries";

export const metadata: Metadata = {
  title: "コンテンツ編集",
};

export const dynamic = "force-dynamic";

type Tile = {
  href: string;
  label: string;
  icon: React.ReactNode;
  count: number;
};

export default async function AdminEditIndexPage() {
  const [entities, matrices, timeline, cases, faqs] = await Promise.all([
    listPublishedEntities(),
    listPublishedMatrices(),
    listPublishedTimelineEvents(),
    listPublishedCaseStudies(),
    listPublishedFaqs(),
  ]);

  const tiles: Tile[] = [
    {
      href: "/admin/edit/entities",
      label: "エンティティ",
      icon: <Network className="h-4 w-4" />,
      count: entities.length,
    },
    {
      href: "/admin/edit/faqs",
      label: "FAQ",
      icon: <HelpCircle className="h-4 w-4" />,
      count: faqs.length,
    },
    {
      href: "/admin/edit/timeline",
      label: "時系列イベント",
      icon: <Clock className="h-4 w-4" />,
      count: timeline.length,
    },
    {
      href: "/admin/edit/case-studies",
      label: "ケーススタディ",
      icon: <BookOpen className="h-4 w-4" />,
      count: cases.length,
    },
    {
      href: "/admin/edit/matrices",
      label: "比較行列",
      icon: <Columns3 className="h-4 w-4" />,
      count: matrices.length,
    },
  ];

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1100px] mx-auto">
      <header className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            Content Editor
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          コンテンツ編集
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          エンティティ・比較行列・時系列・ケーススタディ・FAQ の編集 UI。
          <code className="font-mono text-[12px]">data/content/*.json</code> に書き出されます。
        </p>
      </header>

      <AdminBanner />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map((t) => (
          <Link key={t.href} href={t.href}>
            <Card className="h-full p-5 hover:border-accent/60 transition-all group">
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 text-accent">
                  {t.icon}
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-accent transition-colors" />
              </div>
              <p className="label-mono text-muted-foreground mb-1">編集する</p>
              <p className="text-base font-semibold text-foreground group-hover:text-accent mb-1">
                {t.label}
              </p>
              <p className="metric-number text-[11.5px] text-muted-foreground">
                {t.count.toString().padStart(2, "0")} 件 published
              </p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
