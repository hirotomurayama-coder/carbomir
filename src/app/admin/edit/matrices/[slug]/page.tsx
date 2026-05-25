import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Columns3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminBanner } from "@/components/admin/admin-banner";
import { MatrixEditClient } from "@/components/admin/matrix-edit-client";
import { findBySlug } from "@/lib/data/content-store";
import type { ComparisonMatrix } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Edit · ${slug}` };
}

export default async function AdminEditMatrixPage({ params }: Props) {
  const { slug } = await params;
  const matrix = findBySlug<ComparisonMatrix>("matrices", slug);
  if (!matrix) notFound();

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1100px] mx-auto">
      <nav className="mb-4">
        <Link
          href="/admin/edit/matrices"
          className="inline-flex items-center gap-1.5 label-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="font-mono">←</span> All matrices
        </Link>
      </nav>
      <header className="mb-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <Columns3 className="h-2.5 w-2.5 mr-1" />
            Matrix
          </Badge>
          <span className="font-mono text-[10.5px] text-muted-foreground">{matrix.slug}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          {matrix.title}
        </h1>
      </header>
      <AdminBanner />
      <MatrixEditClient initial={matrix} />
    </div>
  );
}
