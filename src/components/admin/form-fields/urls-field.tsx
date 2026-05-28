"use client";

import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldLabel, type BaseFieldProps } from "./field-label";

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
