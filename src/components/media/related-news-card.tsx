import { Newspaper, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { MediaArticle } from "@/lib/media-match";

/**
 * carboncredits.jp の関連ニュース (column/global 記事) カード。
 * entity / case-study 詳細の aside で使う。記事は媒体が正準なので外部リンク。
 * 照合は src/lib/media-match.ts (タイトル部分一致, modified 降順)。
 */
export function RelatedNewsCard({ articles }: { articles: MediaArticle[] }) {
  if (articles.length === 0) return null;
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <Newspaper className="h-3.5 w-3.5 text-accent" />
          <h2 className="label-mono text-foreground">関連ニュース</h2>
          <span className="label-mono text-muted-foreground/70 ml-auto">carboncredits.jp</span>
        </div>
        <ul className="space-y-2.5">
          {articles.map((a) => (
            <li key={a.id}>
              <a
                href={a.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-0.5"
              >
                <span className="text-[12.5px] leading-snug text-foreground group-hover:text-accent transition-colors">
                  {a.title}
                  <ExternalLink className="inline-block h-2.5 w-2.5 ml-1 align-baseline text-muted-foreground/60" />
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="metric-number text-[10.5px] text-muted-foreground/70">
                    {a.modified.slice(0, 10)}
                  </span>
                  {a.section && (
                    <span className="label-mono text-[9px] uppercase tracking-wider text-muted-foreground/60 border border-border rounded px-1 py-px">
                      {a.section}
                    </span>
                  )}
                </span>
              </a>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
