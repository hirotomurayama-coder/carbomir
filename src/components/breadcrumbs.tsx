"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const SEGMENT_LABELS: Record<string, string> = {
  matrices: "比較行列",
  entities: "概念体系",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-foreground font-medium">ホーム</span>
      </div>
    );
  }

  const crumbs: { label: string; href: string }[] = [{ label: "ホーム", href: "/" }];
  let acc = "";
  for (const seg of segments) {
    acc += `/${seg}`;
    crumbs.push({ label: SEGMENT_LABELS[seg] ?? decodeURIComponent(seg), href: acc });
  }

  return (
    <nav className="flex items-center gap-1 text-sm min-w-0" aria-label="パンくず">
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={c.href} className="flex items-center gap-1 min-w-0">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
            {isLast ? (
              <span className="text-foreground font-medium truncate">{c.label}</span>
            ) : (
              <Link
                href={c.href}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {c.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
