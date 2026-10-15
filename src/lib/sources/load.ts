import { buildDemoSnapshot } from "@/lib/demo";
import { buildSnapshot } from "@/lib/merge";
import { fetchHiperVariants } from "@/lib/sources/hiper";
import { fetchNuvemshopSales, fetchNuvemshopVariants } from "@/lib/sources/nuvemshop";
import type { Credentials } from "@/lib/credentials";
import type { Snapshot } from "@/lib/types";

export async function pullSnapshot(
  credentials: Credentials,
  now: Date,
): Promise<Snapshot> {
  if (!credentials.complete) {
    return buildDemoSnapshot(now);
  }
  const since = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000);
  const [hiper, nuvemshop, sales] = await Promise.all([
    fetchHiperVariants(credentials),
    fetchNuvemshopVariants(credentials),
    fetchNuvemshopSales(credentials, since),
  ]);
  return buildSnapshot({
    mode: "live",
    syncedAt: now.toISOString(),
    hiper,
    nuvemshop,
    sales,
  });
}
