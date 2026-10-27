import { cache } from "react";
import { connection } from "next/server";

import { readCredentials, type Credentials } from "@/lib/credentials";
import { readStore } from "@/lib/store";
import type { CatalogVariant, DataMode, ManualMovement, Snapshot } from "@/lib/types";

export type WorkspaceStatus = "live" | "awaiting-sync";

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

  const live = store.snapshot?.mode === "live" ? store.snapshot : null;
  if (live && live.products.length > 0) {
    return assemble("live", "live", live, store.movements, [...live.warnings]);
  }

  return assemble(
    "live",
    "awaiting-sync",
    emptyLiveSnapshot(now),
    store.movements,
    waitingNotices(credentials),
  );
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

function waitingNotices(credentials: Credentials): string[] {
  if (credentials.hiperReady && credentials.nuvemshopReady) {
    return [
      "As chaves estão no ambiente. Sincronize para trazer produtos do Hiper e pedidos da Nuvemshop.",
    ];
  }
  if (credentials.hiperReady) {
    return [
      "A chave do Hiper está no ambiente. Sincronize para trazer o catálogo. A Nuvemshop ainda precisa do access token da loja.",
    ];
  }
  if (credentials.nuvemshopReady) {
    return [
      "O token da Nuvemshop está no ambiente. Falta a chave do Hiper. Sincronize para trazer os pedidos da loja.",
    ];
  }
  return [
    "Nenhuma fonte conectada. Coloque a chave do Hiper ou o access token da Nuvemshop e sincronize.",
  ];
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
