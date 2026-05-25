import { describe, expect, it } from "vitest";
import { countReviewMarks } from "./review-marks";

describe("countReviewMarks", () => {
  it("returns 0 for empty / null-equivalent strings", () => {
    expect(countReviewMarks("")).toBe(0);
    expect(countReviewMarks("普通の本文")).toBe(0);
  });

  it("counts a single review mark", () => {
    expect(countReviewMarks("価格は 10 USD/t (要確認: 直近実勢)")).toBe(1);
  });

  it("counts multiple marks in one string", () => {
    expect(
      countReviewMarks(
        "前段 (要確認: 出典) 中段 (要確認) 後段 (要確認: 別件)"
      )
    ).toBe(3);
  });

  it("does not match plain (parens) without 要確認", () => {
    expect(countReviewMarks("J-クレジット (国認証) 制度")).toBe(0);
  });

  it("matches (要確認) without colon", () => {
    expect(countReviewMarks("最終値は不確定 (要確認)。")).toBe(1);
  });

  it("matches when 要確認 appears mid-parenthetical", () => {
    expect(
      countReviewMarks("180 USD/t (180 USD/t、要確認: 制度詳細・最新値) が...")
    ).toBe(1);
    expect(countReviewMarks("(2026年4月- 予定、要確認)")).toBe(1);
  });

  it("skips matches with nested parens (intentional simplification)", () => {
    // 仕様: 括弧内に括弧 ( ) が含まれる場合はマッチさせない。
    // 編集側で `(要確認: ...)` 内に追加括弧を入れない運用ルールで担保する。
    expect(countReviewMarks("複合表記 (要確認: (詳細))")).toBe(0);
  });
});
