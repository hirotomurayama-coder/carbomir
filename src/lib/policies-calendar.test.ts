import { describe, expect, it } from "vitest";
import {
  escapeIcs,
  generateIcs,
  parseMilestone,
  parseTimelineForCalendar,
  type IcsEntry,
} from "./policies-calendar";
import type { Entity, TimelineEvent } from "@/lib/types";

const FIXED_NOW = new Date("2026-05-28T00:00:00Z");

describe("parseMilestone", () => {
  const entity = (next_milestone: string, over: Partial<Entity> = {}): Entity => ({
    slug: "demo",
    type: "regulation",
    name_ja: "デモ規制",
    summary: "",
    sections: [],
    related: [],
    related_matrix_slugs: [],
    tags: [],
    last_reviewed_at: "2026-05-28",
    status: "published",
    next_milestone,
    ...over,
  });

  it("returns null when next_milestone is missing", () => {
    expect(parseMilestone(entity("", { next_milestone: undefined }))).toBeNull();
  });

  it("returns null without a colon delimiter", () => {
    expect(parseMilestone(entity("GX 推進法に基づく賦課金 (2028)"))).toBeNull();
  });

  it("returns null when no leading date is present", () => {
    expect(parseMilestone(entity("(運用注視) 訴訟判決の動向"))).toBeNull();
  });

  it("parses ISO year-month", () => {
    const e = parseMilestone(entity("2026-04: 第2フェーズ開始"));
    expect(e?.date_iso).toBe("2026-04-01");
    expect(e?.date_label).toBe("2026-04");
    expect(e?.date_year).toBe(2026);
    expect(e?.content).toBe("第2フェーズ開始");
  });

  it("parses ISO full date", () => {
    const e = parseMilestone(entity("2026-04-15: x"));
    expect(e?.date_iso).toBe("2026-04-15");
    expect(e?.date_label).toBe("2026-04-15");
  });

  it("parses bare year and trailing-dash year", () => {
    expect(parseMilestone(entity("2026: x"))?.date_label).toBe("2026");
    expect(parseMilestone(entity("2026: x"))?.date_iso).toBe("2026-01-01");
    expect(parseMilestone(entity("2026-: x"))?.date_label).toBe("2026");
    expect(parseMilestone(entity("2026-: x"))?.date_iso).toBe("2026-01-01");
  });

  it("parses Japanese 年 / 年度 as year precision", () => {
    expect(parseMilestone(entity("2027 年: x"))?.date_label).toBe("2027");
    expect(parseMilestone(entity("2028 年度: x"))?.date_label).toBe("2028");
    expect(parseMilestone(entity("2028 年度: x"))?.date_year).toBe(2028);
  });

  it("parses Japanese 年 月期 as month precision", () => {
    const e = parseMilestone(entity("2027 年 3 月期: 任意適用開始"));
    expect(e?.date_iso).toBe("2027-03-01");
    expect(e?.date_label).toBe("2027-03");
    expect(e?.content).toBe("任意適用開始");
  });

  it("parses Japanese 年 月 日 as day precision", () => {
    const e = parseMilestone(entity("2027 年 3 月 15 日: x"));
    expect(e?.date_iso).toBe("2027-03-15");
    expect(e?.date_label).toBe("2027-03-15");
  });

  it("takes the start year of a year range (no month misread)", () => {
    expect(parseMilestone(entity("2027-2030: 段階適用"))?.date_year).toBe(2027);
    expect(parseMilestone(entity("2027-2030: 段階適用"))?.date_label).toBe("2027");
    expect(parseMilestone(entity("2024-2025: 移行"))?.date_label).toBe("2024");
  });

  it("splits on the first colon, keeping later colons in content", () => {
    const e = parseMilestone(entity("2026-04: 開始: 有償割当"));
    expect(e?.content).toBe("開始: 有償割当");
  });

  it("accepts a fullwidth colon", () => {
    expect(parseMilestone(entity("2026：本格運用"))?.content).toBe("本格運用");
  });

  it("classifies jurisdiction group from the entity", () => {
    const e = parseMilestone(entity("2026: x", { jurisdiction: "EU" }));
    expect(e?.jurisdiction_group).toBe("EU");
  });
});

describe("escapeIcs", () => {
  it("escapes backslash, semicolon, comma", () => {
    expect(escapeIcs("a;b,c\\d")).toBe("a\\;b\\,c\\\\d");
  });

  it("turns newlines into literal \\n", () => {
    expect(escapeIcs("line1\nline2\r\nline3")).toBe("line1\\nline2\\nline3");
  });

  it("returns plain ASCII unchanged", () => {
    expect(escapeIcs("hello world")).toBe("hello world");
  });
});

describe("parseTimelineForCalendar", () => {
  const baseEvent = (over: Partial<TimelineEvent> = {}): TimelineEvent => ({
    slug: "2027-01-uk-cbam",
    event_date: "2027-01-01",
    title: "英国 CBAM 導入予定",
    summary: "UK CBAM 制度開始",
    affected_entity_slugs: [],
    category: "regulatory",
    importance: 4,
    source_urls: [],
    status: "published",
    ...over,
  });

  it("includes future events", () => {
    const entry = parseTimelineForCalendar(baseEvent(), FIXED_NOW);
    expect(entry).not.toBeNull();
    expect(entry?.date_iso).toBe("2027-01-01");
    expect(entry?.content).toContain("規制・制度");
  });

  it("excludes past events", () => {
    const entry = parseTimelineForCalendar(
      baseEvent({ event_date: "2020-01-01" }),
      FIXED_NOW
    );
    expect(entry).toBeNull();
  });

  it("includes today (days_from_today === 0)", () => {
    const entry = parseTimelineForCalendar(
      baseEvent({ event_date: "2026-05-28" }),
      FIXED_NOW
    );
    expect(entry).not.toBeNull();
    expect(entry?.days_from_today).toBe(0);
  });
});

describe("generateIcs", () => {
  const entry: IcsEntry = {
    slug: "cbam",
    name_ja: "EU CBAM",
    jurisdiction: "EU",
    jurisdiction_group: "EU",
    policy_status: "transition",
    date_label: "2026-01",
    date_sort_key: "2026-01-01",
    date_year: 2026,
    date_iso: "2026-01-01",
    content: "本格運用開始、輸入者の CBAM 証書購入義務化",
    days_from_today: -147,
    ics_source: "policy",
    detail_path: "/entities/cbam",
  };

  it("produces a well-formed VCALENDAR wrapper", () => {
    const ics = generateIcs([entry], { now: FIXED_NOW });
    expect(ics).toMatch(/^BEGIN:VCALENDAR\r\n/);
    expect(ics.trimEnd()).toMatch(/END:VCALENDAR$/);
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("PRODID:-//Carbomir//");
  });

  it("uses CRLF line endings", () => {
    const ics = generateIcs([entry], { now: FIXED_NOW });
    expect(ics.split("\r\n").length).toBeGreaterThan(10);
    // 純粋な LF だけの行は無いはず
    expect(/[^\r]\n/.test(ics)).toBe(false);
  });

  it("emits an all-day VEVENT with VALUE=DATE", () => {
    const ics = generateIcs([entry], { now: FIXED_NOW });
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("DTSTART;VALUE=DATE:20260101");
    expect(ics).toContain("END:VEVENT");
  });

  it("includes detail URL pointing to the configured origin", () => {
    const ics = generateIcs([entry], {
      now: FIXED_NOW,
      origin: "https://example.test/carbomir",
    });
    expect(ics).toContain("URL:https://example.test/carbomir/entities/cbam");
  });

  it("escapes commas/semicolons in SUMMARY and DESCRIPTION", () => {
    const tricky: IcsEntry = {
      ...entry,
      slug: "tricky",
      name_ja: "Test; with, special chars",
      content: "Line A\nLine B",
    };
    const ics = generateIcs([tricky], { now: FIXED_NOW });
    expect(ics).toMatch(/SUMMARY:\[Test\\; with\\, special chars\]/);
    expect(ics).toContain("Line A\\nLine B");
  });

  it("differentiates UIDs by source kind", () => {
    const policyEntry: IcsEntry = { ...entry };
    const timelineEntry: IcsEntry = {
      ...entry,
      ics_source: "timeline",
      detail_path: "/timeline/cbam",
    };
    const ics = generateIcs([policyEntry, timelineEntry], { now: FIXED_NOW });
    expect(ics).toContain("UID:policy-cbam@");
    expect(ics).toContain("UID:timeline-cbam@");
  });
});
