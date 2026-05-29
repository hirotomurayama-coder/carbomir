import { describe, it, expect } from "vitest";
import {
  normalizePriceAsOf,
  priceFreshness,
  PRICE_STALE_MONTHS,
} from "./price-level";

describe("normalizePriceAsOf", () => {
  it("YYYY / YYYY-MM / YYYY-MM-DD を最早日に正規化", () => {
    expect(normalizePriceAsOf("2025")).toBe("2025-01-01");
    expect(normalizePriceAsOf("2025-04")).toBe("2025-04-01");
    expect(normalizePriceAsOf("2025-04-15")).toBe("2025-04-15");
  });
  it("前後空白を許容", () => {
    expect(normalizePriceAsOf(" 2025 ")).toBe("2025-01-01");
  });
  it("不正は null", () => {
    expect(normalizePriceAsOf("近年")).toBeNull();
    expect(normalizePriceAsOf("")).toBeNull();
  });
});

describe("priceFreshness", () => {
  const today = "2026-05-29";

  it("年粒度 as_of は年初基準 (2025 → 16ヶ月・約1年前・stale)", () => {
    const f = priceFreshness("2025", today);
    expect(f.months).toBe(16); // 2025-01 → 2026-05
    expect(f.stale).toBe(true);
    expect(f.relative).toBe("約1年前");
  });

  it("しきい値ちょうど (12ヶ月) は stale", () => {
    const f = priceFreshness("2025-05", today);
    expect(f.months).toBe(12);
    expect(f.stale).toBe(true);
  });

  it("しきい値未満は stale でない", () => {
    const f = priceFreshness("2025-12", today); // 5ヶ月前
    expect(f.months).toBe(5);
    expect(f.stale).toBe(false);
    expect(f.relative).toBe("約5ヶ月前");
  });

  it("同月・未来は『今月時点』で stale でない", () => {
    expect(priceFreshness("2026-05", today).relative).toBe("今月時点");
    expect(priceFreshness("2026-08", today).relative).toBe("今月時点");
    expect(priceFreshness("2026-05", today).stale).toBe(false);
  });

  it("2年前相当は『約2年前』に丸める", () => {
    expect(priceFreshness("2024-05", today).relative).toBe("約2年前"); // 24ヶ月
  });

  it("パース不能は中立 (stale=false, relative=null)", () => {
    const f = priceFreshness("不明", today);
    expect(f.months).toBeNull();
    expect(f.stale).toBe(false);
    expect(f.relative).toBeNull();
  });

  it("PRICE_STALE_MONTHS は 12", () => {
    expect(PRICE_STALE_MONTHS).toBe(12);
  });
});
