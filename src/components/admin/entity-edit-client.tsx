"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CsvField,
  RelationsField,
  SectionsField,
  TextField,
  TextareaField,
} from "@/components/admin/edit-form";
import { Card, CardContent } from "@/components/ui/card";
import type { Entity, PolicyStatus } from "@/lib/types";
import {
  deleteContentAction,
  saveContentAction,
} from "@/app/admin/edit/actions";

const POLICY_STATUSES: PolicyStatus[] = [
  "active",
  "transition",
  "pilot",
  "draft",
  "discontinued",
];

const ENTITY_TYPES: Entity["type"][] = [
  "methodology",
  "regulation",
  "player",
  "market",
  "technology",
  "project",
];
const STATUSES: Entity["status"][] = ["draft", "published", "archived"];

type Props = {
  initial: Entity;
  /** 候補 slug のリスト (RelationsField のオートコンプリート用) */
  slugSuggestions?: string[];
};

export function EntityEditClient({ initial, slugSuggestions }: Props) {
  const router = useRouter();
  const [draft, setDraft] = React.useState<Entity>(initial);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  // 編集中フラグ: draft と initial が異なれば未保存
  const dirty = React.useMemo(
    () => JSON.stringify(draft) !== JSON.stringify(initial),
    [draft, initial]
  );

  const update = <K extends keyof Entity>(key: K, value: Entity[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const onSave = async () => {
    setSaving(true);
    setMessage(null);
    const result = await saveContentAction("entities", draft);
    setSaving(false);
    if (result.ok) {
      setMessage({ kind: "success", text: "保存しました" });
      router.refresh();
    } else {
      setMessage({ kind: "error", text: result.error });
    }
  };

  const onDelete = async () => {
    if (!confirm(`本当に "${draft.slug}" を削除しますか? この操作は取り消せません`))
      return;
    setSaving(true);
    const result = await deleteContentAction("entities", draft.slug);
    setSaving(false);
    if (result.ok) {
      router.push("/admin/edit/entities");
    } else {
      setMessage({ kind: "error", text: result.error });
    }
  };

  return (
    <div className="space-y-6">
      {/* Sticky Action bar */}
      <div className="sticky top-0 z-20 -mx-2 px-2 py-2 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70 border-b border-border flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Button type="button" onClick={onSave} disabled={saving || !dirty}>
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {dirty ? "保存" : "保存済み"}
          </Button>
          {dirty && !message && (
            <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300">
              未保存の変更があります
            </span>
          )}
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
            href={`/entities/${draft.slug}`}
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

      {/* Identity */}
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
              description="ファイル名と URL に使う。kebab-case (a-z 0-9 -)"
            />
            <div>
              <label className="block text-[12.5px] font-medium text-foreground mb-1.5">
                Type<span className="ml-1 text-rose-500">*</span>
              </label>
              <select
                value={draft.type}
                onChange={(e) => update("type", e.target.value as Entity["type"])}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {ENTITY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField
              label="名称 (日本語)"
              required
              value={draft.name_ja}
              onChange={(v) => update("name_ja", v)}
            />
            <TextField
              label="Name (English)"
              value={draft.name_en ?? ""}
              onChange={(v) => update("name_en", v || undefined)}
            />
          </div>
          <TextField
            label="略称 (abbreviation)"
            value={draft.abbreviation ?? ""}
            onChange={(v) => update("abbreviation", v || undefined)}
            description="例: VCS, JCM, CCP"
          />
        </CardContent>
      </Card>

      {/* Summary + sections */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="label-mono text-muted-foreground">Body</p>
          <TextareaField
            label="Summary"
            required
            rows={3}
            value={draft.summary}
            onChange={(v) => update("summary", v)}
            description="1-2 文 (80-160 字目安) の要約"
          />
          <SectionsField
            label="Sections"
            description="本文セクション (heading + body Markdown)"
            value={draft.sections}
            onChange={(v) => update("sections", v)}
          />
        </CardContent>
      </Card>

      {/* Structured attributes */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="label-mono text-muted-foreground">構造化属性</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField
              label="管轄 (jurisdiction)"
              value={draft.jurisdiction ?? ""}
              onChange={(v) => update("jurisdiction", v || undefined)}
            />
            <TextField
              label="設立年 (established_year)"
              type="number"
              value={
                draft.established_year !== undefined
                  ? String(draft.established_year)
                  : ""
              }
              onChange={(v) =>
                update(
                  "established_year",
                  v === "" ? undefined : Number(v)
                )
              }
            />
            <TextField
              label="運営主体 (operator)"
              value={draft.operator ?? ""}
              onChange={(v) => update("operator", v || undefined)}
            />
            <TextField
              label="地理スコープ (geographic_scope)"
              value={draft.geographic_scope ?? ""}
              onChange={(v) => update("geographic_scope", v || undefined)}
            />
            <TextField
              label="Website URL"
              type="url"
              value={draft.website_url ?? ""}
              onChange={(v) => update("website_url", v || undefined)}
            />
            <TextField
              label="クレジット単位 (credit_unit)"
              value={draft.credit_unit ?? ""}
              onChange={(v) => update("credit_unit", v || undefined)}
            />
            <TextField
              label="親会社 (parent_company)"
              value={draft.parent_company ?? ""}
              onChange={(v) => update("parent_company", v || undefined)}
              description="player の場合"
            />
            <TextField
              label="業界での役割 (business_role)"
              value={draft.business_role ?? ""}
              onChange={(v) => update("business_role", v || undefined)}
              description="player の場合"
            />
            <div>
              <label className="block text-[12.5px] font-medium text-foreground mb-1.5">
                制度ステータス (policy_status)
              </label>
              <p className="text-[11px] text-muted-foreground mb-1 leading-snug">
                regulation の場合のみ
              </p>
              <select
                value={draft.policy_status ?? ""}
                onChange={(e) =>
                  update(
                    "policy_status",
                    (e.target.value || undefined) as PolicyStatus | undefined
                  )
                }
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">(未設定)</option>
                {POLICY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <TextField
              label="次マイルストーン (next_milestone)"
              value={draft.next_milestone ?? ""}
              onChange={(v) => update("next_milestone", v || undefined)}
              description="例: 2027-04-01: 第2フェーズ有償化開始"
            />
          </div>
        </CardContent>
      </Card>

      {/* Relations + tags */}
      <Card>
        <CardContent className="p-5 space-y-4">
          <p className="label-mono text-muted-foreground">関連 + タグ</p>
          <CsvField
            label="タグ (tags)"
            description="comma 区切り。STYLE_GUIDE の controlled vocabulary 準拠"
            value={draft.tags}
            onChange={(v) => update("tags", v)}
          />
          <CsvField
            label="関連比較行列 (related_matrix_slugs)"
            description="比較行列の slug を comma 区切り"
            value={draft.related_matrix_slugs}
            onChange={(v) => update("related_matrix_slugs", v)}
          />
          <RelationsField
            label="関連エンティティ (related)"
            description="他エンティティとの関係性を 1 行ずつ追加。to_slug = 関連先 / relation = 関係種別 / note = 関係の補足"
            value={draft.related}
            onChange={(v) => update("related", v)}
            slugSuggestions={slugSuggestions}
          />
        </CardContent>
      </Card>

      {/* Review meta */}
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
              description="YYYY-MM-DD"
            />
            <TextField
              label="next_review_at"
              monospace
              value={draft.next_review_at ?? ""}
              onChange={(v) => update("next_review_at", v || undefined)}
              description="YYYY-MM-DD (任意)"
            />
            <div>
              <label className="block text-[12.5px] font-medium text-foreground mb-1.5">
                Status<span className="ml-1 text-rose-500">*</span>
              </label>
              <select
                value={draft.status}
                onChange={(e) =>
                  update("status", e.target.value as Entity["status"])
                }
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
