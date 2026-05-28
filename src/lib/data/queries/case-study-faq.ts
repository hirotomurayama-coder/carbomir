import "server-only";

import {
  findCaseStudyBySlug as seedFindCaseStudyBySlug,
  listPublishedCaseStudies as seedListPublishedCaseStudies,
} from "@/lib/data/case-studies";
import {
  findFaqBySlug as seedFindFaqBySlug,
  listPublishedFaqs as seedListPublishedFaqs,
} from "@/lib/data/faqs";

export async function listPublishedCaseStudies() {
  return seedListPublishedCaseStudies();
}

export async function findCaseStudyBySlug(slug: string) {
  return seedFindCaseStudyBySlug(slug);
}

export async function listPublishedFaqs() {
  return seedListPublishedFaqs();
}

export async function findFaqBySlug(slug: string) {
  return seedFindFaqBySlug(slug);
}
