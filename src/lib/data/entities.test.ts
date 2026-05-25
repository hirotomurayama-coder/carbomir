import { describe, expect, it } from "vitest";
import {
  listInboundRelations,
  listPublishedEntities,
} from "./entities";

describe("listInboundRelations", () => {
  it("returns empty for non-existent slug", () => {
    expect(listInboundRelations("nonexistent-slug-xyz")).toEqual([]);
  });

  it("does not include self-references", () => {
    const all = listInboundRelations("verra-vcs");
    expect(all.every((r) => r.from_slug !== "verra-vcs")).toBe(true);
  });

  it("collects inbound references to verra-vcs from multiple entities", () => {
    const inbound = listInboundRelations("verra-vcs");
    const fromSlugs = inbound.map((r) => r.from_slug).sort();
    // jcredit / jcm / gold-standard / plan-vivo / redd-plus / icvcm-ccp / dac
    // のうち少なくとも数件は verra-vcs を参照しているはず
    expect(fromSlugs.length).toBeGreaterThanOrEqual(5);
    expect(fromSlugs).toContain("jcredit");
    expect(fromSlugs).toContain("jcm");
    expect(fromSlugs).toContain("gold-standard");
  });

  it("collects inbound references to gx-ets from jcredit/jcm", () => {
    const inbound = listInboundRelations("gx-ets");
    const fromSlugs = inbound.map((r) => r.from_slug).sort();
    expect(fromSlugs).toContain("jcredit");
    expect(fromSlugs).toContain("jcm");
  });

  it("only includes published entities", () => {
    const all = listPublishedEntities();
    for (const e of all) {
      const inbound = listInboundRelations(e.slug);
      // すべての inbound source は published のはず
      const fromSlugs = new Set(inbound.map((r) => r.from_slug));
      const publishedSlugs = new Set(all.map((x) => x.slug));
      for (const s of fromSlugs) {
        expect(publishedSlugs.has(s)).toBe(true);
      }
    }
  });
});
