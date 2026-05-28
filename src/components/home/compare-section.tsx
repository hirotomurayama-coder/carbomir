import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ComparisonMatrix } from "@/lib/types";
import { MatrixThumbnail } from "@/components/matrices/matrix-thumbnail";
import { SectionHeader } from "./section-header";

/**
 * 「比べる」セクション — Featured 比較行列 1 件をサムネ表示 + 全件への CTA.
 */

/** 最も大きい (entity × dimension 数) 比較行列を 1 件選ぶ. 空配列なら undefined. */
export function pickFeaturedMatrix(
  matrices: ComparisonMatrix[]
): ComparisonMatrix | undefined {
  if (matrices.length === 0) return undefined;
  return [...matrices].sort(
    (a, b) =>
      b.entities.length * b.dimensions.length -
      a.entities.length * a.dimensions.length
  )[0];
}

export function CompareSection({
  featured,
  totalMatrices,
}: {
  featured: ComparisonMatrix | undefined;
  totalMatrices: number;
}) {
  if (!featured) return null;
  return (
    <section className="mb-10">
      <SectionHeader
        label="比べる"
        description={`制度・スタンダード・技術を実務軸で対比。比較行列 ${totalMatrices} 件`}
        cta={{ href: "/matrices", text: "比較行列を全件見る" }}
      />
      <Card className="overflow-hidden p-0 group hover:border-accent/60 transition-colors">
        <Link href={`/matrices/${featured.slug}`} className="block">
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge
                variant="outline"
                className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
              >
                Featured
              </Badge>
              <span className="metric-number text-[10px] text-muted-foreground ml-auto">
                {featured.last_reviewed_at}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-foreground group-hover:text-accent mb-1 leading-snug">
              {featured.title}
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
              {featured.description}
            </p>
          </div>
          <div className="px-5">
            <MatrixThumbnail matrix={featured} />
          </div>
          <div className="px-5 py-3 mt-3 border-t border-border flex items-center justify-between gap-2 label-mono text-muted-foreground">
            <span>
              <span className="metric-number text-foreground">{featured.entities.length}</span>
              <span className="opacity-50 mx-1">×</span>
              <span className="metric-number text-foreground">{featured.dimensions.length}</span>
            </span>
            <span className="inline-flex items-center gap-1 text-accent">
              詳細を開く
              <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </Link>
      </Card>
    </section>
  );
}
