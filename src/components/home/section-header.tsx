import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/**
 * ホーム各セクションの見出し (動詞ラベル + 説明 + 任意 CTA).
 */
export function SectionHeader({
  label,
  description,
  cta,
}: {
  label: string;
  description: string;
  cta?: { href: string; text: string };
}) {
  return (
    <div className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
      <div>
        <h2 className="text-lg font-bold text-foreground tracking-tight">
          {label}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
      {cta && (
        <Link
          href={cta.href}
          className="inline-flex items-center gap-1 label-mono text-accent hover:underline"
        >
          {cta.text}
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}
