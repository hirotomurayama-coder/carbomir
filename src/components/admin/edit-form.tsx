/**
 * /admin/edit/* で使う共通フォーム primitives の re-export ハブ.
 *
 * 実装は `src/components/admin/form-fields/<field>.tsx` に分割.
 * 既存の `import from "@/components/admin/edit-form"` 経由のアクセスを互換維持する.
 *
 * 設計:
 *   - Controlled inputs (親が value/onChange を渡す)
 *   - sections のような array-of-objects は SectionsField で動的編集
 *   - 配列 of string (tags, slugs 等) は CsvField で comma 区切り入力
 *   - 複雑なネスト構造 (matrix cells 等) は JsonField で生 JSON 編集にフォールバック
 */

export { FieldLabel, type BaseFieldProps } from "./form-fields/field-label";
export { TextField, TextareaField, CsvField } from "./form-fields/text-fields";
export { MarkdownTextareaField } from "./form-fields/markdown-textarea-field";
export { SectionsField, type Section } from "./form-fields/sections-field";
export { UrlsField, type UrlEntry } from "./form-fields/urls-field";
export {
  RelationsField,
  type RelationEntry,
} from "./form-fields/relations-field";
export {
  DimensionsField,
  type DimensionEntry,
} from "./form-fields/dimensions-field";
export {
  EntityRefsField,
  type EntityRefEntry,
} from "./form-fields/entity-refs-field";
export { JsonField } from "./form-fields/json-field";
