"use client";

import * as React from "react";
import { Plus, X, ChevronUp, ChevronDown, Eye, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MarkdownContent } from "@/components/markdown-content";
import type { RelationType } from "@/lib/types";
import { RELATION_LABEL } from "@/lib/types";

/**
 * /admin/edit/* で使う共通フォーム primitives.
 *
 * 設計:
 *   - Controlled inputs (親が value/onChange を渡す)
 *   - sections のような array-of-objects は SectionsField で動的編集
 *   - 配列 of string (tags, slugs 等) は CsvField で comma 区切り入力
 *   - 複雑なネスト構造 (matrix cells 等) は JsonField で生 JSON 編集にフォールバック
 */

type BaseFieldProps = {
  label: string;
  required?: boolean;
  description?: string;
  className?: string;
};

function FieldLabel({
  label,
  required,
  description,
}: {
  label: string;
  required?: boolean;
  description?: string;
}) {
  return (
    <div className="mb-1.5">
      <label className="block text-[12.5px] font-medium text-foreground">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      {description && (
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
          {description}
        </p>
      )}
    </div>
  );
}

/* ============================================================
 * TextField — single line
 * ============================================================ */

type TextFieldProps = BaseFieldProps & {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  monospace?: boolean;
  type?: "text" | "url" | "number";
};

export function TextField({
  label,
  description,
  required,
  value,
  onChange,
  placeholder,
  monospace,
  type = "text",
  className,
}: TextFieldProps) {
  return (
    <div className={className}>
      <FieldLabel label={label} required={required} description={description} />
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={monospace ? "font-mono text-sm" : "text-sm"}
      />
    </div>
  );
}

/* ============================================================
 * TextareaField — multi-line markdown / long text
 * ============================================================ */

type TextareaFieldProps = BaseFieldProps & {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  monospace?: boolean;
};

export function TextareaField({
  label,
  description,
  required,
  value,
  onChange,
  placeholder,
  rows = 4,
  monospace,
  className,
}: TextareaFieldProps) {
  return (
    <div className={className}>
      <FieldLabel label={label} required={required} description={description} />
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={monospace ? "font-mono text-sm" : "text-sm"}
      />
    </div>
  );
}

/* ============================================================
 * CsvField — string[] を comma 区切りで編集
 * ============================================================ */

type CsvFieldProps = BaseFieldProps & {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
};

export function CsvField({
  label,
  description,
  required,
  value,
  onChange,
  placeholder,
  className,
}: CsvFieldProps) {
  const stringValue = value.join(", ");
  return (
    <div className={className}>
      <FieldLabel label={label} required={required} description={description} />
      <Input
        type="text"
        value={stringValue}
        onChange={(e) => {
          const next = e.target.value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          onChange(next);
        }}
        placeholder={placeholder ?? "comma, separated, values"}
        className="font-mono text-sm"
      />
    </div>
  );
}

/* ============================================================
 * SectionsField — { heading, body }[] を動的編集
 * ============================================================ */

export type Section = { heading: string; body: string };

type SectionsFieldProps = BaseFieldProps & {
  value: Section[];
  onChange: (v: Section[]) => void;
};

export function SectionsField({
  label,
  description,
  value,
  onChange,
  className,
}: SectionsFieldProps) {
  const update = (i: number, next: Partial<Section>) => {
    const copy = value.slice();
    copy[i] = { ...copy[i], ...next };
    onChange(copy);
  };
  const remove = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
  };
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const copy = value.slice();
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };
  const add = () => {
    onChange([...value, { heading: "", body: "" }]);
  };

  return (
    <div className={className}>
      <FieldLabel label={label} description={description} />
      <div className="space-y-3">
        {value.map((s, i) => (
          <div
            key={i}
            className="border border-border rounded-md p-3 space-y-2 bg-muted/20"
          >
            <div className="flex items-center gap-2">
              <span className="label-mono text-muted-foreground shrink-0">
                #{i + 1}
              </span>
              <Input
                value={s.heading}
                onChange={(e) => update(i, { heading: e.target.value })}
                placeholder="見出し"
                className="text-sm font-medium flex-1"
              />
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  aria-label="上へ"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={i === value.length - 1}
                  onClick={() => move(i, 1)}
                  aria-label="下へ"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-rose-700 dark:text-rose-300 hover:bg-rose-500/10"
                  onClick={() => remove(i)}
                  aria-label="削除"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <MarkdownTextareaField
              label=""
              value={s.body}
              onChange={(v) => update(i, { body: v })}
              placeholder="本文 (Markdown 可)"
              rows={6}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={add}
          className="w-full text-sm border-dashed"
        >
          <Plus className="h-3.5 w-3.5" />
          セクションを追加
        </Button>
      </div>
    </div>
  );
}

/* ============================================================
 * UrlsField — { label, url }[] を動的編集
 * ============================================================ */

export type UrlEntry = { label: string; url: string };

type UrlsFieldProps = BaseFieldProps & {
  value: UrlEntry[];
  onChange: (v: UrlEntry[]) => void;
};

export function UrlsField({
  label,
  description,
  value,
  onChange,
  className,
}: UrlsFieldProps) {
  const update = (i: number, next: Partial<UrlEntry>) => {
    const copy = value.slice();
    copy[i] = { ...copy[i], ...next };
    onChange(copy);
  };
  const remove = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
  };
  const add = () => {
    onChange([...value, { label: "", url: "" }]);
  };

  return (
    <div className={className}>
      <FieldLabel label={label} description={description} />
      <div className="space-y-2">
        {value.map((u, i) => (
          <div
            key={i}
            className="flex items-center gap-2 border border-border rounded-md p-2 bg-muted/20"
          >
            <Input
              value={u.label}
              onChange={(e) => update(i, { label: e.target.value })}
              placeholder="出典名 (label)"
              className="text-sm flex-1 max-w-[40%]"
            />
            <Input
              value={u.url}
              onChange={(e) => update(i, { url: e.target.value })}
              placeholder="https://..."
              type="url"
              className="text-sm font-mono flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-rose-700 dark:text-rose-300 hover:bg-rose-500/10 shrink-0"
              onClick={() => remove(i)}
              aria-label="削除"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={add}
          className="w-full text-sm border-dashed"
        >
          <Plus className="h-3.5 w-3.5" />
          URL を追加
        </Button>
      </div>
    </div>
  );
}

/* ============================================================
 * RelationsField — { to_slug, relation, note? }[] を行ベースで編集
 * ============================================================ */

export type RelationEntry = { to_slug: string; relation: RelationType; note?: string };

const RELATION_OPTIONS: RelationType[] = [
  "parent_of",
  "depends_on",
  "supersedes",
  "competes_with",
  "equivalent_to",
];

type RelationsFieldProps = BaseFieldProps & {
  value: RelationEntry[];
  onChange: (v: RelationEntry[]) => void;
  /** 候補 slug のリスト (オートコンプリート用、オプション) */
  slugSuggestions?: string[];
};

export function RelationsField({
  label,
  description,
  value,
  onChange,
  slugSuggestions,
  className,
}: RelationsFieldProps) {
  const update = (i: number, next: Partial<RelationEntry>) => {
    const copy = value.slice();
    copy[i] = { ...copy[i], ...next };
    onChange(copy);
  };
  const remove = (i: number) => {
    onChange(value.filter((_, idx) => idx !== i));
  };
  const add = () => {
    onChange([...value, { to_slug: "", relation: "competes_with", note: "" }]);
  };

  return (
    <div className={className}>
      <FieldLabel label={label} description={description} />
      <div className="space-y-2">
        {value.length === 0 && (
          <p className="text-[12px] text-muted-foreground italic px-2 py-2">
            関連エンティティはまだありません
          </p>
        )}
        {value.map((r, i) => (
          <div
            key={i}
            className="border border-border rounded-md p-3 bg-muted/15 space-y-2"
          >
            <div className="flex items-start gap-2 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10.5px] text-muted-foreground font-mono mb-0.5">
                  to_slug
                </label>
                <Input
                  list={slugSuggestions ? `slug-suggestions` : undefined}
                  value={r.to_slug}
                  onChange={(e) => update(i, { to_slug: e.target.value })}
                  placeholder="entity-slug"
                  className="text-sm font-mono"
                />
              </div>
              <div className="min-w-[160px]">
                <label className="block text-[10.5px] text-muted-foreground font-mono mb-0.5">
                  relation
                </label>
                <select
                  value={r.relation}
                  onChange={(e) =>
                    update(i, { relation: e.target.value as RelationType })
                  }
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  {RELATION_OPTIONS.map((rel) => (
                    <option key={rel} value={rel}>
                      {rel} — {RELATION_LABEL[rel]}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 mt-[18px] text-rose-700 dark:text-rose-300 hover:bg-rose-500/10 shrink-0"
                onClick={() => remove(i)}
                aria-label="削除"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div>
              <label className="block text-[10.5px] text-muted-foreground font-mono mb-0.5">
                note (任意)
              </label>
              <Input
                value={r.note ?? ""}
                onChange={(e) =>
                  update(i, { note: e.target.value || undefined })
                }
                placeholder="例: 国内 vs 二国間で対象範囲が異なる"
                className="text-sm"
              />
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={add}
          className="w-full text-sm border-dashed"
        >
          <Plus className="h-3.5 w-3.5" />
          関連を追加
        </Button>
        {slugSuggestions && (
          <datalist id="slug-suggestions">
            {slugSuggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        )}
      </div>
    </div>
  );
}

/* ============================================================
 * DimensionsField — { key, label_ja, description? }[] (matrix 軸)
 * ============================================================ */

export type DimensionEntry = {
  key: string;
  label_ja: string;
  description?: string;
};

type DimensionsFieldProps = BaseFieldProps & {
  value: DimensionEntry[];
  onChange: (v: DimensionEntry[]) => void;
};

export function DimensionsField({
  label,
  description,
  value,
  onChange,
  className,
}: DimensionsFieldProps) {
  const update = (i: number, next: Partial<DimensionEntry>) => {
    const copy = value.slice();
    copy[i] = { ...copy[i], ...next };
    onChange(copy);
  };
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const copy = value.slice();
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };
  const add = () => {
    onChange([...value, { key: "", label_ja: "", description: "" }]);
  };

  return (
    <div className={className}>
      <FieldLabel label={label} description={description} />
      <div className="space-y-2">
        {value.map((d, i) => (
          <div
            key={i}
            className="border border-border rounded-md p-3 bg-muted/15 space-y-2"
          >
            <div className="flex items-start gap-2 flex-wrap">
              <div className="min-w-[180px]">
                <label className="block text-[10.5px] text-muted-foreground font-mono mb-0.5">
                  key
                </label>
                <Input
                  value={d.key}
                  onChange={(e) => update(i, { key: e.target.value })}
                  placeholder="snake_case_key"
                  className="text-sm font-mono"
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10.5px] text-muted-foreground font-mono mb-0.5">
                  label_ja
                </label>
                <Input
                  value={d.label_ja}
                  onChange={(e) => update(i, { label_ja: e.target.value })}
                  placeholder="日本語ラベル"
                  className="text-sm"
                />
              </div>
              <div className="flex items-center gap-1 mt-[18px] shrink-0">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9"
                  disabled={i === value.length - 1}
                  onClick={() => move(i, 1)}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-rose-700 dark:text-rose-300 hover:bg-rose-500/10"
                  onClick={() => remove(i)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <Input
              value={d.description ?? ""}
              onChange={(e) =>
                update(i, { description: e.target.value || undefined })
              }
              placeholder="description (任意)"
              className="text-sm"
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={add}
          className="w-full text-sm border-dashed"
        >
          <Plus className="h-3.5 w-3.5" />
          軸を追加
        </Button>
      </div>
    </div>
  );
}

/* ============================================================
 * EntityRefsField — { slug, name_ja, name_en? }[] (matrix の行)
 * ============================================================ */

export type EntityRefEntry = { slug: string; name_ja: string; name_en?: string };

type EntityRefsFieldProps = BaseFieldProps & {
  value: EntityRefEntry[];
  onChange: (v: EntityRefEntry[]) => void;
  slugSuggestions?: string[];
};

export function EntityRefsField({
  label,
  description,
  value,
  onChange,
  slugSuggestions,
  className,
}: EntityRefsFieldProps) {
  const update = (i: number, next: Partial<EntityRefEntry>) => {
    const copy = value.slice();
    copy[i] = { ...copy[i], ...next };
    onChange(copy);
  };
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const copy = value.slice();
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };
  const add = () => onChange([...value, { slug: "", name_ja: "" }]);

  return (
    <div className={className}>
      <FieldLabel label={label} description={description} />
      <div className="space-y-2">
        {value.map((r, i) => (
          <div
            key={i}
            className="border border-border rounded-md p-3 bg-muted/15 flex items-start gap-2 flex-wrap"
          >
            <div className="min-w-[180px]">
              <label className="block text-[10.5px] text-muted-foreground font-mono mb-0.5">
                slug
              </label>
              <Input
                list={slugSuggestions ? "matrix-entity-suggestions" : undefined}
                value={r.slug}
                onChange={(e) => update(i, { slug: e.target.value })}
                placeholder="entity-slug"
                className="text-sm font-mono"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10.5px] text-muted-foreground font-mono mb-0.5">
                name_ja
              </label>
              <Input
                value={r.name_ja}
                onChange={(e) => update(i, { name_ja: e.target.value })}
                placeholder="日本語名"
                className="text-sm"
              />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className="block text-[10.5px] text-muted-foreground font-mono mb-0.5">
                name_en (任意)
              </label>
              <Input
                value={r.name_en ?? ""}
                onChange={(e) =>
                  update(i, { name_en: e.target.value || undefined })
                }
                placeholder="English name"
                className="text-sm"
              />
            </div>
            <div className="flex items-center gap-1 mt-[18px] shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                disabled={i === 0}
                onClick={() => move(i, -1)}
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                disabled={i === value.length - 1}
                onClick={() => move(i, 1)}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-rose-700 dark:text-rose-300 hover:bg-rose-500/10"
                onClick={() => remove(i)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={add}
          className="w-full text-sm border-dashed"
        >
          <Plus className="h-3.5 w-3.5" />
          エンティティを追加
        </Button>
        {slugSuggestions && (
          <datalist id="matrix-entity-suggestions">
            {slugSuggestions.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        )}
      </div>
    </div>
  );
}

/* ============================================================
 * MarkdownTextareaField — textarea + プレビュー切替
 * ============================================================ */

type MarkdownTextareaFieldProps = BaseFieldProps & {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
};

export function MarkdownTextareaField({
  label,
  description,
  required,
  value,
  onChange,
  placeholder,
  rows = 8,
  className,
}: MarkdownTextareaFieldProps) {
  const [mode, setMode] = React.useState<"edit" | "split" | "preview">("edit");

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div>
          <label className="block text-[12.5px] font-medium text-foreground">
            {label}
            {required && <span className="ml-1 text-rose-500">*</span>}
          </label>
          {description && (
            <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-0.5 p-0.5 rounded-md border border-border bg-muted/30 shrink-0">
          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`px-2 py-0.5 text-[10.5px] font-mono rounded ${
              mode === "edit"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Edit2 className="inline h-3 w-3 mr-0.5" />
            編集
          </button>
          <button
            type="button"
            onClick={() => setMode("split")}
            className={`px-2 py-0.5 text-[10.5px] font-mono rounded ${
              mode === "split"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            分割
          </button>
          <button
            type="button"
            onClick={() => setMode("preview")}
            className={`px-2 py-0.5 text-[10.5px] font-mono rounded ${
              mode === "preview"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="inline h-3 w-3 mr-0.5" />
            プレビュー
          </button>
        </div>
      </div>
      <div
        className={
          mode === "split"
            ? "grid grid-cols-2 gap-3"
            : "block"
        }
      >
        {(mode === "edit" || mode === "split") && (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="text-sm font-mono"
          />
        )}
        {(mode === "preview" || mode === "split") && (
          <div
            className="rounded-md border border-border bg-muted/15 p-3 overflow-y-auto"
            style={{ minHeight: rows * 22 }}
          >
            {value ? (
              <MarkdownContent>{value}</MarkdownContent>
            ) : (
              <p className="text-[12px] text-muted-foreground italic">
                プレビューする内容がありません
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
 * JsonField — 複雑な構造のフォールバック (生 JSON 編集)
 * ============================================================ */

type JsonFieldProps<T> = BaseFieldProps & {
  value: T;
  onChange: (v: T) => void;
  rows?: number;
};

export function JsonField<T>({
  label,
  description,
  value,
  onChange,
  rows = 10,
  className,
}: JsonFieldProps<T>) {
  const [draft, setDraft] = React.useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = React.useState<string | null>(null);

  // value が外部から変わったら draft を再同期
  React.useEffect(() => {
    setDraft(JSON.stringify(value, null, 2));
    setError(null);
  }, [value]);

  const apply = (text: string) => {
    setDraft(text);
    try {
      const parsed = JSON.parse(text) as T;
      setError(null);
      onChange(parsed);
    } catch (e: unknown) {
      setError((e as Error).message);
    }
  };

  return (
    <div className={className}>
      <FieldLabel label={label} description={description} />
      <Textarea
        value={draft}
        onChange={(e) => apply(e.target.value)}
        rows={rows}
        className="text-[12px] font-mono"
      />
      {error && (
        <p className="text-[11px] text-rose-700 dark:text-rose-300 mt-1 font-mono">
          ⚠ JSON parse error: {error}
        </p>
      )}
    </div>
  );
}
