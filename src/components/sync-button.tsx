"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function SyncButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sync() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch("/api/sync", { method: "POST" });
      const payload: unknown = await response.json();
      const message =
        payload &&
        typeof payload === "object" &&
        "message" in payload &&
        typeof payload.message === "string"
          ? payload.message
          : "Não foi possível sincronizar.";
      if (!response.ok) {
        setError(message);
        return;
      }
      router.refresh();
    } catch {
      setError("A sincronização não respondeu.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant="outline" onClick={sync} disabled={pending}>
        <RefreshCwIcon className={pending ? "animate-spin" : undefined} />
        {pending ? "Sincronizando" : "Sincronizar"}
      </Button>
      {error ? (
        <p className="max-w-xs text-right text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
