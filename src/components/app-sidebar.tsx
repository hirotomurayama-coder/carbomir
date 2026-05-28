"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Columns3,
  Network,
  Clock,
  Building2,
  Scale,
  GitBranch,
  Globe2,
  Stamp,
  Handshake,
  Database,
  ClipboardList,
  Search,
  CircleUser,
  Activity,
  BookOpen,
  HelpCircle,
  Sparkles,
  PenSquare,
  CalendarClock,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommandMenu } from "@/components/command-menu";
import { useWatchlist } from "@/components/watchlist/watchlist-provider";

type NavItem = {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
};

/**
 * 動詞型タクソノミー (アライメント結果 2026-05-25)
 *
 * 比べる / 調べる / 追う / 学ぶ = Carbomir 編集部の編集資産 (動詞)
 * 世界マップ = 外部由来の網羅マスタ (名詞)
 * このラベル差で「自社編集物 vs 外部参照データ」の性質差を表現
 */

const HOME_ITEM: NavItem = { href: "/", label: "ホーム", Icon: LayoutDashboard };

const COMPARE_ITEMS: NavItem[] = [
  { href: "/matrices", label: "比較行列", Icon: Columns3 },
];

const DEFINE_ITEMS: NavItem[] = [
  { href: "/entities", label: "用語集", Icon: Network },
  { href: "/players", label: "プレイヤー", Icon: Building2 },
  { href: "/policies", label: "政策・規制", Icon: Scale },
];

const TRACK_ITEMS: NavItem[] = [
  { href: "/timeline", label: "時系列", Icon: Clock },
  { href: "/policies/calendar", label: "規制カレンダー", Icon: CalendarClock },
];

const APPLY_ITEMS: NavItem[] = [
  { href: "/case-studies", label: "ケーススタディ", Icon: BookOpen },
  { href: "/faq", label: "FAQ", Icon: HelpCircle },
];

const SURVEY_ITEMS: NavItem[] = [
  { href: "/atlas/instruments", label: "価格制度", Icon: Globe2 },
  { href: "/atlas/mechanisms", label: "クレジット機構", Icon: Stamp },
  { href: "/atlas/cooperative", label: "二国間協定", Icon: Handshake },
  { href: "/atlas/offsets-db", label: "OffsetsDB", Icon: Database },
];

const TOOL_ITEMS: NavItem[] = [
  { href: "/graph", label: "関係グラフ", Icon: GitBranch },
  { href: "/editorial", label: "編集ステータス", Icon: ClipboardList },
];

const ADMIN_ITEMS: NavItem[] = [
  { href: "/admin/edit", label: "コンテンツ編集", Icon: PenSquare },
  { href: "/admin/drafts", label: "AI ドラフト", Icon: Sparkles },
];

/**
 * デスクトップ用左サイドバー (md 以上で表示).
 * モバイルでは <SidebarBody /> を Sheet に入れる ({@link AppTopBar} 参照).
 */
export function AppSidebar() {
  return (
    <aside className="hidden md:flex md:w-[220px] md:shrink-0 md:flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <SidebarBody />
    </aside>
  );
}

/**
 * サイドバー本体 (デスクトップ/モバイル共通の中身).
 * モバイル時は親で h-full + bg-sidebar を付与した上で呼ぶ.
 *
 * レイアウト:
 *   - 上部 (固定): Logo + 検索ボタン
 *   - 中部 (スクロール): 全ナビセクション (overflow-y-auto)
 *   - 下部 (固定): Status indicator + 無料登録 CTA
 *
 * 中部をスクロール化することで viewport が低い環境でも下部の CTA が常に見える.
 */
export function SidebarBody() {
  const { open } = useCommandMenu();
  return (
    <div className="flex h-full flex-col text-sidebar-foreground min-h-0">
      {/* Logo (top, fixed) */}
      <div className="h-[52px] shrink-0 flex items-center gap-2.5 px-4 border-b border-sidebar-border">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-[13px] font-bold tracking-tight">
          C
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-[13.5px] font-semibold text-sidebar-foreground">
            Carbomir
          </span>
          <span className="text-[10px] text-sidebar-foreground/55 font-mono tracking-wide">
            by Carbon Credits.jp
          </span>
        </div>
      </div>

      {/* Search trigger (top, fixed) */}
      <div className="shrink-0 px-3 pt-3 pb-1">
        <button
          type="button"
          onClick={open}
          className="w-full flex items-center gap-2 h-8 px-2.5 rounded-md bg-sidebar-accent/40 text-sidebar-foreground/70 text-xs border border-sidebar-border/60 hover:border-sidebar-border hover:bg-sidebar-accent/70 hover:text-sidebar-foreground transition-colors"
        >
          <Search className="h-3.5 w-3.5 shrink-0" />
          <span className="flex-1 text-left">検索</span>
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-sidebar/70 border border-sidebar-border/60 text-sidebar-foreground/65">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Scrollable middle: all nav sections */}
      <div className="flex-1 min-h-0 overflow-y-auto sidebar-scroll">
        {/* ホーム + ウォッチリスト (単独) */}
        <nav className="px-3 pt-3 pb-2">
          <ul className="space-y-0.5">
            <li>
              <NavLink {...HOME_ITEM} />
            </li>
            <li>
              <WatchlistNavLink />
            </li>
          </ul>
        </nav>

        <SidebarSection label="比べる" items={COMPARE_ITEMS} />
        <SidebarSection label="調べる" items={DEFINE_ITEMS} />
        <SidebarSection label="追う" items={TRACK_ITEMS} />
        <SidebarSection label="学ぶ" items={APPLY_ITEMS} />
        <SidebarSection label="世界マップ" items={SURVEY_ITEMS} />
        <SidebarSection label="ツール" items={TOOL_ITEMS} />
        <SidebarSection label="Admin" items={ADMIN_ITEMS} />
        {/* スクロール末尾のスペーサ (Next.js dev tools の N アイコンに被らないように) */}
        <div className="h-4" />
      </div>

      {/* Status indicator (bottom, fixed) */}
      <div className="shrink-0 px-3 py-2.5 border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-sidebar-accent/30">
          <Activity className="h-3 w-3 text-emerald-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[10.5px] font-mono uppercase tracking-wider text-sidebar-foreground/65">
              Live
            </p>
            <p className="text-[10px] text-sidebar-foreground/45 metric-number">
              Last sync 2026-05-21
            </p>
          </div>
        </div>
      </div>

      {/* User CTA (bottom, fixed) */}
      <div className="shrink-0 px-3 pb-3">
        <a
          href="https://carboncredits.jp"
          className="flex items-center gap-2 w-full px-2.5 py-2 rounded-md text-xs font-medium bg-sidebar-primary text-sidebar-primary-foreground hover:opacity-90 transition-opacity"
        >
          <CircleUser className="h-3.5 w-3.5" />
          無料登録
        </a>
      </div>
    </div>
  );
}

function SidebarSection({
  label,
  items,
}: {
  label: string;
  items: NavItem[];
}) {
  return (
    <nav className="px-3 pt-3 pb-2">
      <p className="px-2 mb-1.5 font-mono text-[10px] tracking-widest text-sidebar-foreground/40">
        {label}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => (
          <li key={item.href}>
            <NavLink {...item} />
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** ウォッチリスト導線。フォロー件数を live バッジ表示 (client state) */
function WatchlistNavLink() {
  const pathname = usePathname();
  const { items, mounted } = useWatchlist();
  const isActive = pathname === "/watchlist" || pathname.startsWith("/watchlist/");
  const count = mounted ? items.length : 0;

  return (
    <Link
      href="/watchlist"
      className={cn(
        "flex items-center gap-2.5 px-2 h-8 rounded-md text-[13px] transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
      )}
    >
      <Star className="h-4 w-4 shrink-0" />
      <span className="flex-1">ウォッチリスト</span>
      {count > 0 && (
        <span className="metric-number text-[10px] px-1.5 py-0.5 rounded bg-sidebar-accent/70 text-sidebar-foreground/80">
          {count}
        </span>
      )}
    </Link>
  );
}

function NavLink({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  const pathname = usePathname();
  const isActive =
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 px-2 h-8 rounded-md text-[13px] transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
    </Link>
  );
}
