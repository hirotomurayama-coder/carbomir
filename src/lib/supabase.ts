import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase クライアントは環境変数が揃っている場合のみ生成する。
 * 未設定時は null を返し、呼び出し側でローカルシードデータへ fallback する設計。
 * これにより Supabase プロジェクト未作成の段階でも UI のプロトタイピングが可能。
 *
 * NOTE: createClient に Database 型を渡すと、PostgREST の nested select 構文
 * (例: `target:entities!to_entity_id(slug)`) で結果が `never` に潰れる
 * supabase-js 側の既知の挙動があるため、現状は untyped で運用し、
 * row 変換は mappers.ts の手書きキャストで担保している。
 * 将来 `supabase gen types` で Relationships 込みの型を生成したら
 * 再度 createClient<Database>() に切り替える。
 */
let cachedClient: SupabaseClient | null | undefined;

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient !== undefined) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    cachedClient = null;
    return null;
  }

  cachedClient = createClient(url, key);
  return cachedClient;
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseClient() !== null;
}
