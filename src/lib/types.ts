/**
 * ドメイン型の集約 re-export ハブ.
 *
 * 本ファイル自体には型定義を置かず、`src/lib/types/<domain>.ts` に分割した
 * 各ファイルからの `export *` だけを並べる。既存の `import from "@/lib/types"`
 * 経由のアクセスを互換維持する。
 *
 * 新しい型を追加するときは、適切なドメインファイルに置いてから
 * 必要なら下の re-export を追加すること。横断的な共通型は ./types/common.ts へ。
 */

export * from "./types/common";
export * from "./types/entity";
export * from "./types/comparison";
export * from "./types/case-study";
export * from "./types/faq";
export * from "./types/timeline";
export * from "./types/atlas";
export * from "./types/ai-draft";
