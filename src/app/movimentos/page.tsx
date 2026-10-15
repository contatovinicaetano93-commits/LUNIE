import Link from "next/link";

import { EmptyState, PageIntro } from "@/components/page-intro";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MovementTone } from "@/lib/analytics";
import { movementFilterLabel, type MovementFilter } from "@/lib/filters";
import { formatDateTime, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { loadView } from "@/lib/view";

export const metadata = { title: "Movimentos" };

const FILTERS: readonly MovementFilter[] = [
  "todos",
  "entradas",
  "saidas",
  "cancelados",
];

export default async function MovimentosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { filters, analysis } = await loadView(params);
  const rows = analysis.movements.filter((row) => visible(row.tone, filters.movement));

  return (
    <>
      <PageIntro
        title="Movimentos"
        description="Saídas pagas vêm dos pedidos da Nuvemshop. Entradas e saídas com origem Registro local existem só neste painel e entram na cobertura."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((filter) => {
          const href = filter === "todos" ? "/movimentos" : `/movimentos?tipo=${filter}`;
          return (
            <Link
              key={filter}
              href={href}
              className={cn(
                "rounded-full border px-3 py-1 text-xs",
                filters.movement === filter
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border",
              )}
            >
              {movementFilterLabel(filter)}
            </Link>
          );
        })}
      </div>
      {rows.length === 0 ? (
        <EmptyState
          title="Nenhum movimento nessa leitura"
          body="Pedidos pagos aparecem como saída. Uma entrada de reposição se registra pelo botão Registrar."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Quando</TableHead>
              <TableHead>Peça</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead className="text-right">Qtd.</TableHead>
              <TableHead>Nota</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="whitespace-nowrap">
                  {formatDateTime(row.createdAt)}
                </TableCell>
                <TableCell>
                  <div>{row.label}</div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {row.barcode || "sem código"}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={badgeVariant(row.tone)}>{toneLabel(row.tone)}</Badge>
                </TableCell>
                <TableCell>{row.origin}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNumber(row.quantity)}
                </TableCell>
                <TableCell className="max-w-xs whitespace-normal text-muted-foreground">
                  {row.note}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}

function visible(tone: MovementTone, filter: MovementFilter): boolean {
  switch (filter) {
    case "todos":
      return true;
    case "entradas":
      return tone === "entrada";
    case "saidas":
      return tone === "saida";
    case "cancelados":
      return tone === "cancelado";
    default: {
      const exhaustive: never = filter;
      return exhaustive;
    }
  }
}

function toneLabel(tone: MovementTone): string {
  switch (tone) {
    case "entrada":
      return "Entrada";
    case "saida":
      return "Saída";
    case "cancelado":
      return "Cancelado";
    case "pendente":
      return "Pendente";
    default: {
      const exhaustive: never = tone;
      return exhaustive;
    }
  }
}

function badgeVariant(
  tone: MovementTone,
): "default" | "secondary" | "destructive" | "outline" {
  switch (tone) {
    case "entrada":
      return "default";
    case "saida":
      return "outline";
    case "cancelado":
      return "destructive";
    case "pendente":
      return "secondary";
    default: {
      const exhaustive: never = tone;
      return exhaustive;
    }
  }
}
