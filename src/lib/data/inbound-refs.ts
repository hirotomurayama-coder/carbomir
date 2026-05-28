/**
 * entity への cross-type 被参照 (timeline / case-study / faq) を導出する純粋ロジック.
 *
 * server-only な queries 層から切り出し、ユニットテスト可能にしてある。
 * forward フィールド (timeline.affected_entity_slugs / case-study.related_entity_slugs /
 * faq.related_entity_slugs) を slug で逆引きするだけで、各コンテンツに逆方向の slug を
 * 手で持たせる必要がない (entity↔entity の Referenced By と同型の自動導出)。
 */

import type {
  CaseStudy,
  FaqCategory,
  FAQItem,
  TimelineCategory,
  TimelineEvent,
} from "@/lib/types";

export type EntityInboundReferences = {
  timeline: {
    slug: string;
    title: string;
    event_date: string;
    category: TimelineCategory;
  }[];
  caseStudies: { slug: string; title: string; company: string }[];
  faqs: { slug: string; question: string; category: FaqCategory }[];
};

/**
 * 指定 slug の entity を参照しているコンテンツを集約する。
 * timeline は event_date 降順 (新しい順)。入力は published 済みのもの想定。
 */
export function selectEntityInboundReferences(
  slug: string,
  events: TimelineEvent[],
  studies: CaseStudy[],
  faqs: FAQItem[]
): EntityInboundReferences {
  return {
    timeline: events
      .filter((e) => e.affected_entity_slugs.includes(slug))
      .slice()
      .sort((a, b) => b.event_date.localeCompare(a.event_date))
      .map((e) => ({
        slug: e.slug,
        title: e.title,
        event_date: e.event_date,
        category: e.category,
      })),
    caseStudies: studies
      .filter((c) => c.related_entity_slugs.includes(slug))
      .map((c) => ({ slug: c.slug, title: c.title, company: c.company })),
    faqs: faqs
      .filter((f) => f.related_entity_slugs.includes(slug))
      .map((f) => ({ slug: f.slug, question: f.question, category: f.category })),
  };
}
