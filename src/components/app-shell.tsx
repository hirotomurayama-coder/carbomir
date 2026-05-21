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
          Carbomir is a product of <span className="text-foreground/80 font-medium">株式会社クレイドルトゥー</span>.
        </p>
        <p className="font-mono">
          © {new Date().getFullYear()} CradleTo, Inc. · v3.0
        </p>
      </div>
    </footer>
  );
}
