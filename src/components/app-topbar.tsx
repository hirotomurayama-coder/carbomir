"use client";

import * as React from "react";
import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SidebarBody } from "@/components/app-sidebar";
import { useCommandMenu } from "@/components/command-menu";

export function AppTopBar() {
  const { open } = useCommandMenu();
  return (
    <header className="sticky top-0 z-30 h-[52px] flex items-center gap-3 px-4 sm:px-6 border-b border-border bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      {/* Mobile sidebar trigger */}
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden h-8 w-8">
            <Menu className="h-4 w-4" />
            <span className="sr-only">メニューを開く</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[240px] bg-sidebar text-sidebar-foreground border-sidebar-border">
          <SheetTitle className="sr-only">ナビゲーション</SheetTitle>
          {/* モバイル用に SidebarBody (中身のみ) を表示 */}
          <div className="h-full overflow-y-auto">
            <SidebarBody />
          </div>
        </SheetContent>
      </Sheet>

      {/* Breadcrumbs */}
      <div className="flex-1 min-w-0">
        <Breadcrumbs />
      </div>

      {/* Search trigger (Cmd+K) */}
      <button
        type="button"
        onClick={open}
        className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-md border border-border bg-muted/40 text-muted-foreground text-xs hover:border-input hover:bg-muted/70 hover:text-foreground transition-colors min-w-[240px]"
      >
        <Search className="h-3.5 w-3.5" />
        <span className="flex-1 text-left">エンティティ・行列を検索</span>
        <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground">
          ⌘K
        </kbd>
      </button>

      {/* Search trigger (mobile, icon only) */}
      <Button
        variant="ghost"
        size="icon"
        onClick={open}
        className="sm:hidden h-8 w-8"
        aria-label="検索"
      >
        <Search className="h-4 w-4" />
      </Button>

      {/* Theme toggle */}
      <ThemeToggle />
    </header>
  );
}
