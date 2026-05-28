import { MessageSquareQuote } from "lucide-react";
import type { PaywallTier } from "@/lib/types";
import { MarkdownContent } from "@/components/markdown-content";
import { PaywallBadge } from "@/components/paywall-badge";

/**
 * 「編集部の論点」専用 call-out (EditorialThesis).
 *
 * STRATEGY §2: 「編集部の論点」はプロダクトの心臓 (= 判断可能性で戦う核)。
 * 通常セクション (制度の概要 等) と同じ h2 で流すと埋もれるため、
 * アクセント枠 + アイコン + タグラインで「ここが編集部の解釈」と視認できるよう
 * 描き分ける。entity / case-study (sections[]) でも timeline (content_md 分割後)
 * でも同じ見た目になるよう共通化。
 *
 * 本文 markdown 内の (確信度 強/中/弱) / (運用注視: ...) は MarkdownContent 側の
 * inline mark 機構が自動でチップ化する。
 */

type Props = {
  /** 論点本文 (markdown)。見出し "編集部の論点" は含めない */
  children: string;
  /** 課金階層バッジ (任意) */
  paywallTier?: PaywallTier;
  /** 論点セクションに紐づく出典 (entity / case-study)。timeline はイベント単位なので渡さない */
  sourceUrls?: { label: string; url: string }[];
  /** scroll-mt 等の id 付与用 (entity TOC アンカー) */
  id?: string;
  className?: string;
};

export function EditorialThesis({
  children,
  paywallTier,
  sourceUrls,
  id,
  className,
}: Props) {
  return (
    <section
      id={id}
      className={`scroll-mt-20 rounded-lg border border-accent/30 bg-accent/[0.05] dark:bg-accent/[0.06] px-5 py-5 sm:px-6 ${className ?? ""}`}
    >
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <span className="inline-flex items-center justify-center rounded-md bg-accent/15 text-accent h-6 w-6 shrink-0">
          <MessageSquareQuote className="h-3.5 w-3.5" aria-hidden />
        </span>
        <h2 className="text-lg font-bold text-foreground tracking-tight">
          編集部の論点
        </h2>
        <PaywallBadge tier={paywallTier} className="ml-1" />
      </div>
      <p className="label-mono text-muted-foreground mb-4 pl-8">
        Carbomir 編集部による解釈 — 出典と確信度つき
      </p>
      <div className="pl-8 border-l border-accent/15 -ml-px">
        <MarkdownContent>{children}</MarkdownContent>
        {sourceUrls && sourceUrls.length > 0 && (
          <ul className="mt-4 space-y-1.5">
            {sourceUrls.map((src, si) => (
              <li key={si}>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 label-mono text-accent hover:underline"
                >
                  <span className="font-mono">↗</span>
                  {src.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
