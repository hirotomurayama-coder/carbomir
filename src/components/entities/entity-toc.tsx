"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TocItem = { id: string; label: string };

function useActiveSection(ids: string[]) {
  const [active, setActive] = React.useState<string | null>(ids[0] ?? null);

  React.useEffect(() => {
    if (ids.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActive(visible[0].target.id);
        }
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

export function EntityToc({ items }: { items: TocItem[] }) {
  const ids = React.useMemo(() => items.map((i) => i.id), [items]);
  const active = useActiveSection(ids);

  if (items.length === 0) return null;

  return (
    <aside className="hidden lg:block">
      <div className="lg:sticky lg:top-20">
        <p className="label-mono text-muted-foreground mb-3">On this page</p>
        <ul className="space-y-px">
          {items.map((it, i) => {
            const isActive = active === it.id;
            return (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  className={cn(
                    "flex items-center gap-2 py-1.5 pl-3 pr-2 text-sm border-l-2 transition-colors",
                    isActive
                      ? "border-accent text-foreground font-medium bg-muted/50"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border-strong"
                  )}
                >
                  <span className="font-mono text-[10px] text-muted-foreground shrink-0">
                    {(i + 1).toString().padStart(2, "0")}
                  </span>
                  <span className="truncate">{it.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
