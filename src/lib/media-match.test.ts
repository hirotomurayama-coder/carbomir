import { describe, expect, it } from "vitest";
import type { MediaArticle } from "./media-match";
import { matchArticles, mediaMatchTerms } from "./media-match";

function art(id: number, title: string, modified: string): MediaArticle {
  return { id, title, link: `https://carboncredits.jp/x/${id}/`, modified };
}

describe("mediaMatchTerms", () => {
  it("name_ja/name_en/abbreviation/company + slug 別名を集め、2 文字未満と重複を除く", () => {
    const terms = mediaMatchTerms({
      slug: "microsoft",
      name_ja: "Microsoft",
      name_en: "Microsoft Corporation",
      abbreviation: "MS",
    });
    expect(terms).toContain("Microsoft");
    expect(terms).toContain("Microsoft Corporation");
    expect(terms).toContain("MS");
    expect(terms).toContain("マイクロソフト"); // ALIASES
  });

  it("重複 (大文字小文字違い) は 1 つに", () => {
    const terms = mediaMatchTerms({ slug: "x", name_ja: "Frontier", name_en: "frontier" });
    expect(terms.filter((t) => t.toLowerCase() === "frontier")).toHaveLength(1);
  });
});

describe("matchArticles", () => {
  const corpus = [
    art(1, "マイクロソフトがBECCS由来の除去クレジット契約", "2026-05-25T00:00:00"),
    art(2, "Salesforceが1.2万トンのカーボンクレジットを購入", "2026-01-13T00:00:00"),
    art(3, "クレカ決済サイト「cdr-shops.com」始動", "2025-09-17T00:00:00"),
    art(4, "EU-ETS・UK-ETS で投機筋が両建て", "2026-05-28T00:00:00"),
    art(5, "K-ETS第4期が始動", "2026-01-15T00:00:00"),
  ];

  it("日本語語は部分一致する", () => {
    const r = matchArticles(["マイクロソフト"], corpus);
    expect(r.map((a) => a.id)).toEqual([1]);
  });

  it('英字語 "SHOP" は "shops" に一致しない (単語境界)', () => {
    expect(matchArticles(["SHOP"], corpus)).toHaveLength(0);
  });

  it('"K-ETS" は "UK-ETS" に一致しない (単語境界)', () => {
    const r = matchArticles(["K-ETS"], corpus);
    expect(r.map((a) => a.id)).toEqual([5]);
  });

  it("英字語は大文字小文字を無視して単語として一致", () => {
    expect(matchArticles(["salesforce"], corpus).map((a) => a.id)).toEqual([2]);
  });

  it("modified 降順で返し、limit で切る", () => {
    const r = matchArticles(["ETS", "マイクロソフト", "salesforce"], corpus, 2);
    expect(r).toHaveLength(2);
    expect(r[0].modified >= r[1].modified).toBe(true);
  });

  it("2 文字未満の語は無視", () => {
    expect(matchArticles(["X"], corpus)).toHaveLength(0);
  });
});
