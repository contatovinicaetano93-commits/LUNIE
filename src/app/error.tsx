"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="rounded-xl border border-dashed border-border px-4 py-12 text-center">
      <p className="font-display text-2xl">A leitura não abriu</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {error.message || "Algo interrompeu o painel. Tente de novo."}
      </p>
      <Button type="button" className="mt-4" onClick={reset}>
        Tentar de novo
      </Button>
    </div>
  );
}
