import { groupBy } from "../../util/schema.js";
import * as N from "../node.js";

// CNF file variables are just numbers, borderline human-unreadable. Map them to our string node names.
// cnfVar === nodeId + color. For a 4-color file, 1 nodeId has 4 VarEntrys
export type ColorID = string;
export interface VarEntry {
  cnfVar: number;
  nodeId: N.ID;
  color: ColorID;
}
export interface VarIndex {
  list: VarEntry[];
  byNodeId: Record<N.ID, VarEntry[]>;
}

export function toVarIndex(nodeIds: string[], colors: ColorID[]): VarIndex {
  const list = nodeIds
    .map((node, i) => {
      return colors.map((color, j) => {
        const cnfVar = i * colors.length + j + 1;
        return { cnfVar, color, nodeId: node };
      });
    })
    .flat();
  return {
    list,
    byNodeId: groupBy<N.ID, VarEntry>(
      nodeIds,
      list,
      (v) => v.nodeId
    ),
  };
}
