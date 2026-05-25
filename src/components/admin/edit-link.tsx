import Link from "next/link";
import { Pencil } from "lucide-react";

type EditLinkProps = {
  type: "entities" | "matrices" | "timeline" | "case-studies" | "faqs";
  slug?: string;
  className?: string;
};

/**
 * 公開詳細ページから内部編集 UI へのリンク.
 * print:hidden で印刷/PDF 出力時は非表示.
 *
 * 認証は未実装 (Phase 4 で middleware).
 */
export function EditLink({ type, slug, className }: EditLinkProps) {
  const href = slug ? `/admin/edit/${type}/${slug}` : `/admin/edit/${type}`;
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10.5px] font-mono tracking-wider text-muted-foreground hover:text-accent hover:bg-accent/10 border border-border hover:border-accent/40 transition-colors no-print ${className ?? ""}`}
      title="内部編集 (Internal · 認証未実装)"
    >
      <Pencil className="h-3 w-3" />
      Edit
    </Link>
  );
}
