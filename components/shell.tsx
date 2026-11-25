"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, LayoutList, Gauge, FileText, Braces, Sparkles } from "lucide-react";
import { cn } from "./ui";
import { useStore, effective } from "./store";
import { TRANSCRIPTS } from "@/lib/transcripts";

const NAV = [
  { href: "/", label: "Inbox", icon: Inbox, who: "Agent" },
  { href: "/manager", label: "Manager queue", icon: LayoutList, who: "Manager" },
  { href: "/try", label: "Analyze a conversation", icon: Sparkles, who: "Agent" },
  { href: "/eval", label: "Evaluation", icon: Gauge, who: "Product" },
  { href: "/brief", label: "Product brief", icon: FileText, who: "Product" },
  { href: "/prompt", label: "Prompt and schema", icon: Braces, who: "Product" },
];

function Mark() {
  return (
    <svg viewBox="0 0 28 28" className="size-7" aria-hidden>
      <rect width="28" height="28" rx="7" fill="#0b5d55" />
      <path d="M6 18.5c2.6-1.6 5.2-1.6 8 0s5.4 1.6 8 0" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M9 14.2 14 9l5 5.2" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { results, reviews } = useStore();
  const pending = TRANSCRIPTS.filter((t) => results[t.id] && reviews[t.id]?.status !== "confirmed").length;
  const escalations = TRANSCRIPTS.filter((t) => results[t.id] && effective(results[t.id].analysis, reviews[t.id]).escalation_needed).length;
  const groups = ["Agent", "Manager", "Product"];

  return (
    <div className="min-h-dvh md:flex">
      <aside className="glass sticky top-0 z-20 border-b border-hairline md:h-dvh md:w-[248px] md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2.5 px-4 pt-4 pb-3 md:px-5 md:pt-6 md:pb-5">
          <Mark />
          <div className="leading-tight">
            <div className="text-[15px] font-semibold tracking-tight">Lohono Copilot</div>
            <div className="text-[12px] text-ink-2">After-call assistant prototype</div>
          </div>
        </div>
        <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-3 pb-3 md:block md:space-y-4 md:overflow-visible md:pb-0">
          {groups.map((g) => (
            <div key={g} className="flex gap-1 md:block md:space-y-0.5">
              <div className="hidden px-2 pb-1 text-[11.5px] font-medium text-ink-3 md:block">{g}</div>
              {NAV.filter((n) => n.who === g).map((n) => {
                const active = n.href === "/" ? path === "/" : path.startsWith(n.href);
                const badge = n.href === "/" ? pending : n.href === "/manager" ? escalations : 0;
                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex h-8 shrink-0 items-center gap-2 rounded-[8px] px-2 text-[14px] transition",
                      active ? "bg-[rgb(0_113_227/0.12)] text-tint font-medium" : "text-ink hover:bg-fill-2",
                    )}
                  >
                    <n.icon className="size-[17px]" strokeWidth={1.9} />
                    <span className="whitespace-nowrap">{n.label}</span>
                    {badge > 0 && (
                      <span className={cn("ml-auto rounded-full px-1.5 text-[11.5px] font-semibold tabular-nums", n.href === "/manager" ? "bg-hot text-white" : "text-ink-2")}>
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <p className="absolute bottom-5 hidden px-5 text-[11.5px] leading-snug text-ink-3 md:block">
          All conversations are synthetic samples from the case brief. No real guest data.
        </p>
      </aside>
      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}
