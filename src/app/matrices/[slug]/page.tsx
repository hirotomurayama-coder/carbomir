import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Columns3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  findMatrixBySlug,
  listPublishedEntitySlugs,
  listPublishedMatrices,
} from "@/lib/data/queries";
import { findAtlasLinksForEntity } from "@/lib/data/atlas";
import { MatrixDataGrid } from "@/components/matrices/matrix-data-grid";
import { AtlasDeepDivePanel } from "@/components/atlas/atlas-deep-dive-panel";
import { FreshnessIndicator } from "@/components/freshness-indicator";
import { ConsultCta } from "@/components/consult-cta";
import { consultCopyForMatrix } from "@/lib/consult-cta";
import { EditLink } from "@/components/admin/edit-link";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const matrices = await listPublishedMatrices();
  return matrices.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const matrix = await findMatrixBySlug(slug);
  if (!matrix) return {};
  return {
    title: matrix.title,
    description: matrix.description,
  };
}

export default async function MatrixDetailPage({ params }: Props) {
  const { slug } = await params;
  const [matrix, publishedEntitySlugs] = await Promise.all([
    findMatrixBySlug(slug),
    listPublishedEntitySlugs(),
  ]);
  if (!matrix || matrix.status !== "published") notFound();

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <nav className="mb-6">
        <Link
          href="/matrices"
          className="inline-flex items-center gap-1.5 label-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="font-mono">←</span> All Matrices
        </Link>
      </nav>

      <header className="mb-6 pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge variant="outline" className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent">
            <Columns3 className="h-2.5 w-2.5 mr-1" />
            Comparison Matrix
          </Badge>
          <Badge variant="secondary" className="font-mono text-[10px] tracking-wider">
            {matrix.entities.length}×{matrix.dimensions.length}
          </Badge>
          <FreshnessIndicator
            lastReviewedAt={matrix.last_reviewed_at}
            nextReviewAt={matrix.next_review_at}
          />
          <EditLink type="matrices" slug={matrix.slug} className="ml-auto" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
          {matrix.title}
        </h1>
        <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed">
          {matrix.description}
        </p>
      </header>

      <MatrixDataGrid
        matrix={matrix}
        publishedEntitySlugs={publishedEntitySlugs}
      />

      {/* Atlas で深掘り — matrix の各 entity を Atlas に辿る */}
      <div className="mt-8">
        <AtlasDeepDivePanel
          entities={matrix.entities.map((e) => ({
            slug: e.slug,
            name_ja: e.name_ja,
            links: findAtlasLinksForEntity(e.slug),
          }))}
        />
      </div>

      {/* CTA — 文脈化した相談ハンドオフ (STRATEGY §4-5) */}
      <div className="mt-8">
        <ConsultCta copy={consultCopyForMatrix()} variant="panel" />
      </div>
    </div>
  );
}
