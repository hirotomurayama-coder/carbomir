import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { processChildrenReviewMarks } from "@/components/review-marks";

/**
 * Markdown を Carbomir デザイントークンに合わせて描画するコンポーネント。
 * Server Component として動作 (react-markdown は SSR フレンドリー)。
 *
 * 対応:
 *  - 段落 / 改行 / 強調 (bold/italic)
 *  - 順序つき・順序なしリスト
 *  - リンク (外部リンクは新規タブ + rel)
 *  - 見出し (h2-h4 のみ。h1 は section heading と衝突するため抑制)
 *  - 引用 / インラインコード / コードブロック
 *  - テーブル (remark-gfm)
 *  - 取り消し線・タスクリスト (remark-gfm)
 */

type Props = {
  /** Markdown 文字列 */
  children: string;
  /** 追加 className */
  className?: string;
};

const components: Components = {
  // h1 は意図せず使われたら h2 相当に降格 (デザイン階層維持)
  h1: ({ children }) => (
    <h2 className="text-lg font-bold text-foreground tracking-tight mt-6 mb-2">
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h3 className="text-base font-semibold text-foreground tracking-tight mt-6 mb-2">
      {children}
    </h3>
  ),
  h3: ({ children }) => (
    <h4 className="text-sm font-semibold text-foreground tracking-tight mt-5 mb-1.5">
      {children}
    </h4>
  ),
  h4: ({ children }) => (
    <p className="label-mono text-muted-foreground mt-4 mb-1.5">{children}</p>
  ),
  p: ({ children }) => (
    <p className="mb-4 last:mb-0 leading-[1.85]">
      {processChildrenReviewMarks(children)}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 last:mb-0 ml-5 list-disc space-y-1.5 marker:text-muted-foreground/60">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 last:mb-0 ml-5 list-decimal space-y-1.5 marker:text-muted-foreground/60 marker:font-mono">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="leading-[1.75]">{processChildrenReviewMarks(children)}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
  a: ({ href, children }) => {
    if (!href) return <>{children}</>;
    const external = /^https?:\/\//i.test(href);
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="text-accent underline underline-offset-2 decoration-accent/40 hover:decoration-accent transition-colors"
      >
        {children}
      </a>
    );
  },
  code: ({ children, className }) => {
    const isBlock = className && className.startsWith("language-");
    if (isBlock) {
      return (
        <code className="block w-full font-mono text-[12.5px] leading-relaxed">
          {children}
        </code>
      );
    }
    return (
      <code className="font-mono text-[0.9em] bg-muted/60 text-foreground/90 px-1 py-0.5 rounded border border-border">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-4 last:mb-0 overflow-x-auto rounded-md border border-border bg-muted/40 p-3">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-4 last:mb-0 border-l-2 border-border pl-3 text-muted-foreground italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-border" />,
  table: ({ children }) => (
    <div className="mb-4 last:mb-0 overflow-x-auto rounded-md border border-border">
      <table className="w-full text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-muted/40 border-b border-border">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="text-left label-mono text-muted-foreground font-normal px-3 py-2">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-3 py-2 align-top border-t border-border first:border-t-0">
      {processChildrenReviewMarks(children)}
    </td>
  ),
};

export function MarkdownContent({ children, className }: Props) {
  return (
    <div
      className={`text-[15px] text-foreground/90 max-w-prose ${className ?? ""}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
