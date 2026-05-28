"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldLabel, type BaseFieldProps } from "./field-label";

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
