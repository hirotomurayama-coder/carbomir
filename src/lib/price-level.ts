/**
 * 価格水準 (相場観) の鮮度判定 — 純粋ロジック (STRATEGY §8).
 *
 * price_level は live feed ではなく「編集部が出典つきで置く相場観」。as_of (時点)
 * からの経過で古さを判定し、一定以上古ければ更新を促す。鮮度シグナル全般
 * (next_review_at 等) と同じ規律を価格にも与える。
 *
 * 年粒度 (例 "2025") の as_of は最早日 (年初) 基準で経過を測る = 古さを過小評価
 * せず更新の取りこぼしを防ぐ。UI 非依存の純粋関数。表示は price-level-panel.tsx。
 */

/** 相場観が「古い」とみなす経過月数のしきい値 */
export const PRICE_STALE_MONTHS = 12;

/** 部分日付 (YYYY / YYYY-MM / YYYY-MM-DD) を最早日 YYYY-MM-DD に正規化。不正は null。 */
export function normalizePriceAsOf(asOf: string): string | null {
  const m = asOf.trim().match(/^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/);
  if (!m) return null;
  return `${m[1]}-${m[2] ?? "01"}-${m[3] ?? "01"}`;
}

export type PriceFreshness = {
  /** as_of から today までの概算経過月数。パース不能なら null */
  months: number | null;
  /** しきい値を超えて古いか */
  stale: boolean;
  /** 相対表示 (例: "約1年前", "約5ヶ月前", "今月時点")。パース不能なら null */
  relative: string | null;
};

/**
 * as_of (時点) と today (YYYY-MM-DD) から鮮度を算出。
 * 経過月数 = 年差*12 + 月差 (おおまかな桁感)。
 */
export function priceFreshness(asOf: string, today: string): PriceFreshness {
  const norm = normalizePriceAsOf(asOf);
  const t = today.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!norm || !t) return { months: null, stale: false, relative: null };

  const [ay, am] = norm.split("-").map(Number);
  const ty = Number(t[1]);
  const tm = Number(t[2]);
  const months = (ty - ay) * 12 + (tm - am);

  let relative: string;
  if (months <= 0) relative = "今月時点";
  else if (months < 12) relative = `約${months}ヶ月前`;
  else relative = `約${Math.round(months / 12)}年前`;

  return { months, stale: months >= PRICE_STALE_MONTHS, relative };
}
