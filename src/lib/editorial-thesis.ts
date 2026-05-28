/**
 * 「編集部の論点」ブロックを本文 markdown から分離する純粋関数.
 *
 * timeline イベントは content_md という 1 本の markdown に
 *   ## 制度の概要 ... / ## 編集部の論点 ... / ## 関連動向 ...
 * のように論点を「ただの h2 見出し」として埋め込んでいる。
 *
 * STRATEGY §2: 「編集部の論点」はプロダクトの心臓。流れに埋もれさせず
 * 専用 call-out (EditorialThesis) で描き分けるため、レンダ時に
 *   before (論点より前) / thesis (論点本文) / after (論点の次の見出し以降)
 * の 3 つに分割する。データ移行はしない (既存 JSON はそのまま)。
 *
 * entity / case-study は sections[] 構造で heading === "編集部の論点" の
 * セクションを直接検出できるため、この関数は不要 (timeline 専用)。
 */

const THESIS_HEADING_RE = /^##[ \t]+編集部の論点[ \t]*$/m;
// 次の h2 (## ) 見出し。### 以降の小見出しは whitespace 要件で除外される
const NEXT_H2_RE = /^##[ \t]+/m;

export type ThesisSplit = {
  /** 論点見出しより前の本文 (論点が無ければ全文) */
  before: string;
  /** 論点本文 (見出し行を除く)。論点見出しが無ければ null */
  thesis: string | null;
  /** 論点の次の h2 見出し以降の本文 (無ければ "") */
  after: string;
};

export function splitEditorialThesis(md: string | undefined | null): ThesisSplit {
  if (!md) return { before: md ?? "", thesis: null, after: "" };

  const m = THESIS_HEADING_RE.exec(md);
  if (!m) return { before: md, thesis: null, after: "" };

  const before = md.slice(0, m.index).trimEnd();
  const rest = md.slice(m.index + m[0].length);

  const next = NEXT_H2_RE.exec(rest);
  if (next) {
    return {
      before,
      thesis: rest.slice(0, next.index).trim(),
      after: rest.slice(next.index).trim(),
    };
  }
  return { before, thesis: rest.trim(), after: "" };
}
