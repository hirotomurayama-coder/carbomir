"use client";

import { Plus, X, ChevronUp, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldLabel, type BaseFieldProps } from "./field-label";

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
