import Link from "next/link";
import { ListChecks, FileText, Radar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * 3 アウトカムの導線 (STRATEGY §3).
 *
 * ツールは「決定」を持たず、その前後を持つ:
 *   ① 判断の手前 (readiness)   ② 稟議の弾薬 (ammunition)   ③ 腐らせない監視 (durability)
 * ホームの主語を「情報」から「成果」へ寄せる §1 の一環として、hero 直下に置く。
 *
 * 各アウトカムは単一導線ではなく「目的に効く複数アセットへのチップ導線」を持つ。
 * カード全体リンクをやめ、本文と導線(チップ)を分離することで、
 * 「この成果のためにどのアセットを引くか」を一覧できるようにしている。
 */

type OutcomeLink = { label: string; href: string };

const OUTCOMES: {
  Icon: typeof ListChecks;
  tag: string;
  title: string;
  body: string;
  links: OutcomeLink[];
}[] = [
  {
    Icon: ListChecks,
    tag: "判断の手前",
    title: "論点・比較・適格性が出揃う",
    body: "除去 vs 回避、レジストリ、適格性、他社事例。議論を始められる状態に。",
    links: [
      { label: "比較行列", href: "/matrices" },
      { label: "政策・規制", href: "/policies" },
      { label: "ケーススタディ", href: "/case-studies" },
    ],
  },
  {
    Icon: FileText,
    tag: "稟議の弾薬",
    title: "出典つきの根拠・業界水準",
    body: "比較表・他社事例を出典・確信度つきで。そのまま稟議に引用できる。",
    links: [
      { label: "比較行列", href: "/matrices" },
      { label: "ケーススタディ", href: "/case-studies" },
    ],
  },
  {
    Icon: Radar,
    tag: "腐らせない監視",
    title: "前提が動けば、先に気づく",
    body: "規制変更・手法改訂・品質判定をウォッチ。見出しになる前にここで知る。",
    links: [
      { label: "ウォッチリスト", href: "/watchlist" },
      { label: "時系列", href: "/timeline" },
      { label: "規制カレンダー", href: "/policies/calendar" },
    ],
  },
];

export function OutcomeStrip() {
  return (
    <section className="mb-10">
      {/* レイヤー見出し: ここから上は「成果軸」(目的から入る) */}
      <div className="mb-3 flex items-center gap-3">
        <span className="label-mono text-accent whitespace-nowrap">
          目的から入る
        </span>
        <span className="h-px flex-1 bg-border/60" aria-hidden />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {OUTCOMES.map((o) => (
          <Card key={o.tag} className="h-full">
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
              <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-3">
                {o.body}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {o.links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="group inline-flex items-center gap-1 rounded-md border border-border/60 px-2 py-1 label-mono text-accent transition-colors hover:border-accent/40 hover:bg-accent/10"
                  >
                    {l.label}
                    <span className="font-mono transition-transform group-hover:translate-x-0.5">
                      →
                    </span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
