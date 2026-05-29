import { describe, expect, it } from "vitest";
import { splitEditorialThesis, buildThesisTagline } from "./editorial-thesis";

describe("splitEditorialThesis", () => {
  it("returns whole text as before when no thesis heading", () => {
    const md = "## 概要\n\n本文だけ。";
    expect(splitEditorialThesis(md)).toEqual({
      before: md,
      thesis: null,
      after: "",
    });
  });

  it("handles empty / nullish input", () => {
    expect(splitEditorialThesis("")).toEqual({ before: "", thesis: null, after: "" });
    expect(splitEditorialThesis(undefined)).toEqual({ before: "", thesis: null, after: "" });
    expect(splitEditorialThesis(null)).toEqual({ before: "", thesis: null, after: "" });
  });

  it("splits before / thesis / after with a following h2", () => {
    const md = [
      "## 制度の概要",
      "",
      "概要本文。",
      "",
      "## 編集部の論点",
      "",
      "論点本文 (確信度 強)。",
      "",
      "## 関連動向",
      "",
      "- [foo](/timeline/foo)",
    ].join("\n");
    const r = splitEditorialThesis(md);
    expect(r.before).toBe("## 制度の概要\n\n概要本文。");
    expect(r.thesis).toBe("論点本文 (確信度 強)。");
    expect(r.after).toBe("## 関連動向\n\n- [foo](/timeline/foo)");
  });

  it("treats thesis as last section when no following h2", () => {
    const md = "## 概要\n\n概要。\n\n## 編集部の論点\n\n論点本文。";
    const r = splitEditorialThesis(md);
    expect(r.before).toBe("## 概要\n\n概要。");
    expect(r.thesis).toBe("論点本文。");
    expect(r.after).toBe("");
  });

  it("does not split on ### sub-headings inside the thesis", () => {
    const md = "## 編集部の論点\n\n本文。\n\n### 補足\n\n細目。";
    const r = splitEditorialThesis(md);
    expect(r.thesis).toBe("本文。\n\n### 補足\n\n細目。");
    expect(r.after).toBe("");
  });
});

describe("buildThesisTagline", () => {
  const BASE = "Carbomir 編集部による解釈";

  it("確信度も出典も無ければ base のみ", () => {
    expect(buildThesisTagline("ただの論点本文。", 0)).toBe(BASE);
  });

  it("確信度のみなら『確信度つき』", () => {
    expect(buildThesisTagline("これは重要 (確信度 強)。", 0)).toBe(
      `${BASE} — 確信度つき`
    );
  });

  it("出典のみなら『出典つき』", () => {
    expect(buildThesisTagline("出典つきだが確信度マークなし。", 2)).toBe(
      `${BASE} — 出典つき`
    );
  });

  it("両方あれば『出典と確信度つき』(出典が先)", () => {
    expect(buildThesisTagline("根拠 (確信度 中) あり。", 1)).toBe(
      `${BASE} — 出典と確信度つき`
    );
  });

  it("確信度 中/弱 でも検出する", () => {
    expect(buildThesisTagline("(確信度 弱)", 0)).toBe(`${BASE} — 確信度つき`);
    expect(buildThesisTagline("確信度　中 (全角空白)", 0)).toBe(
      `${BASE} — 確信度つき`
    );
  });

  it("本文が null/undefined でも安全", () => {
    expect(buildThesisTagline(null, 0)).toBe(BASE);
    expect(buildThesisTagline(undefined, 3)).toBe(`${BASE} — 出典つき`);
  });
});
