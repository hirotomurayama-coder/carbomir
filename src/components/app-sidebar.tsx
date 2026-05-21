"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Columns3,
  Network,
  Search,
  CircleUser,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCommandMenu } from "@/components/command-menu";

const NAV_ITEMS: { href: string; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { href: "/", label: "ホーム", Icon: LayoutDashboard },
  { href: "/matrices", label: "比較行列", Icon: Columns3 },
  { href: "/entities", label: "概念体系", Icon: Network },
];

export function AppSidebar() {
  const { open } = useCommandMenu();
  return (
    <aside className="hidden md:flex md:w-[220px] md:shrink-0 md:flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo */}
      <div className="h-[52px] flex items-center gap-2.5 px-4 border-b border-sidebar-border">
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

      {/* Search trigger (Cmd+K) */}
      <div className="px-3 pt-3">
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

      {/* Navigation */}
      <nav className="px-3 pt-4 pb-2">
        <p className="px-2 mb-1.5 font-mono text-[10px] tracking-widest uppercase text-sidebar-foreground/40">
          Navigation
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <NavLink {...item} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Status indicator */}
      <div className="px-3 py-3 border-t border-sidebar-border">
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

      {/* User CTA */}
      <div className="px-3 pb-3">
        <a
          href="https://carboncredits.jp"
          className="flex items-center gap-2 w-full px-2.5 py-2 rounded-md text-xs font-medium bg-sidebar-primary text-sidebar-primary-foreground hover:opacity-90 transition-opacity"
        >
          <CircleUser className="h-3.5 w-3.5" />
          無料登録
        </a>
      </div>
    </aside>
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
