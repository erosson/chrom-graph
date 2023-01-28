export enum Route {
  home = "/",
  chromGraph = "/chrom-graph/:figure?",
}
export function chromGraph(figure?: string): string {
  return Route.chromGraph.replace(":figure?", figure ?? "");
}
