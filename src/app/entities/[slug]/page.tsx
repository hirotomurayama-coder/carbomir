import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  findEntityBySlug,
  findEntityRef,
  findMatrixBySlug,
  getOffsetsDbAggregates,
  listEntityInboundReferences,
  listInboundRelations,
  listPublishedEntities,
} from "@/lib/data/queries";
import { findOffsetsRegistryForEntity } from "@/lib/data/atlas";
import { OffsetsDbInlineCard } from "@/components/atlas/offsets-db-inline-card";
import {
  ENTITY_TYPE_LABEL,
  FAQ_CATEGORY_LABEL,
  RELATION_LABEL,
  RELATION_LABEL_REVERSE,
} from "@/lib/types";
import { EntityToc } from "@/components/entities/entity-toc";
import { MetadataPanel } from "@/components/entities/metadata-panel";
import { DurabilityPanel } from "@/components/entities/durability-panel";
import { PriceLevelPanel } from "@/components/entities/price-level-panel";
import { MarkdownContent } from "@/components/markdown-content";
import { EditorialThesis } from "@/components/editorial-thesis";
import { ReviewMarkedText } from "@/components/review-marks";
import { FreshnessIndicator } from "@/components/freshness-indicator";
import { PaywallBadge } from "@/components/paywall-badge";
import { ConsultCta } from "@/components/consult-cta";
import { consultCopyForEntity } from "@/lib/consult-cta";
import { WatchButton } from "@/components/watchlist/watch-button";
import { EditLink } from "@/components/admin/edit-link";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const entities = await listPublishedEntities();
  return entities.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entity = await findEntityBySlug(slug);
  if (!entity) return {};
  return {
    title: entity.name_ja,
    description: entity.summary,
  };
}

export default async function EntityDetailPage({ params }: Props) {
  const { slug } = await params;
  const entity = await findEntityBySlug(slug);
  if (!entity || entity.status !== "published") notFound();

  const relatedEntities = (
    await Promise.all(
      entity.related.map(async (r) => {
        const ref = await findEntityRef(r.to_slug);
        if (!ref) return null;
        return { ...r, name_ja: ref.name_ja, name_en: ref.name_en };
      })
    )
  ).filter((x): x is NonNullable<typeof x> => x !== null);

  const relatedMatrices = (
    await Promise.all(entity.related_matrix_slugs.map((s) => findMatrixBySlug(s)))
  ).filter(
    (m): m is NonNullable<typeof m> =>
      m !== undefined && m.status === "published"
  );

  // Referenced By (inbound) — entity.related の forward 側で既出のものは dedup する
  const forwardSlugs = new Set(entity.related.map((r) => r.to_slug));
  const inboundAll = await listInboundRelations(slug);
  const inboundRelations = inboundAll.filter((r) => !forwardSlugs.has(r.from_slug));

  // Cross-type 被参照 (timeline / case-study / faq → この entity)。
  // forward フィールドを逆引きするだけで自動導出する (entity↔entity の Referenced By と同型)。
  const inboundRefs = await listEntityInboundReferences(slug);

  // OffsetsDB 該当 registry の集計を取得
  const offsetsRegistry = findOffsetsRegistryForEntity(slug);
  const offsetsStat = offsetsRegistry
    ? (await getOffsetsDbAggregates()).by_registry.find(
        (r) => r.registry === offsetsRegistry
      )
    : undefined;

  const tocItems = entity.sections.map((s, i) => ({
    id: `section-${i}`,
    label: s.heading,
  }));

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <nav className="mb-6">
        <Link
          href="/entities"
          className="inline-flex items-center gap-1.5 label-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="font-mono">←</span> All Concepts
        </Link>
      </nav>

      <header className="mb-8 pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <Network className="h-2.5 w-2.5 mr-1" />
            {ENTITY_TYPE_LABEL[entity.type]}
          </Badge>
          {entity.abbreviation && (
            <Badge variant="secondary" className="font-mono text-[10px] tracking-wider">
              {entity.abbreviation}
            </Badge>
          )}
          <FreshnessIndicator
            lastReviewedAt={entity.last_reviewed_at}
            nextReviewAt={entity.next_review_at}
          />
          <WatchButton
            item={{ kind: "entity", slug: entity.slug, label: entity.name_ja }}
            className="ml-auto"
          />
          <EditLink type="entities" slug={entity.slug} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          {entity.name_ja}
        </h1>
        {entity.name_en && (
          <p className="font-mono text-sm text-muted-foreground mb-4">
            {entity.name_en}
          </p>
        )}
        <p className="text-base text-foreground/80 max-w-3xl leading-relaxed">
          <ReviewMarkedText>{entity.summary}</ReviewMarkedText>
        </p>
        <div className="mt-5 flex items-center gap-4 label-mono text-muted-foreground metric-number flex-wrap">
          {entity.tags.length > 0 && (
            <>
              <div className="flex gap-1.5 flex-wrap">
                {entity.tags.map((t) => (
                  <Link
                    key={t}
                    href={`/entities?tag=${encodeURIComponent(t)}`}
                    className="inline-flex items-center rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10.5px] tracking-normal text-foreground/80 normal-case hover:border-accent/50 hover:bg-accent/10 hover:text-accent transition-colors"
                    aria-label={`tag ${t} で絞り込む`}
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[180px_minmax(0,1fr)_280px]">
        {/* Left: TOC */}
        <EntityToc items={tocItems} />

        {/* Center: Body */}
        <article className="min-w-0 space-y-10">
          {entity.sections.map((s, i) =>
            s.heading === "編集部の論点" ? (
              <EditorialThesis
                key={i}
                id={`section-${i}`}
                paywallTier={s.paywall_tier}
                sourceUrls={s.source_urls}
              >
                {s.body}
              </EditorialThesis>
            ) : (
              <section key={i} id={`section-${i}`} className="scroll-mt-20">
                <div className="flex items-baseline gap-3 mb-3 flex-wrap">
                  <span className="label-mono text-muted-foreground metric-number">
                    {(i + 1).toString().padStart(2, "0")}
                  </span>
                  <h2 className="text-xl font-bold text-foreground tracking-tight">
                    {s.heading}
                  </h2>
                  <PaywallBadge tier={s.paywall_tier} />
                </div>
                <MarkdownContent>{s.body}</MarkdownContent>
                {s.source_urls && s.source_urls.length > 0 && (
                  <ul className="mt-4 space-y-1.5">
                    {s.source_urls.map((src, si) => (
                      <li key={si}>
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 label-mono text-accent hover:underline"
                        >
                          <span className="font-mono">↗</span>
                          {src.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )
          )}
        </article>

        {/* Right: Related */}
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
          <MetadataPanel entity={entity} />
          {entity.price_level && (
            <PriceLevelPanel price={entity.price_level} today={today} />
          )}
          <DurabilityPanel
            entityType={entity.type}
            policyStatus={entity.policy_status}
            nextMilestone={entity.next_milestone}
            nextReviewAt={entity.next_review_at}
            timeline={inboundRefs.timeline}
            today={today}
          />
          {offsetsRegistry && offsetsStat && (
            <OffsetsDbInlineCard
              registry={offsetsRegistry}
              stat={offsetsStat}
            />
          )}
          {relatedEntities.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <p className="label-mono text-muted-foreground mb-4">
                  Related Concepts
                </p>
                <ul className="space-y-3">
                  {relatedEntities.map((r) => (
                    <li key={r.to_slug}>
                      <Link href={`/entities/${r.to_slug}`} className="group block">
                        <span className="label-mono text-accent block mb-0.5">
                          {RELATION_LABEL[r.relation].toUpperCase()}
                        </span>
                        <p className="text-sm font-medium text-foreground group-hover:text-accent">
                          {r.name_ja}
                        </p>
                        {r.note && (
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {r.note}
                          </p>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {inboundRelations.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <p className="label-mono text-muted-foreground mb-4">
                  Referenced By
                </p>
                <ul className="space-y-3">
                  {inboundRelations.map((r) => (
                    <li key={`${r.from_slug}-${r.relation}`}>
                      <Link href={`/entities/${r.from_slug}`} className="group block">
                        <span className="label-mono text-accent block mb-0.5">
                          {RELATION_LABEL_REVERSE[r.relation].toUpperCase()}
                        </span>
                        <p className="text-sm font-medium text-foreground group-hover:text-accent">
                          {r.from_name_ja}
                        </p>
                        {r.note && (
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {r.note}
                          </p>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {relatedMatrices.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <p className="label-mono text-muted-foreground mb-4">
                  In Comparison Matrices
                </p>
                <ul className="space-y-3">
                  {relatedMatrices.map((m) => (
                    <li key={m.slug}>
                      <Link href={`/matrices/${m.slug}`} className="group block">
                        <p className="text-sm font-medium text-foreground group-hover:text-accent">
                          {m.title}
                        </p>
                        <p className="label-mono text-muted-foreground metric-number mt-1">
                          {m.entities.length}×{m.dimensions.length}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {inboundRefs.caseStudies.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <p className="label-mono text-muted-foreground mb-4">
                  In Case Studies
                </p>
                <ul className="space-y-3">
                  {inboundRefs.caseStudies.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/case-studies/${c.slug}`}
                        className="group block"
                      >
                        <span className="label-mono text-accent block mb-0.5">
                          {c.company}
                        </span>
                        <p className="text-sm font-medium text-foreground group-hover:text-accent leading-snug">
                          {c.title}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {inboundRefs.faqs.length > 0 && (
            <Card>
              <CardContent className="p-5">
                <p className="label-mono text-muted-foreground mb-4">In FAQ</p>
                <ul className="space-y-3">
                  {inboundRefs.faqs.map((f) => (
                    <li key={f.slug}>
                      <Link href={`/faq#${f.slug}`} className="group block">
                        <span className="label-mono text-accent block mb-0.5">
                          {FAQ_CATEGORY_LABEL[f.category]}
                        </span>
                        <p className="text-sm font-medium text-foreground group-hover:text-accent leading-snug">
                          {f.question}
                        </p>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <ConsultCta copy={consultCopyForEntity(entity.type, entity.name_ja)} />
        </aside>
      </div>
    </div>
  );
}
