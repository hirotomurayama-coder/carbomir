"use client";

import { Plus, X, ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldLabel, type BaseFieldProps } from "./field-label";

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
