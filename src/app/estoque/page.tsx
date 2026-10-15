import Link from "next/link";

import { EmptyState, PageIntro } from "@/components/page-intro";
import { StockTable } from "@/components/stock-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  situationLabel,
  type StockSituation,
} from "@/lib/filters";
import type { VariantView } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { loadView } from "@/lib/view";

export const metadata = { title: "Estoque" };

const SITUATIONS: readonly StockSituation[] = [
  "todos",
  "risco",
  "divergente",
  "sem-par",
];

export default async function EstoquePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { workspace, filters, analysis } = await loadView(params);
  const rows = analysis.variants.filter((variant) => matches(variant, filters));

  return (
    <>
      <PageIntro
        title="Estoque"
        description="Cada linha é uma variante. O cruzamento é o código de barras. Divergência é saldo Hiper menos saldo Nuvemshop."
      />
      {workspace.status === "awaiting-sync" ? (
        <EmptyState
          title="Estoque ainda vazio"
          body="Sincronize para trazer a grade do Hiper e o saldo publicado na Nuvemshop."
        />
      ) : (
        <>
          <form action="/estoque" className="mb-4 flex flex-col gap-3 sm:flex-row">
            <input type="hidden" name="situacao" value={filters.situation} />
            <Input
              name="q"
              defaultValue={filters.query}
              placeholder="Peça, cor, tamanho ou código"
              aria-label="Buscar no estoque"
            />
            <Button type="submit" variant="outline">
              Buscar
            </Button>
          </form>
          <div className="mb-4 flex flex-wrap gap-2">
            {SITUATIONS.map((situation) => {
              const search = new URLSearchParams();
              if (filters.query) search.set("q", filters.query);
              if (situation !== "todos") search.set("situacao", situation);
              const href = search.size > 0 ? `/estoque?${search.toString()}` : "/estoque";
              return (
                <Link
                  key={situation}
                  href={href}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs",
                    filters.situation === situation
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border",
                  )}
                >
                  {situationLabel(situation)}
                </Link>
              );
            })}
          </div>
          {rows.length === 0 ? (
            <EmptyState
              title="Nenhuma variante nesse filtro"
              body="Limpe a busca ou troque a situação. A grade completa continua na leitura."
            />
          ) : (
            <StockTable rows={rows} />
          )}
        </>
      )}
    </>
  );
}

function matches(
  variant: VariantView,
  filters: { query: string; situation: StockSituation },
): boolean {
  const haystack = `${variant.productName} ${variant.color} ${variant.size} ${variant.barcode} ${variant.category}`
    .toLowerCase();
  if (filters.query && !haystack.includes(filters.query.toLowerCase())) return false;
  switch (filters.situation) {
    case "todos":
      return true;
    case "risco":
      return variant.atRisk;
    case "divergente":
      return variant.divergence !== null && variant.divergence !== 0;
    case "sem-par":
      return variant.pair !== "pareado";
    default: {
      const exhaustive: never = filters.situation;
      return exhaustive;
    }
  }
}
