import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Clock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  findTimelineEventBySlug,
  listPublishedEntities,
  listPublishedTimelineEvents,
} from "@/lib/data/queries";
import { TIMELINE_CATEGORY_LABEL } from "@/lib/types";
import { MarkdownContent } from "@/components/markdown-content";
import { EditorialThesis } from "@/components/editorial-thesis";
import { splitEditorialThesis } from "@/lib/editorial-thesis";
import { ConsultCta } from "@/components/consult-cta";
import { consultCopyForTimeline } from "@/lib/consult-cta";
import { findAtlasLinksForEntity } from "@/lib/data/atlas";
import { AtlasDeepDivePanel } from "@/components/atlas/atlas-deep-dive-panel";
import { ReviewMarkedText } from "@/components/review-marks";
import { EditLink } from "@/components/admin/edit-link";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const events = await listPublishedTimelineEvents();
  return events.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await findTimelineEventBySlug(slug);
  if (!event) return {};
  return {
    title: `${event.event_date} ${event.title}`,
    description: event.summary,
  };
}

export default async function TimelineEventDetailPage({ params }: Props) {
  const { slug } = await params;
  const [event, entities] = await Promise.all([
    findTimelineEventBySlug(slug),
    listPublishedEntities(),
  ]);
  if (!event || event.status !== "published") notFound();

  const entityNameMap: Record<string, string> = {};
  for (const e of entities) entityNameMap[e.slug] = e.name_ja;

  // content_md から「編集部の論点」を分離し、専用 call-out で描き分ける (STRATEGY §2)
  const { before, thesis, after } = splitEditorialThesis(event.content_md);

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <nav className="mb-6">
        <Link
          href="/timeline"
          className="inline-flex items-center gap-1.5 label-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="font-mono">←</span> All Events
        </Link>
      </nav>

      <header className="mb-8 pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <Clock className="h-2.5 w-2.5 mr-1" />
            {TIMELINE_CATEGORY_LABEL[event.category]}
          </Badge>
          <Badge variant="secondary" className="font-mono text-[10px] tracking-wider">
            Importance {event.importance}/5
          </Badge>
          <EditLink type="timeline" slug={event.slug} className="ml-auto" />
        </div>
        <p className="metric-number text-sm text-accent mb-1.5">
          {event.event_date}
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          {event.title}
        </h1>
        <p className="text-base text-foreground/80 max-w-3xl leading-relaxed">
          <ReviewMarkedText>{event.summary}</ReviewMarkedText>
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        {/* Center: Body */}
        <article className="min-w-0 space-y-8">
          {before && (
            <section>
              <MarkdownContent>{before}</MarkdownContent>
            </section>
          )}
          {thesis && <EditorialThesis>{thesis}</EditorialThesis>}
          {after && (
            <section>
              <MarkdownContent>{after}</MarkdownContent>
            </section>
          )}

          {event.source_urls.length > 0 && (
            <section>
              <p className="label-mono text-muted-foreground mb-3">Sources</p>
              <ul className="space-y-1.5">
                {event.source_urls.map((src, si) => (
                  <li key={si}>
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

        {/* Right: Affected entities */}
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          {event.affected_entity_slugs.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <p className="label-mono text-muted-foreground mb-4">
                  Affected Entities
                </p>
                <ul className="space-y-3">
                  {event.affected_entity_slugs.map((s) => (
                    <li key={s}>
                      <Link
                        href={`/entities/${s}`}
                        className="group block text-sm font-medium text-foreground hover:text-accent"
                      >
                        {entityNameMap[s] ?? s}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Atlas で深掘り (affected entities が Atlas にどう載っているか) */}
          {event.affected_entity_slugs.length > 0 && (
            <AtlasDeepDivePanel
              title="関連する Atlas データ"
              entities={event.affected_entity_slugs.map((s) => ({
                slug: s,
                name_ja: entityNameMap[s] ?? s,
                links: findAtlasLinksForEntity(s),
              }))}
            />
          )}

          <ConsultCta copy={consultCopyForTimeline()} />
        </aside>
      </div>
    </div>
  );
}
