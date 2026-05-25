"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CsvField,
  MarkdownTextareaField,
  TextField,
  TextareaField,
  UrlsField,
} from "@/components/admin/edit-form";
import type { FAQItem, FaqCategory } from "@/lib/types";
import {
  deleteContentAction,
  saveContentAction,
} from "@/app/admin/edit/actions";

const CATEGORIES: FaqCategory[] = ["procurement", "reporting", "regulation", "quality"];
const STATUSES: FAQItem["status"][] = ["draft", "published", "archived"];

export function FaqEditClient({ initial }: { initial: FAQItem }) {
  const router = useRouter();
  const [draft, setDraft] = React.useState<FAQItem>(initial);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<
    { kind: "success" | "error"; text: string } | null
  >(null);

  const update = <K extends keyof FAQItem>(key: K, value: FAQItem[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    setSaving(true);
    setMessage(null);
    const result = await saveContentAction("faqs", draft);
    setSaving(false);
    if (result.ok) {
      setMessage({ kind: "success", text: "保存しました" });
      router.refresh();
    } else {
      setMessage({ kind: "error", text: result.error });
    }
  };

  const onDelete = async () => {
    if (!confirm(`本当に "${draft.slug}" を削除しますか?`)) return;
    setSaving(true);
    const result = await deleteContentAction("faqs", draft.slug);
    setSaving(false);
    if (result.ok) router.push("/admin/edit/faqs");
    else setMessage({ kind: "error", text: result.error });
  };

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-20 -mx-2 px-2 py-2 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b border-border flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Button type="button" onClick={onSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            保存
          </Button>
          {message && (
            <span
              className={`text-[12px] font-mono px-2 py-0.5 rounded ${
                message.kind === "success"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "bg-rose-500/10 text-rose-700 dark:text-rose-300"
              }`}
            >
              {message.text}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/faq"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[12px] text-accent hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            FAQ 一覧を開く
          </Link>
          <Button
            type="button"
            variant="ghost"
            onClick={onDelete}
            disabled={saving}
            className="text-rose-700 dark:text-rose-300 hover:bg-rose-500/10"
          >
            <Trash2 className="h-4 w-4" />
            削除
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="label-mono text-muted-foreground">Identity</p>
          <TextField
            label="Slug"
            required
            monospace
            value={draft.slug}
            onChange={(v) => update("slug", v)}
          />
          <TextareaField
            label="Question"
            required
            rows={2}
            value={draft.question}
            onChange={(v) => update("question", v)}
          />
          <div>
            <label className="block text-[12.5px] font-medium text-foreground mb-1.5">
              Category<span className="ml-1 text-rose-500">*</span>
            </label>
            <select
              value={draft.category}
              onChange={(e) => update("category", e.target.value as FaqCategory)}
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="label-mono text-muted-foreground">Body</p>
          <TextareaField
            label="Short answer"
            required
            rows={3}
            value={draft.short_answer}
            onChange={(v) => update("short_answer", v)}
            description="1-2 文の要点回答"
          />
          <MarkdownTextareaField
            label="Detailed (Markdown)"
            required
            rows={12}
            value={draft.detailed_md}
            onChange={(v) => update("detailed_md", v)}
            description="Markdown 詳細解説 (400-800 字)。プレビューで見出しやリストの見え方を確認できます"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="label-mono text-muted-foreground">関連 + 出典 + タグ</p>
          <CsvField
            label="関連エンティティ (related_entity_slugs)"
            value={draft.related_entity_slugs}
            onChange={(v) => update("related_entity_slugs", v)}
          />
          <CsvField
            label="関連比較行列 (related_matrix_slugs)"
            value={draft.related_matrix_slugs ?? []}
            onChange={(v) => update("related_matrix_slugs", v.length ? v : undefined)}
          />
          <UrlsField
            label="出典 (source_urls)"
            value={draft.source_urls ?? []}
            onChange={(v) => update("source_urls", v.length ? v : undefined)}
          />
          <CsvField
            label="タグ"
            value={draft.tags}
            onChange={(v) => update("tags", v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="label-mono text-muted-foreground">レビューメタ</p>
          <div className="grid sm:grid-cols-3 gap-4">
            <TextField
              label="last_reviewed_at"
              required
              monospace
              value={draft.last_reviewed_at}
              onChange={(v) => update("last_reviewed_at", v)}
            />
            <TextField
              label="next_review_at"
              monospace
              value={draft.next_review_at ?? ""}
              onChange={(v) => update("next_review_at", v || undefined)}
            />
            <div>
              <label className="block text-[12.5px] font-medium text-foreground mb-1.5">
                Status<span className="ml-1 text-rose-500">*</span>
              </label>
              <select
                value={draft.status}
                onChange={(e) => update("status", e.target.value as FAQItem["status"])}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
