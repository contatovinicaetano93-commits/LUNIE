import { NextResponse } from "next/server";

import { readCredentials } from "@/lib/credentials";
import { pullSnapshot } from "@/lib/sources/load";
import { saveSnapshot } from "@/lib/store";

export async function POST() {
  const credentials = readCredentials();
  try {
    const snapshot = await pullSnapshot(credentials, new Date());
    if (snapshot.mode === "live") {
      await saveSnapshot(snapshot);
    }
    return NextResponse.json({
      ok: true,
      mode: snapshot.mode,
      syncedAt: snapshot.syncedAt,
      warnings: snapshot.warnings,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Falha ao sincronizar as fontes.";
    return NextResponse.json({ ok: false, message }, { status: 502 });
  }
}
