import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopBar } from "@/components/app-topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AppTopBar />
        <main className="flex-1 overflow-y-auto scroll-smooth">
          {children}
          <AppFooter />
        </main>
      </div>
    </div>
  );
}

function AppFooter() {
  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="px-6 py-6 text-[11px] text-muted-foreground flex items-center justify-between flex-wrap gap-3">
        <p>
          Carbomir is a product of{" "}
          <Link href="/about" className="text-foreground/80 font-medium hover:text-accent">
            株式会社クレイドルトゥー
          </Link>
          .
        </p>
        <div className="flex items-center gap-3 font-mono">
          <Link href="/about" className="hover:text-foreground">
            About
          </Link>
          <span className="opacity-50">·</span>
          <a
            href="https://carboncredits.jp/contact"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            Contact
          </a>
          <span className="opacity-50">·</span>
          <span>© {new Date().getFullYear()} CradleTo, Inc.</span>
        </div>
      </div>
    </footer>
  );
}
