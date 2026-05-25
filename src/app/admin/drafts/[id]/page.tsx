import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Check, X, Trash2, FileCode2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { findDraftById } from "@/lib/data/ai-drafts";
import {
  AI_DRAFT_STATUS_LABEL,
  AI_DRAFT_TYPE_LABEL,
  type AiDraftStatus,
} from "@/lib/types";
import {
  deleteDraftAction,
  setDraftStatusAction,
} from "@/app/admin/drafts/actions";

type Props = { params: Promise<{ id: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Draft ${id}` };
}

const STATUS_BADGE_CLASS: Record<AiDraftStatus, string> = {
  pending:
    "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  approved:
    "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  rejected:
    "border-rose-500/40 bg-rose-500/10 text-rose-700 dark:text-rose-300",
  applied: "border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300",
};

export default async function AdminDraftDetailPage({ params }: Props) {
  const { id } = await params;
  const draft = await findDraftById(id);
  if (!draft) notFound();

  const c = draft.content as Record<string, unknown> & { slug?: string };
  const draftSlug = typeof c.slug === "string" ? c.slug : undefined;

  return (
    <div className="px-6 sm:px-8 py-8 max-w-[1200px] mx-auto">
      <nav className="mb-6">
        <Link
          href="/admin/drafts"
          className="inline-flex items-center gap-1.5 label-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="font-mono">←</span> All Drafts
        </Link>
      </nav>

      <header className="mb-6 pb-6 border-b border-border">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <Badge
            variant="outline"
            className="font-mono text-[10px] tracking-wider uppercase border-accent/40 text-accent"
          >
            {AI_DRAFT_TYPE_LABEL[draft.type]}
          </Badge>
          <span
            className={`inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10.5px] tracking-wider ${STATUS_BADGE_CLASS[draft.status]}`}
          >
            {AI_DRAFT_STATUS_LABEL[draft.status]}
          </span>
          {draft.target_slug && (
            <Badge variant="secondary" className="font-mono text-[10px]">
              更新対象: {draft.target_slug}
            </Badge>
          )}
          <span className="metric-number text-[10.5px] text-muted-foreground ml-auto">
            {new Date(draft.created_at).toISOString().slice(0, 19).replace("T", " ")} UTC
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground mb-2">
          {draft.topic}
        </h1>
        <div className="label-mono text-muted-foreground flex items-center gap-3 flex-wrap">
          <span>
            id: <span className="font-mono">{draft.id}</span>
          </span>
          <span className="opacity-50">·</span>
          <span>
            model: <span className="font-mono">{draft.model}</span>
          </span>
          {draftSlug && (
            <>
              <span className="opacity-50">·</span>
              <span>
                draft slug: <span className="font-mono">{draftSlug}</span>
              </span>
            </>
          )}
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <article className="min-w-0 space-y-6">
          {/* Content preview */}
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileCode2 className="h-4 w-4 text-accent" />
                <p className="label-mono text-foreground">Generated Content (JSON)</p>
              </div>
              <pre className="text-[12px] font-mono text-foreground/85 overflow-x-auto leading-relaxed bg-muted/30 p-4 rounded border border-border">
                {JSON.stringify(draft.content, null, 2)}
              </pre>
            </CardContent>
          </Card>

          {/* Type-specific rendered preview */}
          <RenderedPreview type={draft.type} content={draft.content} />

          {/* Prompt audit */}
          <details className="group">
            <summary className="cursor-pointer label-mono text-muted-foreground hover:text-foreground select-none">
              ▶ プロンプト (監査用)
            </summary>
            <Card className="mt-2">
              <CardContent className="p-5">
                <pre className="text-[11.5px] font-mono text-foreground/75 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {draft.prompt}
                </pre>
              </CardContent>
            </Card>
          </details>
        </article>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {/* Review form */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <p className="label-mono text-foreground">レビュー</p>

              {draft.reviewer_notes && (
                <div className="text-[12.5px] text-foreground/80 bg-muted/30 p-2.5 rounded border border-border">
                  <p className="label-mono text-muted-foreground mb-1">前回メモ</p>
                  {draft.reviewer_notes}
                </div>
              )}

              <form className="space-y-2">
                <input type="hidden" name="id" value={draft.id} />
                <Textarea
                  name="notes"
                  defaultValue={draft.reviewer_notes ?? ""}
                  placeholder="レビューメモ (任意)"
                  className="text-sm min-h-[80px]"
                />
                <div className="flex flex-col gap-2">
                  <Button
                    type="submit"
                    formAction={setDraftStatusAction}
                    name="status"
                    value="approved"
                    variant="default"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Check className="h-4 w-4" />
                    承認 (Approve)
                  </Button>
                  <Button
                    type="submit"
                    formAction={setDraftStatusAction}
                    name="status"
                    value="rejected"
                    variant="outline"
                    className="border-rose-500/40 text-rose-700 dark:text-rose-300 hover:bg-rose-500/10"
                  >
                    <X className="h-4 w-4" />
                    却下 (Reject)
                  </Button>
                  {draft.status === "approved" && (
                    <Button
                      type="submit"
                      formAction={setDraftStatusAction}
                      name="status"
                      value="applied"
                      variant="outline"
                      className="border-sky-500/40 text-sky-700 dark:text-sky-300 hover:bg-sky-500/10"
                    >
                      Seed 取り込み済みにマーク
                    </Button>
                  )}
                  {draft.status !== "pending" && (
                    <Button
                      type="submit"
                      formAction={setDraftStatusAction}
                      name="status"
                      value="pending"
                      variant="ghost"
                      className="text-muted-foreground"
                    >
                      未レビューに戻す
                    </Button>
                  )}
                </div>
              </form>

              {draft.reviewed_at && (
                <p className="label-mono text-muted-foreground">
                  Last reviewed: {new Date(draft.reviewed_at).toISOString().slice(0, 19).replace("T", " ")} UTC
                </p>
              )}
            </CardContent>
          </Card>

          {/* Apply guide */}
          <Card>
            <CardContent className="p-5">
              <p className="label-mono text-foreground mb-2">Apply 手順</p>
              <ol className="space-y-1.5 text-[12.5px] text-foreground/80 list-decimal list-inside leading-relaxed">
                <li>上の JSON をコピー</li>
                <li>
                  対応 seed (
                  <span className="font-mono">
                    src/lib/data/
                    {draft.type === "entity"
                      ? "entities.ts"
                      : draft.type === "faq"
                        ? "faqs.ts"
                        : "case-studies.ts"}
                  </span>
                  ) を開く
                </li>
                <li>TS リテラル形式に変換して配列に追加</li>
                <li>ビルド + lint を通す</li>
                <li>本ドラフトを「Seed 取り込み済み」にマーク</li>
              </ol>
            </CardContent>
          </Card>

          {/* Delete */}
          <form>
            <input type="hidden" name="id" value={draft.id} />
            <Button
              type="submit"
              formAction={deleteDraftAction}
              variant="ghost"
              className="w-full text-rose-700 dark:text-rose-300 hover:bg-rose-500/10 hover:text-rose-700"
            >
              <Trash2 className="h-4 w-4" />
              削除
            </Button>
          </form>
        </aside>
      </div>
    </div>
  );
}

/* ============================================================
 * 型ごとの簡易プレビュー
 * ============================================================ */

function RenderedPreview({
  type,
  content,
}: {
  type: "entity" | "faq" | "case_study";
  content: unknown;
}) {
  if (type === "entity") return <EntityPreview content={content} />;
  if (type === "faq") return <FaqPreview content={content} />;
  return <CaseStudyPreview content={content} />;
}

type Section = { heading?: string; body?: string };

function EntityPreview({ content }: { content: unknown }) {
  const c = content as {
    name_ja?: string;
    name_en?: string;
    abbreviation?: string;
    type?: string;
    summary?: string;
    sections?: Section[];
    tags?: string[];
  };
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <p className="label-mono text-muted-foreground">Rendered Preview</p>
        <h3 className="text-lg font-bold text-foreground">
          {c.name_ja ?? "(name_ja 未設定)"}
          {c.abbreviation && (
            <span className="ml-2 label-mono text-muted-foreground">
              {c.abbreviation}
            </span>
          )}
        </h3>
        {c.name_en && (
          <p className="font-mono text-[11.5px] text-muted-foreground -mt-2">
            {c.name_en}
          </p>
        )}
        {c.type && (
          <Badge variant="secondary" className="font-mono text-[10px]">
            {c.type}
          </Badge>
        )}
        {c.summary && (
          <p className="text-sm text-foreground/85 leading-relaxed">{c.summary}</p>
        )}
        {Array.isArray(c.sections) &&
          c.sections.map((s, i) => (
            <div key={i} className="border-t border-border pt-3">
              <p className="text-sm font-semibold text-foreground mb-1">
                {s.heading}
              </p>
              <p className="text-[12.5px] text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {s.body}
              </p>
            </div>
          ))}
        {c.tags && c.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border">
            {c.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded border border-border bg-muted/40 px-1.5 py-0.5 text-[10.5px] text-foreground/85"
              >
                #{t}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FaqPreview({ content }: { content: unknown }) {
  const c = content as {
    question?: string;
    short_answer?: string;
    detailed_md?: string;
    category?: string;
  };
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <p className="label-mono text-muted-foreground">Rendered Preview</p>
        {c.category && (
          <Badge variant="secondary" className="font-mono text-[10px]">
            {c.category}
          </Badge>
        )}
        <h3 className="text-base font-bold text-foreground">{c.question}</h3>
        <p className="text-sm text-foreground/85 leading-relaxed border-l-2 border-accent/50 pl-3">
          {c.short_answer}
        </p>
        {c.detailed_md && (
          <div className="border-t border-border pt-3">
            <p className="text-[12.5px] text-foreground/80 leading-relaxed whitespace-pre-wrap">
              {c.detailed_md}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CaseStudyPreview({ content }: { content: unknown }) {
  const c = content as {
    title?: string;
    company?: string;
    year?: number;
    region?: string;
    summary?: string;
    sections?: Section[];
  };
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <p className="label-mono text-muted-foreground">Rendered Preview</p>
        <div className="flex items-center gap-2 flex-wrap">
          {c.company && (
            <Badge variant="secondary" className="font-mono text-[10px]">
              {c.company}
            </Badge>
          )}
          {c.year && (
            <span className="metric-number text-[10.5px] text-muted-foreground">
              {c.year}
            </span>
          )}
          {c.region && (
            <span className="label-mono text-muted-foreground">{c.region}</span>
          )}
        </div>
        <h3 className="text-lg font-bold text-foreground">{c.title}</h3>
        {c.summary && (
          <p className="text-sm text-foreground/85 leading-relaxed">{c.summary}</p>
        )}
        {Array.isArray(c.sections) &&
          c.sections.map((s, i) => (
            <div key={i} className="border-t border-border pt-3">
              <p className="text-sm font-semibold text-foreground mb-1">
                {s.heading}
              </p>
              <p className="text-[12.5px] text-foreground/80 leading-relaxed whitespace-pre-wrap">
                {s.body}
              </p>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
