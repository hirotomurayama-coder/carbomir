"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
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
  LayoutDashboard,
  ArrowRight,
  BookOpen,
  HelpCircle,
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
import {
  CASE_STUDY_CATEGORY_LABEL,
  ENTITY_TYPE_LABEL,
  FAQ_CATEGORY_LABEL,
  TIMELINE_CATEGORY_LABEL,
  type CaseStudy,
  type ComparisonMatrix,
  type Entity,
  type FAQItem,
  type TimelineEvent,
} from "@/lib/types";

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

type CommandMenuProviderProps = {
  children: React.ReactNode;
  matrices: ComparisonMatrix[];
  entities: Entity[];
  timelineEvents: TimelineEvent[];
  caseStudies: CaseStudy[];
  faqs: FAQItem[];
};

export function CommandMenuProvider({
  children,
  matrices,
  entities,
  timelineEvents,
  caseStudies,
  faqs,
}: CommandMenuProviderProps) {
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

          <CommandGroup heading="ホーム">
            <CommandItem onSelect={() => go("/")} keywords={["home", "dashboard", "ホーム"]}>
              <LayoutDashboard className="h-4 w-4" />
              <span>ホーム</span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="比べる">
            <CommandItem onSelect={() => go("/matrices")} keywords={["matrix", "comparison", "比較行列"]}>
              <Columns3 className="h-4 w-4" />
              <span>比較行列</span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="調べる">
            <CommandItem onSelect={() => go("/entities")} keywords={["concepts", "knowledge", "概念"]}>
              <Network className="h-4 w-4" />
              <span>概念体系</span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </CommandItem>
            <CommandItem onSelect={() => go("/players")} keywords={["players", "companies", "organization", "プレイヤー"]}>
              <Building2 className="h-4 w-4" />
              <span>プレイヤー</span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </CommandItem>
            <CommandItem onSelect={() => go("/policies")} keywords={["policies", "regulations", "政策", "規制"]}>
              <Scale className="h-4 w-4" />
              <span>政策・規制</span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="追う">
            <CommandItem onSelect={() => go("/timeline")} keywords={["timeline", "history", "時系列", "規制動向"]}>
              <Clock className="h-4 w-4" />
              <span>時系列</span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </CommandItem>
            <CommandItem onSelect={() => go("/policies/calendar")} keywords={["calendar", "milestones", "規制カレンダー", "規制動向", "next milestone"]}>
              <Clock className="h-4 w-4" />
              <span>規制カレンダー</span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="学ぶ">
            <CommandItem onSelect={() => go("/case-studies")} keywords={["case", "studies", "ケーススタディ", "Microsoft", "Apple", "Stripe", "Mitsubishi", "NYK"]}>
              <BookOpen className="h-4 w-4" />
              <span>ケーススタディ</span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </CommandItem>
            <CommandItem onSelect={() => go("/faq")} keywords={["faq", "qa", "実務", "Q&A", "質問"]}>
              <HelpCircle className="h-4 w-4" />
              <span>FAQ / 実務 Q&amp;A</span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="世界マップ">
            <CommandItem onSelect={() => go("/atlas/instruments")} keywords={["atlas", "instruments", "carbon pricing", "ETS", "carbon tax", "価格制度"]}>
              <Globe2 className="h-4 w-4" />
              <span>価格制度</span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </CommandItem>
            <CommandItem onSelect={() => go("/atlas/mechanisms")} keywords={["atlas", "crediting", "mechanism", "Verra", "Gold Standard", "クレジット機構"]}>
              <Stamp className="h-4 w-4" />
              <span>クレジット機構</span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </CommandItem>
            <CommandItem onSelect={() => go("/atlas/cooperative")} keywords={["atlas", "cooperative", "Article 6", "二国間協定", "Paris"]}>
              <Handshake className="h-4 w-4" />
              <span>二国間協定</span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </CommandItem>
            <CommandItem onSelect={() => go("/atlas/offsets-db")} keywords={["atlas", "offsets", "CarbonPlan", "projects", "registry"]}>
              <Database className="h-4 w-4" />
              <span>OffsetsDB</span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </CommandItem>
            <CommandItem onSelect={() => go("/atlas/offsets-db/projects")} keywords={["atlas", "offsets", "projects", "Verra", "Gold Standard"]}>
              <Database className="h-4 w-4" />
              <span>OffsetsDB / Projects (11k)</span>
              <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="ツール">
            <CommandItem onSelect={() => go("/graph")} keywords={["graph", "relations", "network", "関係グラフ"]}>
              <GitBranch className="h-4 w-4" />
              <span>関係グラフ</span>
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

          {entities.filter((e) => e.type !== "player").length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="概念体系">
                {entities
                  .filter((e) => e.type !== "player")
                  .map((e) => (
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

          {entities.filter((e) => e.type === "player").length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="プレイヤー">
                {entities
                  .filter((e) => e.type === "player")
                  .map((e) => (
                    <CommandItem
                      key={e.slug}
                      onSelect={() => go(`/entities/${e.slug}`)}
                      keywords={[
                        e.slug,
                        e.name_en ?? "",
                        e.abbreviation ?? "",
                        e.business_role ?? "",
                        e.jurisdiction ?? "",
                        ...e.tags,
                      ]}
                    >
                      <Building2 className="h-4 w-4 text-primary dark:text-accent" />
                      <div className="flex-1 min-w-0">
                        <div className="truncate">
                          {e.name_ja}
                          {e.name_en && e.name_en !== e.name_ja && (
                            <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                              {e.name_en}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {e.business_role ?? "プレイヤー"}
                          {e.jurisdiction ? ` · ${e.jurisdiction}` : ""}
                        </div>
                      </div>
                    </CommandItem>
                  ))}
              </CommandGroup>
            </>
          )}

          {timelineEvents.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="時系列イベント">
                {timelineEvents.map((ev) => (
                  <CommandItem
                    key={ev.slug}
                    onSelect={() => go(`/timeline/${ev.slug}`)}
                    keywords={[
                      ev.slug,
                      ev.event_date,
                      ev.category,
                      ...ev.affected_entity_slugs,
                    ]}
                  >
                    <Clock className="h-4 w-4 text-accent" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{ev.title}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {ev.event_date} · {TIMELINE_CATEGORY_LABEL[ev.category]}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {caseStudies.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="ケーススタディ">
                {caseStudies.map((cs) => (
                  <CommandItem
                    key={cs.slug}
                    onSelect={() => go(`/case-studies/${cs.slug}`)}
                    keywords={[
                      cs.slug,
                      cs.company,
                      cs.year.toString(),
                      cs.region,
                      cs.credit_type ?? "",
                      cs.category,
                      ...cs.tags,
                      ...cs.related_entity_slugs,
                    ]}
                  >
                    <BookOpen className="h-4 w-4 text-accent" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{cs.title}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {cs.company} · {cs.year} · {CASE_STUDY_CATEGORY_LABEL[cs.category]}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {faqs.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="FAQ">
                {faqs.map((f) => (
                  <CommandItem
                    key={f.slug}
                    onSelect={() => go(`/faq`)}
                    keywords={[
                      f.slug,
                      f.category,
                      ...f.tags,
                      ...f.related_entity_slugs,
                    ]}
                  >
                    <HelpCircle className="h-4 w-4 text-accent" />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{f.question}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {FAQ_CATEGORY_LABEL[f.category]} · {f.last_reviewed_at}
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
