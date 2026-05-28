import { describe, expect, it } from "vitest";
import type { CaseStudy, FAQItem, TimelineEvent } from "@/lib/types";
import { selectEntityInboundReferences } from "./inbound-refs";

// 純粋セレクタが読むフィールドのみ満たす最小 fixture (残りは型を満たすための cast)。
const ev = (
  slug: string,
  event_date: string,
  affected: string[]
): TimelineEvent =>
  ({
    slug,
    event_date,
    title: `event-${slug}`,
    summary: "",
    affected_entity_slugs: affected,
    category: "regulatory",
    importance: 3,
    source_urls: [],
    status: "published",
  }) as TimelineEvent;

const cs = (slug: string, related: string[]): CaseStudy =>
  ({
    slug,
    title: `case-${slug}`,
    company: `company-${slug}`,
    related_entity_slugs: related,
    status: "published",
  }) as CaseStudy;

const faq = (slug: string, related: string[]): FAQItem =>
  ({
    slug,
    question: `q-${slug}`,
    category: "quality",
    related_entity_slugs: related,
    status: "published",
  }) as FAQItem;

describe("selectEntityInboundReferences", () => {
  const events = [
    ev("2024-01-a", "2024-01-01", ["eu-ets", "corsia"]),
    ev("2022-04-b", "2022-04-12", ["eu-ets"]),
    ev("2026-01-c", "2026-01-01", ["eu-ets"]),
    ev("2020-01-d", "2020-01-01", ["biochar"]),
  ];
  const studies = [
    cs("nyk", ["eu-ets", "corsia"]),
    cs("apple", ["biochar"]),
  ];
  const faqs = [
    faq("article-6", ["corsia"]),
    faq("removal-q", ["biochar", "eu-ets"]),
  ];

  it("collects timeline events that reference the entity, newest first", () => {
    const r = selectEntityInboundReferences("eu-ets", events, studies, faqs);
    expect(r.timeline.map((t) => t.slug)).toEqual([
      "2026-01-c",
      "2024-01-a",
      "2022-04-b",
    ]);
    // returned shape is the trimmed projection, not the full event
    expect(r.timeline[0]).toEqual({
      slug: "2026-01-c",
      title: "event-2026-01-c",
      event_date: "2026-01-01",
      category: "regulatory",
    });
  });

  it("collects case studies and faqs that reference the entity", () => {
    const r = selectEntityInboundReferences("eu-ets", events, studies, faqs);
    expect(r.caseStudies.map((c) => c.slug)).toEqual(["nyk"]);
    expect(r.caseStudies[0]).toEqual({
      slug: "nyk",
      title: "case-nyk",
      company: "company-nyk",
    });
    expect(r.faqs.map((f) => f.slug)).toEqual(["removal-q"]);
    expect(r.faqs[0]).toEqual({
      slug: "removal-q",
      question: "q-removal-q",
      category: "quality",
    });
  });

  it("returns empty arrays for an entity that nothing references", () => {
    const r = selectEntityInboundReferences("nonexistent", events, studies, faqs);
    expect(r).toEqual({ timeline: [], caseStudies: [], faqs: [] });
  });

  it("does not mutate the input arrays when sorting timeline", () => {
    const input = [
      ev("old", "2019-01-01", ["x"]),
      ev("new", "2025-01-01", ["x"]),
    ];
    const snapshot = input.map((e) => e.slug);
    selectEntityInboundReferences("x", input, [], []);
    expect(input.map((e) => e.slug)).toEqual(snapshot);
  });
});
