import { describe, expect, it } from "vitest";
import type { GlossaryEntry, GlossaryMap } from "./data/glossary-map";
import { reconcile } from "./glossary-reconcile";

const NOW = "2026-05-29T00:00:00Z";

function entry(over: Partial<GlossaryEntry> = {}): GlossaryEntry {
  return {
    wp_slug: "verra",
    canonical_url: "https://carboncredits.jp/glossary/verra/",
    excerpt: null,
    media_lastmod: null,
    synced_at: null,
    review_state: "unsynced",
    ...over,
  };
}

function mapOf(
  entries: Record<string, GlossaryEntry>,
  unmapped: string[] = [],
): GlossaryMap {
  return { last_synced_at: null, entries, unmapped };
}

describe("reconcile", () => {
  it("初回同期 (prev null) は fresh にし、synced_at/media_lastmod を埋める", () => {
    const map = mapOf({ "verra-vcs": entry({ wp_slug: "verra" }) });
    const r = reconcile(map, [{ wp_slug: "verra", lastmod: "2025-12-08T14:12:06+09:00" }], NOW);

    expect(r.drift).toHaveLength(0);
    expect(r.dangling).toHaveLength(0);
    const e = r.updatedEntries["verra-vcs"];
    expect(e.review_state).toBe("fresh");
    expect(e.media_lastmod).toBe("2025-12-08T14:12:06+09:00");
    expect(e.synced_at).toBe(NOW);
  });

  it("媒体 lastmod が前回値から変化したら drift にする", () => {
    const map = mapOf({
      "gx-ets": entry({
        wp_slug: "gx-ets",
        media_lastmod: "2025-11-01T00:00:00+09:00",
        synced_at: "2025-11-02T00:00:00Z",
        review_state: "fresh",
      }),
    });
    const r = reconcile(map, [{ wp_slug: "gx-ets", lastmod: "2025-12-20T09:00:00+09:00" }], NOW);

    expect(r.drift).toHaveLength(1);
    expect(r.drift[0]).toMatchObject({
      carbomir_slug: "gx-ets",
      wp_slug: "gx-ets",
      media_lastmod: "2025-12-20T09:00:00+09:00",
      prev_media_lastmod: "2025-11-01T00:00:00+09:00",
    });
    expect(r.updatedEntries["gx-ets"].review_state).toBe("drifted");
  });

  it("lastmod 不変なら fresh のまま (drift にしない)", () => {
    const stamp = "2025-12-08T14:12:06+09:00";
    const map = mapOf({
      "verra-vcs": entry({ media_lastmod: stamp, synced_at: "2025-12-09T00:00:00Z", review_state: "fresh" }),
    });
    const r = reconcile(map, [{ wp_slug: "verra", lastmod: stamp }], NOW);

    expect(r.drift).toHaveLength(0);
    expect(r.updatedEntries["verra-vcs"].review_state).toBe("fresh");
  });

  it("既に drifted のものは lastmod 不変でも drift を継続 (人手レビューまで残す)", () => {
    const stamp = "2025-12-08T14:12:06+09:00";
    const map = mapOf({
      "verra-vcs": entry({ media_lastmod: stamp, synced_at: "2025-12-09T00:00:00Z", review_state: "drifted" }),
    });
    const r = reconcile(map, [{ wp_slug: "verra", lastmod: stamp }], NOW);

    expect(r.drift).toHaveLength(1);
    expect(r.updatedEntries["verra-vcs"].review_state).toBe("drifted");
  });

  it("マップ先 wp_slug が sitemap に無ければ dangling", () => {
    const map = mapOf({
      "old-term": entry({ wp_slug: "removed-slug", media_lastmod: "2025-10-01T00:00:00+09:00" }),
    });
    const r = reconcile(map, [{ wp_slug: "verra", lastmod: "2025-12-08T00:00:00+09:00" }], NOW);

    expect(r.dangling).toEqual([{ carbomir_slug: "old-term", wp_slug: "removed-slug" }]);
    const e = r.updatedEntries["old-term"];
    expect(e.review_state).toBe("dangling");
    // media_lastmod は据え置き
    expect(e.media_lastmod).toBe("2025-10-01T00:00:00+09:00");
  });

  it("sitemap_excluded のエントリは sitemap 非掲載でも dangling にしない", () => {
    const map = mapOf({
      "gx-ets": entry({ wp_slug: "gx-ets", sitemap_excluded: true }),
    });
    const r = reconcile(map, [{ wp_slug: "verra", lastmod: "2025-12-08T00:00:00+09:00" }], NOW);
    expect(r.dangling).toHaveLength(0);
    expect(r.updatedEntries["gx-ets"].review_state).toBe("fresh");
  });

  it("sitemap にあり entries にも unmapped にも無い slug は orphan", () => {
    const map = mapOf(
      { "verra-vcs": entry({ wp_slug: "verra" }) },
      ["carbon-leakage"], // unmapped は orphan に含めない
    );
    const r = reconcile(
      map,
      [
        { wp_slug: "verra", lastmod: "2025-12-08T00:00:00+09:00" },
        { wp_slug: "carbon-leakage", lastmod: "2025-12-01T00:00:00+09:00" }, // unmapped → 除外
        { wp_slug: "brand-new-term", lastmod: "2025-12-15T00:00:00+09:00" }, // orphan
      ],
      NOW,
    );

    expect(r.orphan).toEqual([
      { wp_slug: "brand-new-term", lastmod: "2025-12-15T00:00:00+09:00" },
    ]);
  });

  it("hand-authored フィールド (wp_slug / excerpt / canonical_url) を保持する", () => {
    const map = mapOf({
      "verra-vcs": entry({
        wp_slug: "verra",
        excerpt: "VCS は世界最大のボランタリー認証機関。",
        canonical_url: "https://carboncredits.jp/glossary/verra/",
      }),
    });
    const r = reconcile(map, [{ wp_slug: "verra", lastmod: "2025-12-08T00:00:00+09:00" }], NOW);

    const e = r.updatedEntries["verra-vcs"];
    expect(e.excerpt).toBe("VCS は世界最大のボランタリー認証機関。");
    expect(e.wp_slug).toBe("verra");
    expect(e.canonical_url).toBe("https://carboncredits.jp/glossary/verra/");
  });

  it("複数の Carbomir slug が同一 wp_slug を指す場合、両方が同じ lastmod で更新される", () => {
    const map = mapOf({
      verra: entry({ wp_slug: "verra" }),
      "verra-org": entry({ wp_slug: "verra" }),
      "verra-vcs": entry({ wp_slug: "verra" }),
    });
    const r = reconcile(map, [{ wp_slug: "verra", lastmod: "2025-12-08T00:00:00+09:00" }], NOW);

    expect(r.orphan).toHaveLength(0); // verra は mapped 扱い
    for (const slug of ["verra", "verra-org", "verra-vcs"]) {
      expect(r.updatedEntries[slug].media_lastmod).toBe("2025-12-08T00:00:00+09:00");
    }
  });
});
