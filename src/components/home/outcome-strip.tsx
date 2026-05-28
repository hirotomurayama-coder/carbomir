import Link from "next/link";
import { ListChecks, FileText, Radar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * 3 アウトカムの導線 (STRATEGY §3).
 *
 * ツールは「決定」を持たず、その前後を持つ:
 *   ① 判断の手前 (readiness)   ② 稟議の弾薬 (ammunition)   ③ 腐らせない監視 (durability)
 * ホームの主語を「情報」から「成果」へ寄せる §1 の一環として、hero 直下に置く。
 */

const OUTCOMES = [
  {
    Icon: ListChecks,
    tag: "判断の手前",
    title: "論点・比較・適格性が出揃う",
    body: "除去 vs 回避、レジストリ、適格性、他社事例。議論を始められる状態に。",
    href: "/matrices",
    cta: "比較行列へ",
  },
  {
    Icon: FileText,
    tag: "稟議の弾薬",
    title: "出典つきの根拠・業界水準",
    body: "比較表・業界水準・品質リスクを出典・確信度つきで。そのまま引用できる。",
    href: "/entities",
    cta: "用語集へ",
  },
  {
    Icon: Radar,
    tag: "腐らせない監視",
    title: "前提が動けば、先に気づく",
    body: "規制変更・手法改訂・品質判定をウォッチ。見出しになる前にここで知る。",
    href: "/watchlist",
    cta: "ウォッチリストへ",
  },
] as const;

export function OutcomeStrip() {
  return (
    <section className="mb-10 grid gap-3 sm:grid-cols-3">
      {OUTCOMES.map((o) => (
        <Card key={o.tag} className="group hover:border-accent/40 transition-colors">
          <CardContent className="p-5 flex flex-col h-full">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center justify-center rounded-md bg-accent/15 text-accent h-6 w-6 shrink-0">
                <o.Icon className="h-3.5 w-3.5" aria-hidden />
              </span>
              <span className="label-mono text-accent">{o.tag}</span>
            </div>
            <p className="text-sm font-bold text-foreground tracking-tight mb-1.5">
              {o.title}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed flex-1">
              {o.body}
            </p>
            <Link
              href={o.href}
              className="mt-3 inline-flex items-center gap-1 label-mono text-accent group-hover:underline"
            >
              {o.cta}
              <span className="font-mono">→</span>
            </Link>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
