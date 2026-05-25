"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CsvField,
  DimensionsField,
  EntityRefsField,
  JsonField,
  TextField,
  TextareaField,
} from "@/components/admin/edit-form";
import type {
  ComparisonCell,
  ComparisonMatrix,
  MatrixCategory,
} from "@/lib/types";
import {
  deleteContentAction,
  saveContentAction,
} from "@/app/admin/edit/actions";

const CATEGORIES: MatrixCategory[] = [
  "scheme",
  "standard",
  "methodology",
  "market",
  "eligibility",
];
const STATUSES: ComparisonMatrix["status"][] = [
  "draft",
  "published",
  "archived",
];

export function MatrixEditClient({ initial }: { initial: ComparisonMatrix }) {
  const router = useRouter();
  const [draft, setDraft] = React.useState<ComparisonMatrix>(initial);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<
    { kind: "success" | "error"; text: string } | null
  >(null);

  const update = <K extends keyof ComparisonMatrix>(
    key: K,
    value: ComparisonMatrix[K]
  ) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    setSaving(true);
    setMessage(null);
    const result = await saveContentAction("matrices", draft);
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
    const result = await deleteContentAction("matrices", draft.slug);
    setSaving(false);
    if (result.ok) router.push("/admin/edit/matrices");
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
            href={`/matrices/${draft.slug}`}
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
          <TextField label="Slug" required monospace value={draft.slug} onChange={(v) => update("slug", v)} />
          <TextField label="Title" required value={draft.title} onChange={(v) => update("title", v)} />
          <TextareaField
            label="Description"
            required
            rows={3}
            value={draft.description}
            onChange={(v) => update("description", v)}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[12.5px] font-medium text-foreground mb-1.5">
                Category
              </label>
              <select
                value={draft.category ?? ""}
                onChange={(e) =>
                  update("category", (e.target.value || undefined) as MatrixCategory | undefined)
                }
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">(未設定)</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <CsvField
              label="タグ"
              value={draft.tags ?? []}
              onChange={(v) => update("tags", v.length ? v : undefined)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="label-mono text-muted-foreground">
            行列構造 (JSON 直接編集)
          </p>
          <DimensionsField
            label="軸 (dimensions)"
            description="列に並ぶ比較軸を 1 行ずつ追加"
            value={draft.dimensions}
            onChange={(v) => update("dimensions", v)}
          />
          <EntityRefsField
            label="エンティティ (行)"
            description="行に並ぶエンティティを 1 行ずつ追加"
            value={draft.entities}
            onChange={(v) => update("entities", v)}
          />
          <JsonField<Record<string, Record<string, ComparisonCell>>>
            label="セル (cells) — JSON 直接編集"
            description="cells[entitySlug][dimensionKey] = { value, source_url?, source_label?, note? }。Grid editor は今後実装予定"
            value={draft.cells}
            onChange={(v) => update("cells", v)}
            rows={20}
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
                onChange={(e) => update("status", e.target.value as ComparisonMatrix["status"])}
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
