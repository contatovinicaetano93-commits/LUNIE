import { cache } from "react";
import { connection } from "next/server";

import { buildDemoSnapshot } from "@/lib/demo";
import { readCredentials } from "@/lib/credentials";
import { readStore } from "@/lib/store";
import type { CatalogVariant, DataMode, ManualMovement, Snapshot } from "@/lib/types";

export type WorkspaceStatus = "demo" | "live" | "awaiting-sync";

export type VariantOption = {
  barcode: string;
  label: string;
};

export type Workspace = {
  status: WorkspaceStatus;
  mode: DataMode;
  snapshot: Snapshot;
  movements: ManualMovement[];
  notices: string[];
  variantOptions: VariantOption[];
};

export const getWorkspace = cache(async function getWorkspace(): Promise<Workspace> {
  await connection();
  const credentials = readCredentials();
  const store = await readStore();
  const now = new Date();

  if (credentials.complete) {
    const snapshot =
      store.snapshot?.mode === "live" ? store.snapshot : emptyLiveSnapshot(now);
    const notices = [
      ...snapshot.warnings,
      ...(store.snapshot?.mode === "live"
        ? []
        : [
            "As chaves estão no ambiente. Sincronize para trazer produtos do Hiper e pedidos da Nuvemshop.",
          ]),
    ];
    return assemble("live", snapshot.products.length === 0 && store.snapshot?.mode !== "live" ? "awaiting-sync" : "live", snapshot, store.movements, notices);
  }

  const snapshot = buildDemoSnapshot(now);
  const notices = [
    "Demonstração. Os números são uma amostra da operação LUNIE até a chave do Hiper e o token da Nuvemshop entrarem no ambiente.",
  ];
  if (credentials.missing.length > 0 && credentials.missing.length < 3) {
    notices.push(
      `Falta configurar ${credentials.missing.join(", ")}. Enquanto isso o painel continua na amostra.`,
    );
  }
  return assemble("demo", "demo", snapshot, store.movements, notices);
});

function assemble(
  mode: DataMode,
  status: WorkspaceStatus,
  snapshot: Snapshot,
  movements: ManualMovement[],
  notices: string[],
): Workspace {
  const scoped = movements.filter((movement) => movement.scope === mode);
  return {
    status,
    mode,
    snapshot,
    movements: scoped,
    notices,
    variantOptions: optionsFrom(snapshot),
  };
}

function optionsFrom(snapshot: Snapshot): VariantOption[] {
  const options: VariantOption[] = [];
  for (const product of snapshot.products) {
    for (const variant of product.variants) {
      if (!variant.barcode) continue;
      options.push({
        barcode: variant.barcode,
        label: optionLabel(variant),
      });
    }
  }
  options.sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
  return options;
}

function optionLabel(variant: CatalogVariant): string {
  return `${variant.productName} · ${variant.color} · ${variant.size} · ${variant.barcode}`;
}

function emptyLiveSnapshot(now: Date): Snapshot {
  return {
    mode: "live",
    syncedAt: now.toISOString(),
    products: [],
    sales: [],
    warnings: [],
  };
}
