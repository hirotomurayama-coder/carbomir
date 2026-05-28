import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { CONTACT_URL, type ConsultCopy } from "@/lib/consult-cta";

/**
 * 文脈化した相談 CTA (STRATEGY §4-5).
 *
 * 旧来は 3 詳細ページに「個別案件のご相談 / クレイドルトゥーが対応する」という
 * 同一の汎用カードをコピペしていた。コピーを consult-cta.ts に集約し、ページ種別に
 * 応じた「分界線を引く」文言を渡す。
 *
 * variant:
 *   - "card"  : サイドバー用のコンパクトカード (entity / timeline)
 *   - "panel" : 本文下の横長パネル (matrix)
 */

type Props = {
  copy: ConsultCopy;
  variant?: "card" | "panel";
};

export function ConsultCta({ copy, variant = "card" }: Props) {
  if (variant === "panel") {
    return (
      <Card className="bg-gradient-to-br from-card to-muted/40">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="max-w-2xl">
              <Badge
                variant="outline"
                className="font-mono text-[10px] tracking-wider uppercase mb-2 border-accent/40 text-accent"
              >
                Advisory
              </Badge>
              <CardTitle className="text-lg font-bold mb-2">{copy.title}</CardTitle>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {copy.body}
              </p>
            </div>
            <a
              href={CONTACT_URL}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
            >
              相談する
              <span className="font-mono text-xs opacity-70">→</span>
            </a>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-card to-muted/30">
      <CardContent className="p-5">
        <Badge
          variant="outline"
          className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent mb-3"
        >
          Advisory
        </Badge>
        <CardTitle className="text-sm font-semibold mb-2">{copy.title}</CardTitle>
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          {copy.body}
        </p>
        <a
          href={CONTACT_URL}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          相談する
          <span className="font-mono opacity-70">→</span>
        </a>
      </CardContent>
    </Card>
  );
}
