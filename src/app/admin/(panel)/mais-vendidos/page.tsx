import { Suspense } from "react";

import { EmptyState, PageIntro } from "@/components/page-intro";
import { PeriodBar } from "@/components/period-bar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RankRow } from "@/lib/analytics";
import { formatBRL, formatNumber } from "@/lib/format";
import { windowLabel } from "@/lib/filters";
import { loadView } from "@/lib/view";

export const metadata = { title: "Mais vendidos" };

export default async function MaisVendidosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { filters, analysis } = await loadView(params);

  return (
    <>
      <PageIntro
        title="Mais vendidos"
        description={`Ranking de pedidos pagos em ${windowLabel(filters.windowDays)}. Cancelados não entram.`}
      />
      <Suspense fallback={null}>
        <PeriodBar />
      </Suspense>
      <section>
        <h2 className="mb-3 font-display text-2xl">Por peça</h2>
        <RankTable
          rows={analysis.bestsellersProducts}
          empty="Nenhuma peça vendida nessa janela."
        />
      </section>
      <section className="mt-8">
        <h2 className="mb-3 font-display text-2xl">Por variante</h2>
        <RankTable
          rows={analysis.bestsellersVariants}
          empty="Nenhuma variante vendida nessa janela."
        />
      </section>
    </>
  );
}

function RankTable({ rows, empty }: { rows: RankRow[]; empty: string }) {
  if (rows.length === 0) {
    return <EmptyState title="Sem vendas no período" body={empty} />;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Peça</TableHead>
          <TableHead className="text-right">Unidades</TableHead>
          <TableHead className="text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={row.id}>
            <TableCell className="tabular-nums text-muted-foreground">
              {index + 1}
            </TableCell>
            <TableCell>
              <div className="font-medium">{row.name}</div>
              <div className="text-xs text-muted-foreground">{row.detail}</div>
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatNumber(row.units)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatBRL(row.revenue)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
