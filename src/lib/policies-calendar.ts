import type { Entity, PolicyStatus, TimelineEvent } from "@/lib/types";
import { TIMELINE_CATEGORY_LABEL } from "@/lib/types";

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

/* ============================================================
 * ICS export (RFC 5545)
 *
 * 規制カレンダー + 未来 timeline イベントを統合した .ics を生成する.
 * Pro 機能として課金階層 standard/pro のロジックは Phase 4 で追加.
 * ============================================================ */

/** TimelineEvent を CalendarEntry 形式に変換 (未来日付の場合のみ).  */
export function parseTimelineForCalendar(
  event: TimelineEvent,
  now: Date = new Date()
): CalendarEntry | null {
  const dateIso = event.event_date;
  const target = new Date(`${dateIso}T00:00:00Z`);
  if (Number.isNaN(target.getTime())) return null;
  const daysFromToday = Math.floor(
    (target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  // 未来日付のみカレンダー対象 (過去は /timeline で見れば良い)
  if (daysFromToday < 0) return null;

  return {
    slug: event.slug,
    name_ja: event.title,
    jurisdiction: "",
    jurisdiction_group: "その他",
    policy_status: undefined,
    date_label: dateIso,
    date_sort_key: dateIso,
    date_year: Number(dateIso.slice(0, 4)),
    date_iso: dateIso,
    content:
      event.summary +
      ` [${TIMELINE_CATEGORY_LABEL[event.category]}]`,
    days_from_today: daysFromToday,
  };
}

/**
 * ICS テキスト値のエスケープ (RFC 5545 §3.3.11).
 * バックスラッシュ・セミコロン・カンマを `\` でエスケープし、
 * 改行を `\n` リテラルに変換する.
 */
export function escapeIcs(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n");
}

/** UID 重複を避けるために kind を prefix 化. */
type IcsSource = "policy" | "timeline";

export type IcsEntry = CalendarEntry & {
  ics_source: IcsSource;
  /** 詳細ページの相対パス (例: "/entities/cbam" / "/timeline/2027-01-uk-cbam") */
  detail_path: string;
};

export type IcsGenerateOptions = {
  /** UID ホストドメイン (デフォルト: carbomir.carboncredits.jp). */
  host?: string;
  /** 詳細ページへの絶対 URL を組み立てるためのオリジン (URL フィールド用). */
  origin?: string;
  /** DTSTAMP に使う UTC 時刻 (テスト決定性のため). 既定: now. */
  now?: Date;
};

const DEFAULT_HOST = "carbomir.carboncredits.jp";
const DEFAULT_ORIGIN = "https://carboncredits.jp/carbomir";

function formatIcsDate(iso: string): string {
  // "YYYY-MM-DD" → "YYYYMMDD"
  return iso.replace(/-/g, "");
}

function formatIcsTimestamp(d: Date): string {
  // 例: 2026-05-28T03:14:15.123Z → 20260528T031415Z
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

/**
 * IcsEntry[] を ICS テキスト (RFC 5545) に変換する.
 * すべて終日イベント (VALUE=DATE) として扱う.
 *
 * 行末は CRLF。行折り返し (75 octet line folding) は未実装 —
 * Google Calendar / Outlook / Apple Calendar はすべて折り返さなくても受け入れる
 * (RFC 5545 §3.1 では SHOULD であり MUST ではない)。
 */
export function generateIcs(
  entries: IcsEntry[],
  options: IcsGenerateOptions = {}
): string {
  const host = options.host ?? DEFAULT_HOST;
  const origin = options.origin ?? DEFAULT_ORIGIN;
  const dtstamp = formatIcsTimestamp(options.now ?? new Date());

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Carbomir//Regulation Calendar 1.0//JA",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Carbomir 規制カレンダー",
    "X-WR-CALDESC:カーボンクレジット領域の規制マイルストーンと未来イベント",
    "X-WR-TIMEZONE:Asia/Tokyo",
  ];

  for (const e of entries) {
    const dtstart = formatIcsDate(e.date_iso);
    const url = `${origin}${e.detail_path}`;
    const summary = escapeIcs(
      e.ics_source === "policy"
        ? `[${e.name_ja}] ${e.content}`
        : e.name_ja
    );
    const descriptionLines = [e.content];
    if (e.jurisdiction) descriptionLines.push(`管轄: ${e.jurisdiction}`);
    descriptionLines.push(`Carbomir: ${url}`);
    const description = escapeIcs(descriptionLines.join("\n"));

    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.ics_source}-${e.slug}@${host}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART;VALUE=DATE:${dtstart}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `URL:${url}`,
    );
    if (e.jurisdiction) {
      lines.push(`LOCATION:${escapeIcs(e.jurisdiction)}`);
    }
    lines.push(
      `CATEGORIES:Carbomir,${e.ics_source === "policy" ? "Regulation" : "Timeline"}`,
      "END:VEVENT",
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n") + "\r\n";
}
