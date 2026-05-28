import { describe, expect, it } from "vitest";
import {
  escapeIcs,
  generateIcs,
  parseTimelineForCalendar,
  type IcsEntry,
} from "./policies-calendar";
import type { TimelineEvent } from "@/lib/types";

const FIXED_NOW = new Date("2026-05-28T00:00:00Z");

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
