import { redirect } from "next/navigation";

/**
 * /policies/calendar は時系列ページに統合されました (Theme 6).
 *
 * 規制 entity の next_milestone は /timeline に
 * "milestone-<slug>" プレフィックス付きの synthetic event として merge 表示.
 * UI ナビゲーション簡素化のため、このパスは時系列ページにリダイレクト.
 */
export default function PoliciesCalendarRedirect() {
  redirect("/timeline");
}
