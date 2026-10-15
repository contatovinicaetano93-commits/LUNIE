import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import type { DataMode, ManualMovement, MovementKind, Snapshot } from "@/lib/types";

type StoreFile = {
  snapshot: Snapshot | null;
  movements: ManualMovement[];
};

const filePath = process.env.VERCEL
  ? path.join("/tmp", "lunie.json")
  : path.join(process.cwd(), "data", "lunie.json");

let queue: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function readFileStore(): Promise<StoreFile> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      throw new Error("O arquivo local de estoque está ilegível.");
    }
    const record = parsed as Partial<StoreFile>;
    return {
      snapshot: record.snapshot ?? null,
      movements: Array.isArray(record.movements) ? record.movements : [],
    };
  } catch (error) {
    if (isMissingFile(error)) {
      return { snapshot: null, movements: [] };
    }
    throw error;
  }
}

function isMissingFile(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}

async function writeFileStore(store: StoreFile): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(store, null, 2), "utf8");
}

export function readStore(): Promise<StoreFile> {
  return enqueue(() => readFileStore());
}

export function saveSnapshot(snapshot: Snapshot): Promise<void> {
  return enqueue(async () => {
    const store = await readFileStore();
    store.snapshot = snapshot;
    await writeFileStore(store);
  });
}

export function appendMovement(input: {
  scope: DataMode;
  barcode: string;
  kind: MovementKind;
  quantity: number;
  note: string;
}): Promise<ManualMovement> {
  return enqueue(async () => {
    const store = await readFileStore();
    const movement: ManualMovement = {
      id: crypto.randomUUID(),
      scope: input.scope,
      createdAt: new Date().toISOString(),
      barcode: input.barcode,
      kind: input.kind,
      quantity: input.quantity,
      note: input.note,
    };
    store.movements.push(movement);
    await writeFileStore(store);
    return movement;
  });
}
