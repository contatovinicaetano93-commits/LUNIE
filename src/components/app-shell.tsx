import type { ReactNode } from "react";

import { LunieMark } from "@/components/lunie-mark";
import { Badge } from "@/components/ui/badge";
import { MovementDialog } from "@/components/movement-dialog";
import { NavLinks } from "@/components/nav-links";
import { SyncButton } from "@/components/sync-button";
import { formatDateTime } from "@/lib/format";
import type { Workspace, WorkspaceStatus } from "@/lib/catalog";

export function AppShell({
  workspace,
  children,
}: {
  workspace: Workspace;
  children: ReactNode;
}) {
  return (
    <div className="min-h-full">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <LunieMark />
              <p className="mt-2 text-sm font-medium text-foreground/80">
                Estoque, saída e reposição
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={workspace.status === "demo" ? "secondary" : "default"}>
                {statusLabel(workspace.status)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {workspace.status === "awaiting-sync"
                  ? "Ainda sem leitura"
                  : formatDateTime(workspace.snapshot.syncedAt)}
              </span>
              <SyncButton />
              <MovementDialog options={workspace.variantOptions} />
            </div>
          </div>
          <NavLinks />
        </div>
      </header>
      {workspace.notices.length > 0 ? (
        <div className="border-b border-border bg-card">
          <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3 sm:px-6">
            {workspace.notices.map((notice) => (
              <p key={notice} className="text-sm text-muted-foreground">
                {notice}
              </p>
            ))}
          </div>
        </div>
      ) : null}
      <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}

function statusLabel(status: WorkspaceStatus): string {
  switch (status) {
    case "demo":
      return "Demonstração";
    case "live":
      return "Ao vivo";
    case "awaiting-sync":
      return "Aguardando sincronização";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}
