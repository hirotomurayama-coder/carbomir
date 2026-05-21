import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Network } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import {
  findEntityBySlug,
  findEntityRef,
  listPublishedEntities,
} from "@/lib/data/entities";
import { findMatrixBySlug } from "@/lib/data/comparisons";
import { ENTITY_TYPE_LABEL, RELATION_LABEL } from "@/lib/types";
import { EntityToc } from "@/components/entities/entity-toc";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return listPublishedEntities().map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entity = findEntityBySlug(slug);
  if (!entity) return {};
  return {
    title: entity.name_ja,
    description: entity.summary,
  };
}

export default async function EntityDetailPage({ params }: Props) {
  const { slug } = await params;
  const entity = findEntityBySlug(slug);
  if (!entity || entity.status !== "published") notFound();

  const relatedEntities = entity.related
    .map((r) => {
      const ref = findEntityRef(r.to_slug);
      if (!ref) return null;
      return { ...r, name_ja: ref.name_ja, name_en: ref.name_en };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const relatedMatrices = entity.related_matrix_slugs
    .map((s) => findMatrixBySlug(s))
    .filter(
      (m): m is NonNullable<typeof m> => m !== undefined && m.status === "published"
    );

  const tocItems = entity.sections.map((s, i) => ({
    id: `section-${i}`,
    label: s.heading,
  }));

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
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider text-emerald-600 dark:text-emerald-400 border-emerald-600/40 dark:border-emerald-400/40"
          >
            Published
          </Badge>
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
          {entity.summary}
        </p>
        <div className="mt-5 flex items-center gap-4 label-mono text-muted-foreground metric-number flex-wrap">
          <span>Reviewed {entity.last_reviewed_at}</span>
          {entity.tags.length > 0 && (
            <>
              <span className="opacity-50">·</span>
              <div className="flex gap-1.5 flex-wrap">
                {entity.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10.5px] tracking-normal text-foreground/80 normal-case"
                  >
                    {t}
                  </span>
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
          {entity.sections.map((s, i) => (
            <section
              key={i}
              id={`section-${i}`}
              className="scroll-mt-20"
            >
              <div className="flex items-baseline gap-3 mb-3">
                <span className="label-mono text-muted-foreground metric-number">
                  {(i + 1).toString().padStart(2, "0")}
                </span>
                <h2 className="text-xl font-bold text-foreground tracking-tight">
                  {s.heading}
                </h2>
              </div>
              <div className="text-[15px] leading-[1.85] text-foreground/90 max-w-prose">
                {s.body.split("\n\n").map((para, pi) => (
                  <p key={pi} className="mb-4 last:mb-0">
                    {para}
                  </p>
                ))}
              </div>
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
          ))}
        </article>

        {/* Right: Related */}
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
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

          <Card className="bg-gradient-to-br from-card to-muted/30">
            <CardContent className="p-5">
              <Badge
                variant="outline"
                className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent mb-3"
              >
                Advisory
              </Badge>
              <CardTitle className="text-sm font-semibold mb-2">
                個別案件のご相談
              </CardTitle>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                株式会社クレイドルトゥーが対応する。
              </p>
              <a
                href="https://carboncredits.jp/contact"
                className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                相談する
                <span className="font-mono opacity-70">→</span>
              </a>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
