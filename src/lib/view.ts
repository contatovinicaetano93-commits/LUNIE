import { analyze, type Analysis } from "@/lib/analytics";
import { getWorkspace, type Workspace } from "@/lib/catalog";
import { parseFilters, type ViewFilters } from "@/lib/filters";

export async function loadView(
  params: Record<string, string | string[] | undefined>,
): Promise<{ workspace: Workspace; filters: ViewFilters; analysis: Analysis }> {
  const workspace = await getWorkspace();
  const filters = parseFilters(params);
  const analysis = analyze({
    snapshot: workspace.snapshot,
    movements: workspace.movements,
    windowDays: filters.windowDays,
    coverTarget: filters.coverTarget,
    now: new Date(),
  });
  return { workspace, filters, analysis };
}
