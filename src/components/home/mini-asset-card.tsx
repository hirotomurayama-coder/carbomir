import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";

/**
 * 「調べる」セクションで使う小型アセットカード.
 * 数値 + ラベル + tagline のミニメトリックカード。
 */
export function MiniAssetCard({
  href,
  icon,
  label,
  count,
  unit,
  tagline,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  count: number;
  unit: string;
  tagline: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full p-4 hover:border-accent/60 transition-all group">
        <div className="flex items-start justify-between gap-2 mb-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 text-accent">
            {icon}
          </span>
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-accent transition-colors" />
        </div>
        <p className="label-mono text-muted-foreground mb-1">{label}</p>
        <p className="metric-number text-2xl font-bold text-foreground tracking-tight leading-none mb-1">
          {count.toString().padStart(2, "0")}
          <span className="text-xs font-mono text-muted-foreground ml-2">{unit}</span>
        </p>
        <p className="text-[11.5px] text-muted-foreground leading-relaxed">{tagline}</p>
      </Card>
    </Link>
  );
}
