"use client";

import * as React from "react";
import { Eye, Edit2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { MarkdownContent } from "@/components/markdown-content";
import type { BaseFieldProps } from "./field-label";

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
