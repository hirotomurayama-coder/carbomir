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

// ─────────────────────────────────────────────────────────────
// 変化シグナル (STRATEGY §10): 集約に「何が動いたか」を載せる純粋ロジック。
// 「ここに来れば変化に気づける」を成立させるため、(1) 前回チェック以降に起きた
// イベント、(2) まもなく来るマイルストーン、を判定する。
// last-visit は /watchlist ページ単位で記録する (グローバル provider では更新しない)。
// ─────────────────────────────────────────────────────────────

/** 最後にウォッチリストを開いた日 (YYYY-MM-DD) を保持する localStorage キー */
export const WATCHLIST_LASTVISIT_KEY = "carbomir.watchlist.lastvisit.v1";

/**
 * イベントが「前回チェック以降に起きた」か。
 * lastVisit < event_date <= today のとき true (= 前回見たあとに発生した過去イベント)。
 * 初回訪問 (lastVisit=null) では false にして誤検知を出さない。
 */
export function isNewSinceVisit(
  eventDate: string,
  lastVisit: string | null,
  today: string
): boolean {
  if (!lastVisit) return false;
  return eventDate > lastVisit && eventDate <= today;
}

/**
 * 部分日付ラベル (YYYY / YYYY-MM / YYYY-MM-DD) を YYYY-MM-DD の最早日に正規化。
 * パースできなければ null。
 */
export function normalizeDateLabel(label: string): string | null {
  const m = label.match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/);
  if (!m) return null;
  return `${m[1]}-${m[2] ?? "01"}-${m[3] ?? "01"}`;
}

/**
 * dateLabel (部分日付可) が today から何日後かを返す。過去なら負。パース不能で null。
 */
export function daysUntil(dateLabel: string, today: string): number | null {
  const norm = normalizeDateLabel(dateLabel);
  if (!norm) return null;
  const target = Date.parse(`${norm}T00:00:00Z`);
  const base = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(target) || Number.isNaN(base)) return null;
  return Math.round((target - base) / 86_400_000);
}

/**
 * dateLabel が today から withinDays 日以内の未来 (0..withinDays) なら true。
 * 過去・範囲外・パース不能は false。
 */
export function isImminent(
  dateLabel: string,
  today: string,
  withinDays = 90
): boolean {
  const d = daysUntil(dateLabel, today);
  return d !== null && d >= 0 && d <= withinDays;
}
