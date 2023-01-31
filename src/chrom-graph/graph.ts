import * as N from "./node.js";
import * as F from "./figure.js";
import * as C from "./collide.js";
import * as G from "graphology";
import * as CT from "sigma/types.js";
import * as CNF from "./cnf/lookup.js";
import * as CNFI from "./cnf/input-file.js";

export { byName } from "./figure.js";

interface GraphOutput {
  graph: Graph;
  collide: C.Collide;
  fig: N.Node[];
  instance: F.Instance;
  elapsedLoad: number;
  elapsedCollide: number;
  cnfIndex: CNF.VarIndex;
  cnfFile: CNFI.InputFile;
  cnfInput: string;
}

export type Graph = G.default<
  Partial<CT.NodeDisplayData>,
  Partial<CT.EdgeDisplayData>
>;

export function empty(): Graph {
  // @ts-expect-error graphology-types seems screwy here
  return new G.default({
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

export function buildGraph(instance: F.Instance): GraphOutput {
  const tsA = Date.now();
  const fig = instance.figure(instance.name);
  const tsB = Date.now();
  const collide = C.collide(fig);
  const tsC = Date.now();
  const elapsedLoad = tsB - tsA;
  const elapsedCollide = tsC - tsB;
  const graph = toGraph(collide.fig);
  const cnfIndex = CNF.toVarIndex(collide.fig.nodes.map(n => n.id), N.colors);
  const cnfFile = CNFI.toInputFile(collide.fig, N.colors);
  const cnfInput = CNFI.render(cnfFile)
  return {
    graph,
    collide,
    fig,
    instance,
    elapsedLoad,
    elapsedCollide,
    cnfIndex,
    cnfFile,
    cnfInput,
  };
}
