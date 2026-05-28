/**
 * Server Component から呼ばれるデータアクセス層の re-export ハブ.
 *
 * 本ファイル自体には実装を置かず、`src/lib/data/queries/<domain>.ts` に分割した
 * 各ファイルからの `export *` だけを並べる。既存の `import from "@/lib/data/queries"`
 * 経由のアクセスを互換維持する。
 *
 * Supabase が設定済みなら DB を、未設定ならローカルシードを返す方針は各ファイル内で完結。
 * 純粋な DB row → TS 型変換は `mappers.ts` に分離 (テスト容易性のため)。
 */

import "server-only";

export * from "./queries/entities";
export * from "./queries/comparisons";
export * from "./queries/timeline";
export * from "./queries/atlas";
export * from "./queries/case-study-faq";
