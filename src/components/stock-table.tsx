import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { VariantView } from "@/lib/analytics";
import { formatCover, formatNumber, pairLabel } from "@/lib/format";

export function StockTable({ rows }: { rows: VariantView[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Peça</TableHead>
          <TableHead>Código</TableHead>
          <TableHead className="text-right">Hiper</TableHead>
          <TableHead className="text-right">Nuvemshop</TableHead>
          <TableHead className="text-right">Mínimo</TableHead>
          <TableHead className="text-right">Planejado</TableHead>
          <TableHead className="text-right">Cobertura</TableHead>
          <TableHead>Par</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>
              <div className="font-medium">{row.productName}</div>
              <div className="text-xs text-muted-foreground">
                {row.color} · {row.size}
                {row.category ? ` · ${row.category}` : ""}
              </div>
            </TableCell>
            <TableCell className="font-mono text-xs">
              {row.barcode || "—"}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              <StockValue value={row.hiperStock} />
            </TableCell>
            <TableCell className="text-right tabular-nums">
              <StockValue value={row.nuvemshopStock} />
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatNumber(row.minStock)}
            </TableCell>
            <TableCell className="text-right tabular-nums">
              {formatNumber(row.planningStock)}
              {row.manualNet !== 0 ? (
                <div className="text-xs text-muted-foreground">
                  {row.manualNet > 0 ? "+" : ""}
                  {formatNumber(row.manualNet)} local
                </div>
              ) : null}
            </TableCell>
            <TableCell
              className={`text-right tabular-nums ${row.atRisk ? "text-destructive" : ""}`}
            >
              {formatCover(row.coverDays)}
            </TableCell>
            <TableCell>
              <Badge variant={row.pair === "pareado" ? "outline" : "secondary"}>
                {pairLabel(row.pair)}
                {row.divergence !== null && row.divergence !== 0
                  ? ` ${row.divergence > 0 ? "+" : ""}${formatNumber(row.divergence)}`
                  : ""}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function StockValue({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground">—</span>;
  return formatNumber(value);
}
