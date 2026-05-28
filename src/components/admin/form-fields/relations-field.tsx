"use client";

import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { RelationType } from "@/lib/types";
import { RELATION_LABEL } from "@/lib/types";
import { FieldLabel, type BaseFieldProps } from "./field-label";

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
