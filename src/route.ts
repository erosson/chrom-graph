export enum Route {
  home = "/",
  chromGraph = "/chrom-graph/:figure?",
  chromGraphGen = "/chrom-graph-gen/:figure?",
}
export function chromGraph(figure?: string): string {
  return Route.chromGraph.replace(":figure?", figure ?? "");
}
export function chromGraphGen(figure?: string): string {
  return Route.chromGraphGen.replace(":figure?", figure ?? "");
}
