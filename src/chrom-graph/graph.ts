import * as N from "./node";
import * as F from "./figure";
import * as C from "./collide";
import * as G from "graphology";
import * as CT from "sigma/types";

export {byName} from './figure'

type Graph = G.default<
  Partial<CT.NodeDisplayData>,
  Partial<CT.EdgeDisplayData>
>;

function empty(): Graph {
  return new G.UndirectedGraph({
    allowSelfLoops: false,
    multi: false,
    type: "undirected",
  });
}

function renderNode(node: N.Node): Partial<CT.NodeDisplayData> {
  const xy = N.toXY(node.coords);
  return {
    color: node.color ?? "black",
    label: node.label
      ? `${node.label} (${node.id})@${JSON.stringify(xy)}`
      : `${node.id}@${JSON.stringify(xy)}`,
    size: 5,
    ...xy,
  };
}

function toGraph(d: N.Figure): G.default {
  const g = empty();
  for (let node of d.nodes) {
    g.addNode(node.id, renderNode(node));
  }
  for (let [a, b] of d.edges) {
    g.addEdge(a, b);
  }
  return g;
}

interface GraphOutput {
  graph: Graph;
  collide: C.Collide;
  fig: N.Node[];
  instance: F.Instance;
  elapsedLoad: number;
  elapsedCollide: number;
}
export function buildGraph(instance: F.Instance): GraphOutput {
  const tsA = Date.now();
  const fig = instance.figure(instance.name);
  const tsB = Date.now();
  const collide = C.collide(fig);
  const tsC = Date.now();
  const elapsedLoad = tsB - tsA;
  const elapsedCollide = tsC - tsB;
  const graph = toGraph(collide.fig);
  return { graph, collide, fig, instance, elapsedLoad, elapsedCollide };
}
