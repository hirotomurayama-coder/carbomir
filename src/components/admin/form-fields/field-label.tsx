"use client";

/**
 * /admin/edit/* フォーム primitives 共通のラベル + ベース props.
 */

export type BaseFieldProps = {
  label: string;
  required?: boolean;
  description?: string;
  className?: string;
};

export function FieldLabel({
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
