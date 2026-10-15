"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { COVER_CHOICES, WINDOW_CHOICES, windowLabel } from "@/lib/filters";
import { cn } from "@/lib/utils";

export function PeriodBar({ showCover = false }: { showCover?: boolean }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const windowDays = params.get("janela") ?? "30";
  const cover = params.get("cobertura") ?? "30";

  function href(next: Record<string, string>): string {
    const search = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) search.set(key, value);
    return `${pathname}?${search.toString()}`;
  }

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs tracking-wide text-muted-foreground uppercase">
          Vendas
        </span>
        {WINDOW_CHOICES.map((days) => (
          <Link
            key={days}
            href={href({ janela: String(days) })}
            className={cn(
              "rounded-full border px-3 py-1 text-xs",
              windowDays === String(days)
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-foreground",
            )}
          >
            {windowLabel(days)}
          </Link>
        ))}
      </div>
      {showCover ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs tracking-wide text-muted-foreground uppercase">
            Cobertura alvo
          </span>
          {COVER_CHOICES.map((days) => (
            <Link
              key={days}
              href={href({ cobertura: String(days) })}
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                cover === String(days)
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-foreground",
              )}
            >
              {days} dias
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
