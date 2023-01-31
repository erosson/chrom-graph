// p cnf num-vars num-clauses
// c this is a comment
// c -1: NOT 1
// c 1 2 3: 1 OR 2 OR 3
// c 1\n2: 1 AND 2
//
// loop over verts: every vert must have a color. 1 var per color per vert. multiple colors okay?!
// loop over edges: every edge must join two *different* colors.

import { range } from "../../util/math.js";
import * as N from "../node.js";
import * as X from './lookup.js'

// CNF file code generation.
// All lines (clauses) are ANDed together; all vars on each line are ORed together.
// Negative means NOT. Each number is a variable - except 0, which is EOL.
//
// For example:
// 1 -2 -3 0
// 4 5 0
// means
// (1 OR (NOT 2) OR (NOT 3)) AND (4 OR 5)
export interface InputFile {
  type: "input-file";
  header: Header;
  body: Line[];
}
export interface Header {
  // The first line of every CNF file.
  // `p cnf varCount clauseCount`
  type: "header";
  varCount: number;
  clauseCount: number;
}
export type Line = Comment | Clause;
export interface Comment {
  // `c this is a comment blah blah blah`
  type: "comment";
  comment: string;
}
export interface Clause {
  // `1 2 -3 -4 5 0`
  // meaning: 1 OR 2 OR (NOT 3) OR (NOT 4) OR 5;
  type: "clause";
  values: Value[];
}
export type Value = Var | Negate;
export interface Var {
  type: "var";
  name: number;
}
export interface Negate {
  type: "negate";
  v: Var;
}

function inputFile(header: Header, body: Line[]): InputFile {
  return { type: "input-file", header, body };
}
function header(h: Omit<Header, "type">): Header {
  return { type: "header", ...h };
}
function comment(comment: string): Line {
  return { type: "comment", comment };
}
function clause(values: Value[]): Line {
  return { type: "clause", values };
}
function var_(entry: X.VarEntry): Var {
  return { type: "var", name: entry.cnfVar };
}
function negate(v: Var): Value {
  return { type: "negate", v };
}
export type Element = InputFile | Header | Comment | Clause | Var | Negate;
export function render(el: Element): string {
  switch (el.type) {
    case "input-file":
      return [el.header as Element].concat(el.body).map(render).join("\n");
    case "header":
      return `p cnf ${el.varCount} ${el.clauseCount}`;
    case "comment":
      return `c ${el.comment}`;
    case "clause":
      return `${el.values.map(render).join(" ")} 0`;
    case "var":
      return `${el.name}`;
    case "negate":
      return `-${render(el.v)}`;
    default:
      throw new Error(`invalid element type`);
  }
}

export function toInputFile(fig: N.Figure, colors: X.ColorID[]): InputFile {
  const index = X.toVarIndex(fig.nodes.map(n => n.id), colors);
  const atLeastOneColorPerVar = fig.nodes.flatMap((node) => {
    const entries = index.byNodeId[node.id];
    return [
      comment(`node "${node.id}" must have at least one color`),
      clause(entries.map(var_)),
    ];
  });
  const adjacentNodesMustBeDifferentColors = fig.edges.flatMap((edge) => {
    const as = index.byNodeId[edge[0]];
    const bs = index.byNodeId[edge[1]];
    return [
      comment(
        `nodes "${edge[0]}" and "${edge[1]}" may not have the same color`
      ),
      ...as.map((a, i) => {
        const b = bs[i];
        return clause([negate(var_(a)), negate(var_(b))]);
      }),
    ];
  });
  const body: Line[] = [
    ...atLeastOneColorPerVar,
    ...adjacentNodesMustBeDifferentColors,
  ];
  const head = header({
    clauseCount: body.filter(l => l.type === 'clause').length,
    varCount: index.list.length,
  });
  return inputFile(head, body)
}
