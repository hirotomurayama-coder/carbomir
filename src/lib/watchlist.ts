/**
 * ウォッチリスト (STRATEGY §10) — ポートフォリオの胚 / 需要テスト.
 *
 * ユーザーが「自分に関係する規制・手法・レジストリ・比較」をフォローし、変化を
 * 集約して見る。認証前の段階なので localStorage に保持する (バックエンド不要の
 * 需要テスト)。将来フォロー対象を「保有クレジット」に差し替えれば Manage 層になる。
 *
 * ここは localStorage のシリアライズ/パースの純粋ロジックのみ (UI 非依存・テスト可能)。
 * React 連携は components/watchlist/watchlist-provider.tsx。
 */

export type WatchKind = "entity" | "matrix";

export type WatchItem = {
  kind: WatchKind;
  slug: string;
  /** 表示名 (entity.name_ja / matrix.title)。追加時にスナップショットして保持 */
  label: string;
};

export const WATCHLIST_STORAGE_KEY = "carbomir.watchlist.v1";

function isWatchItem(x: unknown): x is WatchItem {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    (o.kind === "entity" || o.kind === "matrix") &&
    typeof o.slug === "string" &&
    typeof o.label === "string"
  );
}

/** localStorage の生文字列を WatchItem[] に。壊れていれば空配列 (防御的)。 */
export function parseWatchlist(raw: string | null): WatchItem[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(isWatchItem);
  } catch {
    return [];
  }
}

export function isSameWatchItem(
  a: { kind: WatchKind; slug: string },
  b: { kind: WatchKind; slug: string }
): boolean {
  return a.kind === b.kind && a.slug === b.slug;
}
