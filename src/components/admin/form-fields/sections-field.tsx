"use client";

import { Plus, X, ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldLabel, type BaseFieldProps } from "./field-label";
import { MarkdownTextareaField } from "./markdown-textarea-field";

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
