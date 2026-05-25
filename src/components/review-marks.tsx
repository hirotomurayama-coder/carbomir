import * as React from "react";

/**
 * 編集部による「要確認」マーカーをインラインで視覚化する。
 *
 * 検出パターン:
 *   (要確認)
 *   (要確認: 直近実勢)
 *   (要確認: 制度詳細・最新値)
 * など括弧内に「要確認」で始まる注釈。
 *
 * Phase B (編集レビュー UI) では同じパターンを source-of-truth として、
 * /admin/review の一覧に集約する想定。
 */

// 括弧内のどこに「要確認」or「運用注視」が出現してもマッチする。
// 「要確認」(琥珀色): 公開コンテンツに残ってはならない内部 TODO。/editorial の集計対象
// 「運用注視」(青色): 本質的に不確実な領域の透明性表示。公開時にも残す
// 例: `(要確認)`, `(運用注視: 第2フェーズ移行時の細目)`, `(180 USD/t、要確認: 制度詳細)`
const REVIEW_PATTERN = /\([^()]*(?:要確認|運用注視)[^()]*\)/g;

// 「要確認」のみを数える (公開コンテンツに残るべきでない TODO の集計用)
// 「運用注視」は意図的に残しているのでカウントしない
const TODO_PATTERN = /\([^()]*要確認[^()]*\)/g;

/**
 * プレーンテキスト中の `(要確認...)` 出現数を数える.
 * 「運用注視」は構造的な不確実性を透明性として残すラベルなのでカウントしない.
 */
export function countReviewMarks(text: string): number {
  if (!text) return 0;
  const matches = text.match(TODO_PATTERN);
  return matches ? matches.length : 0;
}

/**
 * テキストを `(要確認...)` で分割し、該当部分を <ReviewMarkBadge> でラップした
 * JSX ノード配列を返す。マッチがなければ元のテキストを単一の文字列として返す。
 */
export function splitReviewMarks(text: string): React.ReactNode {
  if (!text) return text;
  if (!REVIEW_PATTERN.test(text)) return text;
  // exec を繰り返す必要があるので lastIndex をリセット
  REVIEW_PATTERN.lastIndex = 0;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = REVIEW_PATTERN.exec(text)) !== null) {
    const before = text.slice(lastIndex, match.index);
    if (before) parts.push(before);
    parts.push(<ReviewMarkBadge key={key++} text={match[0]} />);
    lastIndex = match.index + match[0].length;
  }
  const after = text.slice(lastIndex);
  if (after) parts.push(after);
  return <>{parts}</>;
}

/**
 * MarkdownContent の component override 内で使う、children を走査して
 * 文字列ノードに splitReviewMarks を適用するヘルパー。
 */
export function processChildrenReviewMarks(
  children: React.ReactNode
): React.ReactNode {
  return React.Children.map(children, (child) => {
    if (typeof child === "string") return splitReviewMarks(child);
    return child;
  });
}

/** plain text をラップして要確認をインライン強調する Wrapper Component */
export function ReviewMarkedText({ children }: { children: string | null | undefined }) {
  if (children == null) return null;
  return <>{splitReviewMarks(children)}</>;
}

/** 「要確認 N」の集計バッジ */
export function ReviewCountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-mono tracking-wider text-amber-700 dark:text-amber-300"
      title={`このページに ${count} 件の要確認項目があります`}
    >
      <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      </svg>
      {count} 要確認
    </span>
  );
}

/** インラインの 1 個分バッジ (要確認 = 琥珀、運用注視 = 青で区別) */
function ReviewMarkBadge({ text }: { text: string }) {
  const isWatching = text.includes("運用注視");
  const className = isWatching
    ? "inline rounded-sm border border-sky-500/35 bg-sky-500/8 text-sky-700 dark:text-sky-300 px-1 py-0 text-[0.85em] mx-0.5 font-normal"
    : "inline rounded-sm border border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300 px-1 py-0 text-[0.85em] mx-0.5 font-normal";
  return (
    <span
      className={className}
      data-review-mark={isWatching ? "watching" : "todo"}
    >
      {text}
    </span>
  );
}
