import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, ArrowUpRight, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { listDrafts } from "@/lib/data/ai-drafts";
import {
  AI_DRAFT_STATUS_LABEL,
  AI_DRAFT_TYPE_LABEL,
  type AiDraft,
  type AiDraftStatus,
} from "@/lib/types";

export const metadata: Metadata = {
  title: "AI ドラフトレビュー",
  description: "AI 生成ドラフトの一覧と承認/却下フロー (社内用)",
};

// admin 系は静的キャッシュさせない (Server Actions で書き換わる)
export const dynamic = "force-dynamic";

const STATUS_ORDER: AiDraftStatus[] = [
  "pending",
  "approved",
  "rejected",
  "applied",
];

const STATUS_BADGE_CLASS: Record<AiDraftStatus, string> = {
  pending:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  approved:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rejected:
    "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  applied: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

export default async function AdminDraftsPage() {
  const drafts = await listDrafts();

  const counts: Record<AiDraftStatus, number> = {
    pending: 0,
    approved: 0,
    rejected: 0,
    applied: 0,
  };
  for (const d of drafts) counts[d.status] = (counts[d.status] ?? 0) + 1;

  // ステータスごとにグルーピング
  const grouped = new Map<AiDraftStatus, AiDraft[]>();
  for (const d of drafts) {
    const arr = grouped.get(d.status) ?? [];
    arr.push(d);
    grouped.set(d.status, arr);
  }

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1400px] mx-auto">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            <Sparkles className="h-2.5 w-2.5 mr-1" />
            AI Drafts Review
          </Badge>
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-amber-500/40 text-amber-700 dark:text-amber-300"
          >
            <ShieldAlert className="h-2.5 w-2.5 mr-1" />
            Internal · 認証未実装
          </Badge>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
          AI ドラフトレビュー
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
          <code className="font-mono">npm run ai:draft</code> で生成したドラフトを承認 / 却下する社内ツール。
          承認したドラフトは <code className="font-mono">applied</code> ステータスに変更後、seed TS ファイルに手動で取り込む運用。
        </p>
      </header>

      {/* Status summary */}
      <section className="mb-8 grid gap-3 grid-cols-2 sm:grid-cols-4">
        {STATUS_ORDER.map((s) => (
          <Card key={s} className="p-4">
            <p className="label-mono text-muted-foreground mb-1.5">
              {AI_DRAFT_STATUS_LABEL[s]}
            </p>
            <p className="metric-number text-2xl font-bold text-foreground leading-none">
              {counts[s].toString().padStart(2, "0")}
            </p>
          </Card>
        ))}
      </section>

      {/* CLI hint */}
      <Card className="mb-6 p-4 bg-muted/30 border-dashed">
        <p className="label-mono text-muted-foreground mb-2">CLI 使い方</p>
        <pre className="text-[12px] font-mono text-foreground/85 overflow-x-auto leading-relaxed">
{`npm run ai:draft -- --type=entity --topic="Cercarbono レジストリの差別化要因"
npm run ai:draft -- --type=faq --topic="GX-ETS で Verra クレジットの取り扱い"
npm run ai:draft -- --type=case_study --topic="Salesforce の Net Zero 戦略"`}
        </pre>
      </Card>

      {/* Groups */}
      <div className="space-y-8">
        {STATUS_ORDER.map((s) => {
          const items = grouped.get(s) ?? [];
          if (items.length === 0) return null;
          return (
            <section key={s}>
              <div className="flex items-center gap-2 mb-3">
                <span
                  className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10.5px] tracking-wider ${STATUS_BADGE_CLASS[s]}`}
                >
                  {AI_DRAFT_STATUS_LABEL[s]}
                </span>
                <span className="metric-number text-[10px] text-muted-foreground">
                  {items.length.toString().padStart(2, "0")}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((d) => (
                  <DraftCard key={d.id} draft={d} />
                ))}
              </div>
            </section>
          );
        })}

        {drafts.length === 0 && (
          <Card className="p-12">
            <p className="text-center label-mono text-muted-foreground">
              ドラフトはまだありません。上記 CLI で生成してください。
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}

function DraftCard({ draft }: { draft: AiDraft }) {
  // content から表示用のタイトルを取り出す (型ごとに違うフィールド)
  const c = draft.content as {
    name_ja?: string;
    question?: string;
    title?: string;
    company?: string;
    slug?: string;
  };
  const displayTitle =
    c.name_ja ?? c.question ?? c.title ?? c.slug ?? "(無題)";
  const subtitle =
    draft.type === "case_study" && c.company
      ? `${c.company} · ${c.slug ?? ""}`
      : (c.slug ?? "");

  return (
    <Link href={`/admin/drafts/${draft.id}`}>
      <Card className="h-full p-4 hover:border-accent/60 hover:shadow-[0_4px_24px_-8px_rgba(14,165,233,0.18)] transition-all group">
        <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
          <span className="inline-flex items-center rounded border border-border bg-muted/50 px-1.5 py-0.5 text-[10.5px] text-foreground/80">
            {AI_DRAFT_TYPE_LABEL[draft.type]}
          </span>
          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-accent transition-colors" />
        </div>
        <h3 className="text-sm font-semibold text-foreground group-hover:text-accent mb-1 leading-snug line-clamp-2">
          {displayTitle}
        </h3>
        {subtitle && (
          <p className="font-mono text-[10.5px] text-muted-foreground mb-2 truncate">
            {subtitle}
          </p>
        )}
        <p className="text-[11.5px] text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
          <span className="opacity-70">topic: </span>
          {draft.topic}
        </p>
        <div className="flex items-center justify-between label-mono text-muted-foreground">
          <span className="metric-number">
            {new Date(draft.created_at).toISOString().slice(0, 10)}
          </span>
          <span className="font-mono text-[10px] opacity-70">
            {draft.model.replace(/^claude-/, "")}
          </span>
        </div>
      </Card>
    </Link>
  );
}
