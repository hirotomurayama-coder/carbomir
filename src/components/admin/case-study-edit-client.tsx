"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CsvField,
  SectionsField,
  TextField,
  TextareaField,
  UrlsField,
} from "@/components/admin/edit-form";
import type { CaseStudy, CaseStudyCategory } from "@/lib/types";
import {
  deleteContentAction,
  saveContentAction,
} from "@/app/admin/edit/actions";

const CATEGORIES: CaseStudyCategory[] = [
  "procurement",
  "supply",
  "reporting",
  "compliance",
];
const STATUSES: CaseStudy["status"][] = ["draft", "published", "archived"];

export function CaseStudyEditClient({ initial }: { initial: CaseStudy }) {
  const router = useRouter();
  const [draft, setDraft] = React.useState<CaseStudy>(initial);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<
    { kind: "success" | "error"; text: string } | null
  >(null);

  const update = <K extends keyof CaseStudy>(key: K, value: CaseStudy[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    setSaving(true);
    setMessage(null);
    const result = await saveContentAction("case-studies", draft);
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
    const result = await deleteContentAction("case-studies", draft.slug);
    setSaving(false);
    if (result.ok) router.push("/admin/edit/case-studies");
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
            href={`/case-studies/${draft.slug}`}
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
          <div className="grid sm:grid-cols-3 gap-4">
            <TextField label="Company" required value={draft.company} onChange={(v) => update("company", v)} />
            <TextField
              label="Year"
              type="number"
              required
              monospace
              value={String(draft.year)}
              onChange={(v) => update("year", Number(v) || 0)}
            />
            <TextField label="Region" value={draft.region} onChange={(v) => update("region", v)} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[12.5px] font-medium text-foreground mb-1.5">
                Category<span className="ml-1 text-rose-500">*</span>
              </label>
              <select
                value={draft.category}
                onChange={(e) => update("category", e.target.value as CaseStudyCategory)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <TextField
              label="Credit type (optional)"
              value={draft.credit_type ?? ""}
              onChange={(v) => update("credit_type", v || undefined)}
            />
            <TextField
              label="Scale note (optional)"
              value={draft.scale_note ?? ""}
              onChange={(v) => update("scale_note", v || undefined)}
            />
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
          <SectionsField
            label="Sections"
            description="本文セクション。最後は「編集部の論点」 + 「日本企業が参考にできる点」が定石"
            value={draft.sections}
            onChange={(v) => update("sections", v)}
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
          <UrlsField
            label="出典 (source_urls)"
            value={draft.source_urls}
            onChange={(v) => update("source_urls", v)}
          />
          <CsvField label="タグ" value={draft.tags} onChange={(v) => update("tags", v)} />
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
                onChange={(e) => update("status", e.target.value as CaseStudy["status"])}
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
