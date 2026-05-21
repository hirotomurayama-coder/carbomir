"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Columns3,
  Network,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { listPublishedMatrices } from "@/lib/data/comparisons";
import { listPublishedEntities } from "@/lib/data/entities";
import { ENTITY_TYPE_LABEL } from "@/lib/types";

type CommandMenuContextValue = {
  open: () => void;
};

const CommandMenuContext = React.createContext<CommandMenuContextValue | null>(null);

export function useCommandMenu() {
  const ctx = React.useContext(CommandMenuContext);
  if (!ctx) {
    throw new Error("useCommandMenu must be used within CommandMenuProvider");
  }
  return ctx;
}

export function CommandMenuProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const matrices = React.useMemo(() => listPublishedMatrices(), []);
  const entities = React.useMemo(() => listPublishedEntities(), []);

  const go = React.useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router]
  );

  return (
    <CommandMenuContext.Provider value={{ open: () => setOpen(true) }}>
      {children}
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="検索"
        description="エンティティ・比較行列・ナビゲーションを横断検索"
        showCloseButton={false}
      >
        <CommandInput placeholder="エンティティ・行列・ページを検索..." />
        <CommandList>
          <CommandEmpty>該当する項目はない</CommandEmpty>

          <CommandGroup heading="ナビゲーション">
            <CommandItem onSelect={() => go("/")} keywords={["home", "dashboard", "ホーム"]}>
              <LayoutDashboard className="h-4 w-4" />
              <span>ホーム</span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </CommandItem>
            <CommandItem onSelect={() => go("/matrices")} keywords={["matrix", "comparison"]}>
              <Columns3 className="h-4 w-4" />
              <span>比較行列</span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </CommandItem>
            <CommandItem onSelect={() => go("/entities")} keywords={["concepts", "knowledge"]}>
              <Network className="h-4 w-4" />
              <span>概念体系</span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </CommandItem>
          </CommandGroup>

          {matrices.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="比較行列">
                {matrices.map((m) => (
                  <CommandItem
                    key={m.slug}
                    onSelect={() => go(`/matrices/${m.slug}`)}
                    keywords={[
                      m.slug,
                      ...m.entities.map((e) => e.name_ja),
                      ...m.entities.map((e) => e.name_en ?? ""),
                    ]}
                  >
                    <Columns3 className="h-4 w-4 text-accent" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{m.title}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {m.entities.length}×{m.dimensions.length} · {m.last_reviewed_at}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {entities.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="エンティティ">
                {entities.map((e) => (
                  <CommandItem
                    key={e.slug}
                    onSelect={() => go(`/entities/${e.slug}`)}
                    keywords={[
                      e.slug,
                      e.name_en ?? "",
                      e.abbreviation ?? "",
                      ...e.tags,
                    ]}
                  >
                    <Network className="h-4 w-4 text-primary dark:text-accent" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">
                        {e.name_ja}
                        {e.name_en && (
                          <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                            {e.name_en}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {ENTITY_TYPE_LABEL[e.type]} · {e.last_reviewed_at}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </CommandMenuContext.Provider>
  );
}
