import { range } from "../../util/math.js";
import * as N from "../node.js";
import * as X from "./lookup.js";
import * as G from "../graph.js";

// CNF output file parsing.
// Either looks like:
// ```
// SAT
// 1 2 3 4 ...
// ```
// or
// ```
// UNSAT
// ```
// This is a simple enough format that we don't need to write a proper parser.
export type Output = OutputSat | OutputUnsat;
export interface OutputUnsat {
  type: "output-unsat";
}
export interface OutputSat {
  type: "output-sat";
  vars: Set<number>;
}
export function parse(body: string): Output {
  if (body.startsWith("UNSAT")) {
    return { type: "output-unsat" };
  }
  if (body.startsWith("SAT")) {
    const vars = new Set(
      body
        // trim the leading "SAT\n" and the trailing " 0"
        .slice(3, -2)
        .trim()
        // parse vars as numbers
        .split(" ")
        .map((n) => parseInt(n))
    );
    return { type: "output-sat", vars };
  }
  throw new Error("unknown sat file output");
}
export function colorize(
  graph: G.Graph,
  colors: X.ColorID[],
  out: OutputSat
): G.Graph {
  const o = graph.copy();
  const nodeIds = graph.nodes();
  const index = X.toVarIndex(nodeIds, colors);
  for (let node of nodeIds) {
    const entries = index.byNodeId[node];
    let color = false;
    for (let entry of entries) {
      // if (out.vars.has(-entry.cnfVar)) {
      // not this color
      // }
      if (out.vars.has(entry.cnfVar)) {
        color = true;
        o.setNodeAttribute(node, "color", entry.color);
      }
    }
    if (!color)
      throw new Error(
        `no color for node ${node}, cnf vars ${entries
          .map((e) => e.cnfVar)
          .join(", ")}, output ${JSON.stringify(Array.from(out.vars))}`
      );
  }
  return o;
}
