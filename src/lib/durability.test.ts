import { describe, expect, it } from "vitest";
import {
  parseMilestone,
  selectMatrixInboundTimeline,
  splitTimelineByDate,
  type DurabilityTimelineRef,
} from "./durability";
import type { TimelineEvent } from "./types";

const ev = (slug: string, date: string): DurabilityTimelineRef => ({
  slug,
  title: slug,
  event_date: date,
  category: "regulatory",
});

describe("splitTimelineByDate", () => {
  it("splits into upcoming (>= today, asc) and recent (< today, desc)", () => {
    const events = [
      ev("a", "2026-01-01"),
      ev("b", "2026-12-01"),
      ev("c", "2025-06-01"),
      ev("d", "2026-08-15"),
    ];
    const { upcoming, recent } = splitTimelineByDate(events, "2026-05-28");
    expect(upcoming.map((e) => e.slug)).toEqual(["d", "b"]);
    expect(recent.map((e) => e.slug)).toEqual(["a", "c"]);
  });

  it("treats an event exactly on today as upcoming", () => {
    const { upcoming, recent } = splitTimelineByDate(
      [ev("x", "2026-05-28")],
      "2026-05-28"
    );
    expect(upcoming.map((e) => e.slug)).toEqual(["x"]);
    expect(recent).toEqual([]);
  });

  it("handles empty input", () => {
    expect(splitTimelineByDate([], "2026-05-28")).toEqual({
      upcoming: [],
      recent: [],
    });
  });
});

describe("parseMilestone", () => {
  it("parses YYYY-MM-DD prefixed milestone", () => {
    expect(parseMilestone("2026-04-01: 第2フェーズ開始")).toEqual({
      dateLabel: "2026-04-01",
      content: "第2フェーズ開始",
    });
  });

  it("parses year-only prefix", () => {
    expect(parseMilestone("2027: 義務化")).toEqual({
      dateLabel: "2027",
      content: "義務化",
    });
  });

  it("returns empty dateLabel when no date prefix", () => {
    expect(parseMilestone("VM0048 への移行と CCP 評価結果反映")).toEqual({
      dateLabel: "",
      content: "VM0048 への移行と CCP 評価結果反映",
    });
  });
});

const tlEvent = (
  slug: string,
  date: string,
  affected: string[]
): TimelineEvent => ({
  slug,
  event_date: date,
  title: slug,
  summary: "",
  affected_entity_slugs: affected,
  category: "regulatory",
  importance: 3,
  source_urls: [],
  status: "published",
});

describe("selectMatrixInboundTimeline", () => {
  it("returns events touching any row entity, deduped, date desc", () => {
    const events = [
      tlEvent("a", "2026-01-01", ["verra-vcs"]),
      tlEvent("b", "2025-06-01", ["unrelated"]),
      tlEvent("c", "2026-03-01", ["jcredit", "verra-vcs"]),
      tlEvent("d", "2024-01-01", ["jcredit"]),
    ];
    const out = selectMatrixInboundTimeline(["verra-vcs", "jcredit"], events);
    expect(out.map((e) => e.slug)).toEqual(["c", "a", "d"]);
  });

  it("returns empty when no row entity is touched", () => {
    const events = [tlEvent("a", "2026-01-01", ["x"])];
    expect(selectMatrixInboundTimeline(["y"], events)).toEqual([]);
  });
});
