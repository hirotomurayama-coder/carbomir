import { ShieldAlert, HardDrive } from "lucide-react";

/**
 * /admin/* で表示する警告バナー。
 * dev only + 認証未実装 を明示する。
 */
export function AdminBanner() {
  return (
    <div className="mb-6 rounded-md border border-amber-500/40 bg-amber-500/5 px-4 py-3 flex items-start gap-3 text-[12px] text-amber-900 dark:text-amber-200">
      <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
      <div className="flex-1 leading-relaxed">
        <p className="font-medium mb-0.5">
          内部管理画面 — 認証未実装 / ローカル編集専用
        </p>
        <p className="text-[11.5px] opacity-90">
          編集内容は <code className="font-mono bg-amber-500/10 px-1 rounded">data/content/*.json</code> に保存されます。
          dev サーバでは即時反映されますが、Vercel 等の本番環境では filesystem 書込ができないため、
          編集後は <strong>git commit → push → deploy</strong> のフローで本番に反映してください。
        </p>
      </div>
      <span className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 font-mono text-[10px] tracking-wider shrink-0">
        <HardDrive className="h-2.5 w-2.5" />
        FS WRITE
      </span>
    </div>
  );
}
