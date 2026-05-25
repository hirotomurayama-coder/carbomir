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
import type {
  TimelineCategory,
  TimelineEvent,
  TimelineImportance,
} from "@/lib/types";
import {
  deleteContentAction,
  saveContentAction,
} from "@/app/admin/edit/actions";

const CATEGORIES: TimelineCategory[] = [
  "regulatory",
  "market",
  "technology",
  "methodology",
];
const STATUSES: TimelineEvent["status"][] = ["draft", "published", "archived"];

export function TimelineEditClient({ initial }: { initial: TimelineEvent }) {
  const router = useRouter();
  const [draft, setDraft] = React.useState<TimelineEvent>(initial);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<
    { kind: "success" | "error"; text: string } | null
  >(null);

  const update = <K extends keyof TimelineEvent>(
    key: K,
    value: TimelineEvent[K]
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    setSaving(true);
    setMessage(null);
    const result = await saveContentAction("timeline", draft);
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
    const result = await deleteContentAction("timeline", draft.slug);
    setSaving(false);
    if (result.ok) router.push("/admin/edit/timeline");
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
            href={`/timeline/${draft.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[12px] text-accent hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            公開ページを開く
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
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField
              label="Slug"
              required
              monospace
              value={draft.slug}
              onChange={(v) => update("slug", v)}
            />
            <TextField
              label="event_date"
              required
              monospace
              value={draft.event_date}
              onChange={(v) => update("event_date", v)}
              description="YYYY-MM-DD"
            />
          </div>
          <TextField
            label="Title"
            required
            value={draft.title}
            onChange={(v) => update("title", v)}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12.5px] font-medium text-foreground mb-1.5">
                Category<span className="ml-1 text-rose-500">*</span>
              </label>
              <select
                value={draft.category}
                onChange={(e) =>
                  update("category", e.target.value as TimelineCategory)
                }
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[12.5px] font-medium text-foreground mb-1.5">
                Importance<span className="ml-1 text-rose-500">*</span>
              </label>
              <select
                value={String(draft.importance)}
                onChange={(e) =>
                  update("importance", Number(e.target.value) as TimelineImportance)
                }
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n} / 5</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="label-mono text-muted-foreground">Body</p>
          <TextareaField
            label="Summary"
            required
            rows={3}
            value={draft.summary}
            onChange={(v) => update("summary", v)}
          />
          <MarkdownTextareaField
            label="Content (Markdown, optional)"
            rows={15}
            value={draft.content_md ?? ""}
            onChange={(v) => update("content_md", v || undefined)}
            description="詳細解説。「編集部の論点」セクションを忘れずに。プレビューで見出し階層を確認"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="label-mono text-muted-foreground">関連 + 出典</p>
          <CsvField
            label="affected_entity_slugs"
            description="このイベントが影響を与える entity の slug"
            value={draft.affected_entity_slugs}
            onChange={(v) => update("affected_entity_slugs", v)}
          />
          <UrlsField
            label="source_urls"
            value={draft.source_urls}
            onChange={(v) => update("source_urls", v)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="label-mono text-muted-foreground">Status</p>
          <div>
            <label className="block text-[12.5px] font-medium text-foreground mb-1.5">
              Status<span className="ml-1 text-rose-500">*</span>
            </label>
            <select
              value={draft.status}
              onChange={(e) =>
                update("status", e.target.value as TimelineEvent["status"])
              }
              className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm max-w-[260px]"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
