"use client";
import { cva, type VariantProps } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as React from "react";

export const cn = (...c: ClassValue[]) => twMerge(clsx(c));

const button = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap font-medium transition active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary: "bg-tint text-white hover:bg-[#0077ed]",
        secondary: "bg-fill text-ink hover:bg-[rgb(118_118_128/0.18)]",
        plain: "text-tint hover:bg-tint-soft",
        danger: "bg-[rgb(255_59_48/0.1)] text-hot hover:bg-[rgb(255_59_48/0.16)]",
      },
      size: { sm: "h-7 px-3 text-[13px] rounded-full", md: "h-9 px-4 text-[14px] rounded-full", lg: "h-11 px-5 text-[15px] rounded-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export function Button({ className, variant, size, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof button>) {
  return <button className={cn(button({ variant, size }), className)} {...p} />;
}

// iOS-style grouped inset list
export function Group({ title, footer, children, className }: { title?: React.ReactNode; footer?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("mb-6", className)}>
      {title && <h3 className="px-4 pb-1.5 text-[13px] text-ink-2">{title}</h3>}
      <div className="overflow-hidden rounded-[12px] bg-surface divide-y divide-hairline">{children}</div>
      {footer && <p className="px-4 pt-1.5 text-[12px] leading-snug text-ink-3">{footer}</p>}
    </section>
  );
}

export function Row({ label, children, hint, edited, className }: { label: React.ReactNode; children: React.ReactNode; hint?: React.ReactNode; edited?: boolean; className?: string }) {
  return (
    <div className={cn("flex min-h-11 items-start gap-3 px-4 py-2.5", className)}>
      <div className="w-[118px] shrink-0 pt-px text-[14px] text-ink-2">
        {label}
        {edited && <span className="ml-1.5 inline-block rounded-full bg-tint-soft px-1.5 text-[10.5px] font-semibold text-tint align-middle">Edited</span>}
      </div>
      <div className="min-w-0 flex-1 text-[14px]">
        {children}
        {hint && <div className="mt-0.5 text-[12px] leading-snug text-ink-3">{hint}</div>}
      </div>
    </div>
  );
}

export function Pill({ tone = "gray", children, className }: { tone?: "red" | "orange" | "green" | "blue" | "gray" | "sea"; children: React.ReactNode; className?: string }) {
  const tones = {
    red: "bg-[rgb(255_59_48/0.12)] text-[#d70015]",
    orange: "bg-[rgb(255_149_0/0.14)] text-[#b25000]",
    green: "bg-[rgb(52_199_89/0.14)] text-[#1d7a36]",
    blue: "bg-tint-soft text-tint",
    gray: "bg-fill text-ink-2",
    sea: "bg-[rgb(11_93_85/0.1)] text-sea",
  } as const;
  return <span className={cn("inline-flex h-[22px] items-center gap-1 rounded-full px-2 text-[12px] font-medium", tones[tone], className)}>{children}</span>;
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-[9px] bg-fill p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "h-7 rounded-[7px] px-3 text-[13px] font-medium transition",
            value === o.value ? "bg-surface text-ink shadow-[0_1px_3px_rgb(0_0_0/0.12),0_0_0_0.5px_rgb(0_0_0/0.04)]" : "text-ink-2 hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Select<T extends string>({ value, options, onChange, label, className }: { value: T; options: readonly T[]; onChange: (v: T) => void; label: string; className?: string }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={cn("h-7 rounded-[7px] bg-fill-2 pl-2 pr-6 text-[13.5px] text-ink outline-none hover:bg-fill appearance-none bg-no-repeat bg-[right_6px_center] bg-[length:10px]", className)}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' fill='none' stroke='%2386868b' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")" }}
    >
      {options.map((o) => (
        <option key={o} value={o}>{human(o)}</option>
      ))}
    </select>
  );
}

export const human = (s: string) => {
  const map: Record<string, string> = { not_a_lead: "Not a lead", ops: "Ops", none: "No one", agent: "Agent", true: "Yes", false: "No" };
  return map[s] ?? (s.charAt(0).toUpperCase() + s.slice(1)).replaceAll("_", " ");
};

export const inr = (n: number | null | undefined) => (n == null ? "—" : "₹" + n.toLocaleString("en-IN"));
