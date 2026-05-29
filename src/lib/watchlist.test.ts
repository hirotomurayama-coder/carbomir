import { describe, expect, it } from "vitest";
import { isSameWatchItem, parseWatchlist } from "./watchlist";

describe("parseWatchlist", () => {
  it("returns [] for null / empty", () => {
    expect(parseWatchlist(null)).toEqual([]);
    expect(parseWatchlist("")).toEqual([]);
  });

  it("returns [] for invalid JSON", () => {
    expect(parseWatchlist("{not json")).toEqual([]);
  });

  it("returns [] for non-array JSON", () => {
    expect(parseWatchlist('{"kind":"entity"}')).toEqual([]);
  });

  it("keeps valid items and drops malformed ones", () => {
    const raw = JSON.stringify([
      { kind: "entity", slug: "redd-plus", label: "REDD+" },
      { kind: "matrix", slug: "credit-eligibility", label: "適格性" },
      { kind: "bogus", slug: "x", label: "y" },
      { kind: "entity", slug: 123, label: "no" },
      { slug: "missing-kind", label: "no" },
      "string-item",
    ]);
    expect(parseWatchlist(raw)).toEqual([
      { kind: "entity", slug: "redd-plus", label: "REDD+" },
      { kind: "matrix", slug: "credit-eligibility", label: "適格性" },
    ]);
  });
});

describe("isSameWatchItem", () => {
  it("matches on kind + slug", () => {
    expect(
      isSameWatchItem(
        { kind: "entity", slug: "a" },
        { kind: "entity", slug: "a" }
      )
    ).toBe(true);
  });
  it("differs when kind differs", () => {
    expect(
      isSameWatchItem(
        { kind: "entity", slug: "a" },
        { kind: "matrix", slug: "a" }
      )
    ).toBe(false);
  });
});

describe("isNewSinceVisit", () => {
  const today = "2026-05-29";
  it("初回訪問 (lastVisit=null) は常に false", () => {
    expect(isNewSinceVisit("2026-05-20", null, today)).toBe(false);
  });
  it("前回チェック後〜today に起きたら true", () => {
    expect(isNewSinceVisit("2026-05-20", "2026-05-10", today)).toBe(true);
    expect(isNewSinceVisit("2026-05-29", "2026-05-10", today)).toBe(true); // today 当日も含む
  });
  it("前回チェック以前のイベントは false", () => {
    expect(isNewSinceVisit("2026-05-05", "2026-05-10", today)).toBe(false);
    expect(isNewSinceVisit("2026-05-10", "2026-05-10", today)).toBe(false); // 境界は排他
  });
  it("未来イベント (today 超) は false", () => {
    expect(isNewSinceVisit("2026-06-01", "2026-05-10", today)).toBe(false);
  });
});

describe("normalizeDateLabel", () => {
  it("YYYY / YYYY-MM / YYYY-MM-DD を最早日に正規化", () => {
    expect(normalizeDateLabel("2026")).toBe("2026-01-01");
    expect(normalizeDateLabel("2026-04")).toBe("2026-04-01");
    expect(normalizeDateLabel("2026-04-15")).toBe("2026-04-15");
  });
  it("不正な文字列は null", () => {
    expect(normalizeDateLabel("近日中")).toBeNull();
    expect(normalizeDateLabel("")).toBeNull();
  });
});

describe("daysUntil", () => {
  const today = "2026-05-29";
  it("未来は正、過去は負", () => {
    expect(daysUntil("2026-05-30", today)).toBe(1);
    expect(daysUntil("2026-05-29", today)).toBe(0);
    expect(daysUntil("2026-05-28", today)).toBe(-1);
  });
  it("部分日付も正規化して計算", () => {
    expect(daysUntil("2026-06", today)).toBe(3); // 2026-06-01
  });
  it("パース不能は null", () => {
    expect(daysUntil("未定", today)).toBeNull();
  });
});

describe("isImminent", () => {
  const today = "2026-05-29";
  it("withinDays 以内の未来は true", () => {
    expect(isImminent("2026-06-01", today, 90)).toBe(true);
    expect(isImminent("2026-05-29", today, 90)).toBe(true); // 当日
  });
  it("範囲外の未来・過去は false", () => {
    expect(isImminent("2026-12-31", today, 90)).toBe(false);
    expect(isImminent("2026-05-28", today, 90)).toBe(false); // 過去
  });
  it("パース不能は false", () => {
    expect(isImminent("近日", today)).toBe(false);
  });
});
