import type { ReactNode } from "react";
import { Suspense } from "react";

import { AppShell } from "@/components/app-shell";
import { LunieMark } from "@/components/lunie-mark";
import { getWorkspace } from "@/lib/catalog";

export const instant = false;

export default function AdminPanelLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<BootScreen />}>
      <Shell>{children}</Shell>
    </Suspense>
  );
}

async function Shell({ children }: { children: ReactNode }) {
  const workspace = await getWorkspace();
  return <AppShell workspace={workspace}>{children}</AppShell>;
}

function BootScreen() {
  return (
    <div className="px-6 py-10">
      <LunieMark />
      <p className="mt-3 text-sm text-muted-foreground">Abrindo a leitura...</p>
    </div>
  );
}
