import { NextResponse } from "next/server";

import { getWorkspace } from "@/lib/catalog";
import { appendMovement } from "@/lib/store";
import type { MovementKind } from "@/lib/types";

type MovementBody = {
  barcode?: unknown;
  quantity?: unknown;
  note?: unknown;
  kind?: unknown;
};

export async function POST(request: Request) {
  let body: MovementBody;
  try {
    body = (await request.json()) as MovementBody;
  } catch {
    return NextResponse.json(
      { ok: false, message: "O registro chegou incompleto." },
      { status: 400 },
    );
  }

  const kind = parseKind(body.kind);
  if (!kind) {
    return NextResponse.json(
      { ok: false, message: "Escolha entrada ou saída." },
      { status: 400 },
    );
  }

  const barcode = typeof body.barcode === "string" ? body.barcode.trim() : "";
  const quantity = Number(body.quantity);
  const note = typeof body.note === "string" ? body.note.trim().slice(0, 180) : "";

  if (!barcode) {
    return NextResponse.json(
      { ok: false, message: "Informe o código de barras." },
      { status: 400 },
    );
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 9999) {
    return NextResponse.json(
      { ok: false, message: "A quantidade precisa ser um inteiro entre 1 e 9999." },
      { status: 400 },
    );
  }

  const workspace = await getWorkspace();
  const known = workspace.variantOptions.some((option) => option.barcode === barcode);
  if (!known) {
    return NextResponse.json(
      { ok: false, message: "Esse código não está na leitura atual." },
      { status: 400 },
    );
  }

  await appendMovement({
    scope: workspace.mode,
    barcode,
    kind,
    quantity,
    note: note || defaultNote(kind),
  });

  return NextResponse.json({ ok: true });
}

function parseKind(value: unknown): MovementKind | null {
  switch (value) {
    case "entrada":
    case "saida":
      return value;
    default:
      return null;
  }
}

function defaultNote(kind: MovementKind): string {
  switch (kind) {
    case "entrada":
      return "Entrada registrada no painel";
    case "saida":
      return "Saída registrada no painel";
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}
