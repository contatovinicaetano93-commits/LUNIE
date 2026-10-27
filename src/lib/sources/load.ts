import { buildSnapshot } from "@/lib/merge";
import { fetchHiperVariants } from "@/lib/sources/hiper";
import { fetchNuvemshopSales, fetchNuvemshopVariants } from "@/lib/sources/nuvemshop";
import type { Credentials } from "@/lib/credentials";
import type { RawSale, Snapshot, SourceVariant } from "@/lib/types";

export async function pullSnapshot(
  credentials: Credentials,
  now: Date,
): Promise<Snapshot> {
  if (!credentials.hiperReady && !credentials.nuvemshopReady) {
    throw new Error(
      "Nenhuma fonte conectada. Informe a chave do Hiper ou o access token da Nuvemshop.",
    );
  }
  const since = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000);
  const notes: string[] = [];
  const hiper = credentials.hiperReady ? await fetchHiperVariants(credentials) : [];
  if (!credentials.hiperReady) {
    notes.push("Falta a chave do Hiper. O saldo do ERP não entra nesta leitura.");
  }
  let nuvemshop: SourceVariant[] = [];
  let sales: RawSale[] = [];
  if (credentials.nuvemshopReady) {
    [nuvemshop, sales] = await Promise.all([
      fetchNuvemshopVariants(credentials),
      fetchNuvemshopSales(credentials, since),
    ]);
  } else {
    notes.push(
      "A Nuvemshop ainda não entra. O ID e o segredo do aplicativo não leem a loja: falta o access token da instalação e o store id.",
    );
  }
  const snapshot = buildSnapshot({
    mode: "live",
    syncedAt: now.toISOString(),
    hiper,
    nuvemshop,
    sales,
  });
  return { ...snapshot, warnings: [...notes, ...snapshot.warnings] };
}
