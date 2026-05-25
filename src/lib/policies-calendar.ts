import type { Entity, PolicyStatus } from "@/lib/types";

/**
 * 規制カレンダーで使う型 + マイルストーンのパース.
 * page (server) と CalendarExplorer (client) の両方から参照.
 */

export type JurisdictionGroup =
  | "日本"
  | "EU"
  | "米国"
  | "国際"
  | "アジア (日本以外)"
  | "その他";

export type CalendarEntry = {
  slug: string;
  name_ja: string;
  jurisdiction: string;
  jurisdiction_group: JurisdictionGroup;
  policy_status?: PolicyStatus;
  date_label: string; // 表示用 "2026" or "2026-04" or "2026-04-01"
  date_sort_key: string; // ISO "YYYY-MM-DD"
  date_year: number;
  date_iso: string;
  content: string; // ": " 以降の本文
  days_from_today: number;
};

export function classifyJurisdiction(
  jur: string | undefined
): JurisdictionGroup {
  if (!jur) return "その他";
  if (jur.includes("日本") && !jur.includes("二国間")) return "日本";
  if (jur.startsWith("EU")) return "EU";
  if (jur.includes("米国")) return "米国";
  if (jur.includes("韓国") || jur.includes("中国")) return "アジア (日本以外)";
  if (
    jur.startsWith("国際") ||
    jur.includes("UNFCCC") ||
    jur.includes("民間") ||
    jur.includes("二国間")
  )
    return "国際";
  return "その他";
}

/**
 * "2026-04: 第2フェーズ開始" のような文字列をパース.
 * 日付プレフィックスが取れなければ null.
 */
export function parseMilestone(entity: Entity): CalendarEntry | null {
  const raw = entity.next_milestone?.trim();
  if (!raw) return null;
  const m = raw.match(/^(\d{4})(-\d{2})?(-\d{2})?-?\s*[::]\s*([\s\S]+)$/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = m[2] ? Number(m[2].slice(1)) : 1;
  const day = m[3] ? Number(m[3].slice(1)) : 1;
  const dateIso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const dateLabel = m[2]
    ? m[3]
      ? `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
      : `${year}-${String(month).padStart(2, "0")}`
    : `${year}`;
  const today = new Date();
  const target = new Date(dateIso);
  const daysFromToday = Math.floor(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return {
    slug: entity.slug,
    name_ja: entity.name_ja,
    jurisdiction: entity.jurisdiction ?? "",
    jurisdiction_group: classifyJurisdiction(entity.jurisdiction),
    policy_status: entity.policy_status,
    date_label: dateLabel,
    date_sort_key: dateIso,
    date_year: year,
    date_iso: dateIso,
    content: m[4].trim(),
    days_from_today: daysFromToday,
  };
}
