import { describe, expect, it } from "vitest";
import { parseSitemap } from "./glossary-sitemap";

const SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://carboncredits.jp/glossary/mrv/</loc>
    <lastmod>2025-12-08T14:56:48+09:00</lastmod>
  </url>
  <url>
    <loc>https://carboncredits.jp/glossary/voluntary-carbon-credits/</loc>
    <lastmod>2025-12-08T19:16:46+09:00</lastmod>
  </url>
</urlset>`;

describe("parseSitemap", () => {
  it("loc から wp_slug を、lastmod を抽出する", () => {
    const r = parseSitemap(SAMPLE);
    expect(r).toEqual([
      { wp_slug: "mrv", lastmod: "2025-12-08T14:56:48+09:00" },
      { wp_slug: "voluntary-carbon-credits", lastmod: "2025-12-08T19:16:46+09:00" },
    ]);
  });

  it("lastmod が無い <url> はスキップする", () => {
    const xml = `<urlset><url><loc>https://carboncredits.jp/glossary/no-date/</loc></url></urlset>`;
    expect(parseSitemap(xml)).toEqual([]);
  });

  it("/glossary/ 形でない loc は無視する", () => {
    const xml = `<urlset><url><loc>https://carboncredits.jp/posts/something/</loc><lastmod>2025-12-08T00:00:00+09:00</lastmod></url></urlset>`;
    expect(parseSitemap(xml)).toEqual([]);
  });

  it("空文字は空配列", () => {
    expect(parseSitemap("")).toEqual([]);
  });
});
