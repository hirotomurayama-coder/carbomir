"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { FieldLabel, type BaseFieldProps } from "./field-label";

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
