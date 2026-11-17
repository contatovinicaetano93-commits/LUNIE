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
import { formatCover, formatNumber } from "@/lib/format";
import { loadView } from "@/lib/view";

export const metadata = { title: "Reposição" };

export default async function ReposicaoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { filters, analysis } = await loadView(params);
  const query = filters.query.toLowerCase();
  const rows = analysis.replenishment.filter((row) => {
    if (!query) return true;
    return `${row.productName} ${row.color} ${row.size} ${row.barcode}`
      .toLowerCase()
      .includes(query);
  });

  return (
    <>
      <PageIntro
        title="Reposição"
        description={`Sugestão = velocidade diária × ${formatNumber(filters.coverTarget)} dias, menos o saldo de planejamento. A velocidade usa só pedidos pagos da janela.`}
      />
      <Suspense fallback={null}>
        <PeriodBar showCover />
      </Suspense>
      {rows.length === 0 ? (
        <EmptyState
          title="Nada a repor nessa conta"
          body="Nenhuma variante venderia mais do que o saldo cobre até o alvo. Se a grade está torta, o alerta aparece em Insights."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Peça</TableHead>
              <TableHead className="text-right">Saldo</TableHead>
              <TableHead className="text-right">Vendidas</TableHead>
              <TableHead className="text-right">Cobertura</TableHead>
              <TableHead className="text-right">Comprar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>
                  <div className="font-medium">{row.productName}</div>
                  <div className="text-xs text-muted-foreground">
                    {row.color} · {row.size}
                    {row.barcode ? ` · ${row.barcode}` : ""}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(row.planningStock)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(row.unitsSold)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCover(row.coverDays)}
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums text-primary">
                  {formatNumber(row.suggested)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
