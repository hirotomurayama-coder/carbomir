import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { BookOpen, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  findCaseStudyBySlug,
  listPublishedCaseStudies,
  listPublishedEntities,
} from "@/lib/data/queries";
import { findAtlasLinksForEntity } from "@/lib/data/atlas";
import { MarkdownContent } from "@/components/markdown-content";
import { ReviewMarkedText } from "@/components/review-marks";
import { FreshnessIndicator } from "@/components/freshness-indicator";
import { EditLink } from "@/components/admin/edit-link";
import { AtlasDeepDivePanel } from "@/components/atlas/atlas-deep-dive-panel";
import { CASE_STUDY_CATEGORY_LABEL } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const all = await listPublishedCaseStudies();
  return all.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await findCaseStudyBySlug(slug);
  if (!s) return {};
  return {
    title: `${s.company} — ${s.title}`,
    description: s.summary,
  };
}

export default async function CaseStudyDetailPage({ params }: Props) {
  const { slug } = await params;
  const [study, entities] = await Promise.all([
    findCaseStudyBySlug(slug),
    listPublishedEntities(),
  ]);
  if (!study || study.status !== "published") notFound();

  const entityNameMap: Record<string, string> = {};
  for (const e of entities) entityNameMap[e.slug] = e.name_ja;

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <nav className="mb-6">
        <Link
          href="/case-studies"
          className="inline-flex items-center gap-1.5 label-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="font-mono">←</span> All Case Studies
        </Link>
      </nav>

      <header className="mb-8 pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <BookOpen className="h-2.5 w-2.5 mr-1" />
            {CASE_STUDY_CATEGORY_LABEL[study.category]}
          </Badge>
          <Badge variant="secondary" className="font-mono text-[10px] tracking-wider">
            {study.company}
          </Badge>
          <span className="metric-number text-[10.5px] text-muted-foreground">
            {study.year}
          </span>
          <FreshnessIndicator
            lastReviewedAt={study.last_reviewed_at}
            nextReviewAt={study.next_review_at}
          />
          <EditLink type="case-studies" slug={study.slug} className="ml-auto" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
          {study.title}
        </h1>
        <p className="text-base text-foreground/80 max-w-3xl leading-relaxed">
          <ReviewMarkedText>{study.summary}</ReviewMarkedText>
        </p>
        <div className="mt-5 flex items-center gap-4 label-mono text-muted-foreground metric-number flex-wrap">
          <span>地域: <span className="text-foreground/85">{study.region}</span></span>
          {study.credit_type && (
            <>
              <span className="opacity-50">·</span>
              <span>クレジット: <span className="text-foreground/85">{study.credit_type}</span></span>
            </>
          )}
          {study.scale_note && (
            <>
              <span className="opacity-50">·</span>
              <span>規模: <span className="text-foreground/85">{study.scale_note}</span></span>
            </>
          )}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="min-w-0 space-y-8">
          {study.sections.map((s, i) => (
            <section key={i}>
              <div className="flex items-baseline gap-3 mb-3">
                <span className="label-mono text-muted-foreground metric-number">
                  {(i + 1).toString().padStart(2, "0")}
                </span>
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  {s.heading}
                </h2>
              </div>
              <MarkdownContent>{s.body}</MarkdownContent>
            </section>
          ))}

          {study.source_urls.length > 0 && (
            <section>
              <p className="label-mono text-muted-foreground mb-3">Sources</p>
              <ul className="space-y-1.5">
                {study.source_urls.map((src, i) => (
                  <li key={i}>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 label-mono text-accent hover:underline normal-case"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {src.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          {study.related_entity_slugs.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <p className="label-mono text-muted-foreground mb-4">
                  関連エンティティ
                </p>
                <ul className="space-y-2">
                  {study.related_entity_slugs.map((s) => (
                    <li key={s}>
                      <Link
                        href={`/entities/${s}`}
                        className="text-sm text-foreground hover:text-accent block"
                      >
                        {entityNameMap[s] ?? s}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {study.related_entity_slugs.length > 0 && (
            <AtlasDeepDivePanel
              title="Atlas で深掘り"
              entities={study.related_entity_slugs.map((s) => ({
                slug: s,
                name_ja: entityNameMap[s] ?? s,
                links: findAtlasLinksForEntity(s),
              }))}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
