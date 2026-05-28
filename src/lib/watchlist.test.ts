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
