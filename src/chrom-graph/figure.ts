import {
  Node,
  Edge,
  xy,
  polar,
  degrees,
  sumCoords,
  rotate,
  translate,
  radians,
  rotateAbout,
  negate,
  piRadians,
  toRadians,
  toXY,
  mapCoords,
  negateAngle,
  Angle,
  recenter,
  Coords,
  scaleAngle,
} from "./node.js";
import { range, sum } from "../util/math.js";
import { distance } from "./collide.js";
import { flow, pipe } from "fp-ts/lib/function.js";
import * as C from "./collide.js";
import { keyBy } from "../util/schema.js";

export interface Instance {
  name: string;
  label?: string;
  figure: (s: string) => Node[];
}
export const list: readonly Instance[] = [
  { name: "figure1", figure: figure1, label: "Figure 1" },
  { name: "figure2", figure: figure2, label: "Figure 2" },
  { name: "figure4", figure: figure4, label: "Figure 4" },
  { name: "figure5", figure: figure5, label: "Figure 5" },
  { name: "figure7a", figure: figure7a, label: "Figure 7a (Moser spindle)" },
  { name: "figure7b", figure: figure7b, label: "Figure 7b" },
  { name: "figure7c", figure: figure7c, label: "Figure 7c" },
  { name: "figureW", figure: figureW, label: "Graph W" },
  { name: "figure8", figure: figure8, label: "Figure 8/graph M" },
  { name: "figurePreN2", figure: figurePreN2, label: "Figure 2-preN" },
  { name: "figurePreN4", figure: figurePreN4, label: "Figure 4-preN" },
  { name: "figurePreN5", figure: figurePreN5, label: "Figure 5-preN" },
  {
    name: "section51",
    figure: section51,
    label:
      "Section 5.1 (This shouldn't be 4-colorable, I've clearly messed something up)",
  },
];
export const byName: Record<string, Instance> = keyBy(list, (i) => i.name);

export function figure1(name: string): Node[] {
  const origin = {
    id: `${name}-0`,
    label: "origin-H",
    coords: xy(0, 0),
    // color: Color.a
  };
  const orbit = range(6).map((i) => ({
    id: `${name}-${i + 1}`,
    // color: i % 2 === 0 ? Color.b : Color.c,
    coords: polar(1, degrees(60 * i)),
  }));
  return [origin, ...orbit];
}

export function figure2(name: string): Node[] {
  const origin = figure1(`${name}-0`);
  const orbit1 = range(6).map((i) => {
    return mapCoords(
      figure1(`${name}-${i + 1}`),
      flow((c) => translate(c, polar(1, degrees(i * 60))))
    );
  });
  const orbit2 = range(6).map((i) => {
    return mapCoords(
      figure1(`${name}-${i + 7}`),
      flow(
        (c) => translate(c, polar(1, degrees(i * 60))),
        (c) => translate(c, polar(1, degrees((i + 1) * 60)))
      )
    );
  });
  return [...origin, ...orbit1.flat(), ...orbit2.flat()];
}

export function _figure4(name: string): Node[] {
  const a = figure2(`${name}-0`);
  const b0 = figure2(`${name}-1`);
  const b = b0.map((n) => ({
    ...n,
    coords: rotate(n.coords, radians(-2 * Math.asin(1 / 4))),
  }));
  return [...a, ...b];
}
export function figure4(name: string): Node[] {
  const fig0 = _figure4(name);
  // manually inspected the graph to find the desired node ids
  const idA = `${name}-0-3-5`;
  const idB = `${name}-0-1-6`;
  const a = fig0.find((n) => n.id === idA);
  const b = fig0.find((n) => n.id === idB);
  if (!a) throw new Error("figure 4: couldn't find node A");
  if (!b) throw new Error("figure 4: couldn't find node B");
  a.label = "A";
  a.color = "red";
  b.label = "B";
  b.color = "blue";
  return fig0;
}

export function figure5(name: string): Node[] {
  const fig0 = figure4(`${name}-0`);
  const a = fig0.find((n) => n.label === "A");
  const b = fig0.find((n) => n.label === "B");
  if (!a) throw new Error("figure 5: couldn't find node A");
  if (!b) throw new Error("figure 5: couldn't find node B");
  const fig1 = fig0.map((n) => ({
    ...n,
    id: n.id.replace(new RegExp(`^${name}-0-`), `${name}-1-`),
    ...(n.label === "B" ? { label: "B'" } : {}),
    coords: rotateAbout(n.coords, radians(-2 * Math.asin(1 / 8)), a.coords),
  }));
  return [...fig0, ...fig1].map((n) => ({
    ...n,
    // inspecting manually, this gets us close to y-axis symmetry
    coords: rotate(n.coords, degrees(97)),
  }));
}

/**
 * Equilateral triangle; 60 degree angles
 */
export function triangle60(name: string): Node[] {
  const o = {
    id: `${name}-0`,
    label: "O",
    coords: xy(0, 0),
  };
  const a = {
    id: `${name}-1`,
    coords: polar(1, degrees(0)),
  };
  const b = {
    id: `${name}-2`,
    coords: polar(1, degrees(60)),
  };
  return [o, a, b];
}
export function rhombus60(name: string): Node[] {
  const [o, a, b] = triangle60(name);
  const c = {
    id: `${name}-3`,
    label: "C",
    coords: translate(a.coords, b.coords),
  };
  return [o, a, b, c];
}

function moserSpindleAngle(): Angle {
  // In a Moser spindle, the distance between r1c and r2c must be 1.
  // What angle `a` do we rotate r2 to construct that? High school geometry will tell.
  //
  // given: r1c = (0, 0); r2c = (1, 0); r1o === r2o; o.x = 0.5
  // find angle a
  const hyp = distance(toXY(rhombus60Hyp()));
  return radians(Math.asin(0.5 / hyp));
}
function rhombus60Hyp(): Coords {
  const r0 = rhombus60("");
  return r0[3].coords;
}
/**
 * Moser spindle
 */
export function figure7a(name: string): Node[] {
  const hyp = rhombus60Hyp();
  const a = moserSpindleAngle();
  const r1 = mapCoords(
    rhombus60(`${name}-0`),
    flow(
      (c) => recenter(c, hyp),
      (c) => rotate(c, degrees(180)),
      (c) => rotate(c, degrees(60)),
      (c) => rotate(c, negateAngle(a))
    )
  );
  const r2 = mapCoords(
    rhombus60(`${name}-1`),
    flow(
      (c) => recenter(c, hyp),
      (c) => rotate(c, degrees(180)),
      (c) => rotate(c, degrees(60)),
      (c) => rotate(c, a),
      (c) => translate(c, xy(1, 0))
    )
  );
  const ret = [...r1, ...r2];
  // to support other transforms, set point o back to the origin.
  // also rotate it so it looks like figure 7a
  return mapCoords(
    ret,
    flow(
      (c) => recenter(c, r1[0].coords),
      (c) => rotate(c, degrees(180))
    )
  );
}
export function figure7b(name: string): Node[] {
  const g1 = figure7a(`${name}-0`);
  const a = moserSpindleAngle();
  const g2 = mapCoords(
    figure7a(`${name}-1`),
    flow((c) => rotate(c, negateAngle(a)))
  );
  const g3 = mapCoords(
    figure7a(`${name}-2`),
    flow((c) => rotate(c, a))
  );
  return [...g1, ...g2, ...g3];
}

export function figure7c(name: string): Node[] {
  // "The angles of the edges relative to the vector (1,0) are i arcsin(???3/2) + j arcsin(1/???12), i ??? 0 ... 5, j ??? ???2 ... 2}."
  const ai = Math.asin(Math.sqrt(3) / 2);
  const aj = Math.asin(1 / Math.sqrt(12));
  const angles: Angle[] = range(0, 5 + 1)
    .map((i) => range(-2, 2 + 1).map((j) => radians(i * ai + j * aj)))
    .flat();
  return angles.flatMap((a, i) =>
    mapCoords(triangle60(`${name}-${i}`), (c) => rotate(c, a))
  );
}

export function figureW(name: string): Node[] {
  // "Let W be the 301-vertex graph consisting of all points at distance ??????3 from the origin that are the sum of two edges of V (interpreted as vectors)"
  const graphV = figure7c("");
  const byId = keyBy(graphV, (n) => n.id);
  const collide = C.collide(graphV);
  const threshold = Math.sqrt(3);
  const nodes = collide.uniqueEdges
    .map((a, i) => {
      const an0 = byId[a[0].id];
      const an1 = byId[a[1].id];
      const av = recenter(an1.coords, an0.coords);
      return collide.uniqueEdges.slice(i + 1).map((b) => {
        const bn0 = byId[b[0].id];
        const bn1 = byId[b[1].id];
        const bv = recenter(bn1.coords, bn0.coords);
        return translate(av, bv);
      });
    })
    .flat()
    .filter((coords) => distance(toXY(coords)) <= threshold)
    .map((coords, i) => {
      return { id: `${name}-${i}`, coords };
    });
  return nodes;
}

export function figure8(name: string): Node[] {
  // "The 1345-vertex graph shown in Figure 8 is the union of W with six translates of it in which the origin is mapped to a vertex of H"
  const w0 = figureW(`${name}-$$I$$`);
  // Our dead-simple collision detection takes O(number-of-nodes^2) time, so
  // multiple collision-detection/duplicate-filtering passes during node gen
  // is dramatically faster.
  // Before adding this one: "node generation in 47ms, collision detection (edges/duplicates) in 11295ms"
  // After adding this one: "node generation in 340ms, collision detection (edges/duplicates) in 2383ms"
  // TODO: this won't be enough for the 20k-node final result, I think. Probably going to need bucketing.
  // And even then, rendering will be slow!
  const wCollide = C.collide(w0);
  return figure1("")
    .map((o, i) => {
      return mapCoords(wCollide.fig.nodes, (c) => translate(c, o.coords)).map(
        (n) => ({ ...n, id: n.id.replace("$$I$$", `${i}`) })
      );
    })
    .flat();
}

export function figurePreN2(name: string): Node[] {
  const ns = figure2(name);
  return ns.filter((n) => n.label === "origin-H");
}
export function figurePreN4(name: string): Node[] {
  const ns = figure4(name);
  return ns.filter((n) => n.label === "origin-H");
}
export function figurePreN5(name: string): Node[] {
  const ns = figure5(name);
  return ns.filter((n) => n.label === "origin-H");
}
export function figureN(name: string): Node[] {
  // "graph N as the union of 52 copies of M, translated and rotated so that each instance of H in L coincides with the central H of a copy of M"
  // TODO: uh, I don't get it. translate and rotate figure 8 in the same way we constructed figure 5, but what's the part about H?
  // oh - not *every* point in figure 5, just the *central* point of each copy of figure 1 we used to construct it? I think that makes sense.
  // Gotta refactor all those early figures to make that possible though - shouldn't be too bad.
  // though, we're too slow to run it right now anyway...
  throw new Error("TODO");
}

export function section51(name: string): Node[] {
  // (1) Let S be the following set of points:
  const s = [
    // line 1
    xy(0, 0),
    xy(1 / 3, 0),
    xy(1, 0),
    xy(2, 0),
    xy((Math.sqrt(33) - 3) / 6, 0),
    xy(1 / 2, 1 / Math.sqrt(12)),
    xy(1, 1 / Math.sqrt(3)),
    xy(3 / 2, Math.sqrt(3) / 2),
    // line 2
    xy(7 / 6, Math.sqrt(11) / 6),
    xy(1 / 6, (Math.sqrt(12) - Math.sqrt(11)) / 6),
    xy(5 / 6, (Math.sqrt(12) - Math.sqrt(11)) / 6),
    // line 3
    xy(2 / 3, (Math.sqrt(11) - Math.sqrt(3)) / 6),
    xy(2 / 3, (3 * Math.sqrt(3) - Math.sqrt(11)) / 6),
    xy(Math.sqrt(33) / 6, 1 / Math.sqrt(12)),
    // line 4
    xy((Math.sqrt(33) + 3) / 6, 1 / Math.sqrt(3)),
    xy((Math.sqrt(33) + 1) / 6, (3 * Math.sqrt(3) - Math.sqrt(11)) / 6),
    xy((Math.sqrt(33) - 1) / 6, (3 * Math.sqrt(3) - Math.sqrt(11)) / 6),
    // line 5
    xy((Math.sqrt(33) + 1) / 6, (Math.sqrt(11) - Math.sqrt(3)) / 6),
    xy((Math.sqrt(33) - 1) / 6, (Math.sqrt(11) - Math.sqrt(3)) / 6),
    // line 6
    xy((Math.sqrt(33) - 2) / 6, (2 * Math.sqrt(3) - Math.sqrt(11)) / 6),
    xy((Math.sqrt(33) - 4) / 6, (2 * Math.sqrt(3) - Math.sqrt(11)) / 6),
    // line 7
    xy((Math.sqrt(33) + 13) / 12, (Math.sqrt(11) - Math.sqrt(3)) / 12),
    xy((Math.sqrt(33) + 11) / 12, (Math.sqrt(3) + Math.sqrt(11)) / 12),
    // line 8
    xy((Math.sqrt(33) + 9) / 12, (Math.sqrt(11) - Math.sqrt(3)) / 4),
    xy((Math.sqrt(33) + 9) / 12, (3 * Math.sqrt(3) + Math.sqrt(11)) / 12),
    // line 9
    xy((Math.sqrt(33) + 7) / 12, (Math.sqrt(3) + Math.sqrt(11)) / 12),
    xy((Math.sqrt(33) + 7) / 12, (3 * Math.sqrt(3) - Math.sqrt(11)) / 12),
    // line 10
    xy((Math.sqrt(33) + 5) / 12, (5 * Math.sqrt(3) - Math.sqrt(11)) / 12),
    xy((Math.sqrt(33) + 5) / 12, (Math.sqrt(11) - Math.sqrt(3)) / 12),
    // line 11 (-5)
    xy((Math.sqrt(33) + 3) / 12, (3 * Math.sqrt(11) - 5 * Math.sqrt(3)) / 12),
    xy((Math.sqrt(33) + 3) / 12, (Math.sqrt(3) + Math.sqrt(11)) / 12),
    // line 12 (-4)
    xy((Math.sqrt(33) + 3) / 12, (3 * Math.sqrt(3) - Math.sqrt(11)) / 12),
    xy((Math.sqrt(33) + 1) / 12, (Math.sqrt(11) - Math.sqrt(3)) / 12),
    // line 13 (-3)
    xy((Math.sqrt(33) - 1) / 12, (3 * Math.sqrt(3) - Math.sqrt(11)) / 12),
    xy((Math.sqrt(33) - 3) / 12, (Math.sqrt(11) - Math.sqrt(3)) / 12),
    // line 14 (-2)
    xy((15 - Math.sqrt(33)) / 12, (Math.sqrt(11) - Math.sqrt(3)) / 4),
    xy((15 - Math.sqrt(33)) / 12, (7 * Math.sqrt(3) - 3 * Math.sqrt(11)) / 12),
    // line 15 (-1)
    xy((13 - Math.sqrt(33)) / 12, (3 * Math.sqrt(3) - Math.sqrt(11)) / 12),
    xy((11 - Math.sqrt(33)) / 12, (Math.sqrt(11) - Math.sqrt(3)) / 12),
    // ...ugh, tedious
  ];

  // 2. Let Sa be the unit-distance graph whose vertices consist of all points
  // obtained by rotating the points in S around the origin by multiples of 60
  // degrees and/or by negating their y-coordinates. Sa has a total of 397 vertices
  const sa0 = s.flatMap((c0) => {
    const p = toXY(c0);
    const c1s = [c0, xy(p.x, -p.y)];
    return range(0, 6).flatMap((slice) =>
      c1s.map((c) => rotate(c, degrees(slice * 60)))
    );
  });
  // merge coords to get the checkpointed node-count
  const sa: Coords[] = C.mergeCoords(sa0);
  if (sa.length !== 397)
    throw new Error(`sa.length: expected 397, got ${sa.length}`);
  // 3. Let Sb be Sa rotated anticlockwise about the origin by 2 arcsin(1/4).
  const sb = sa.flatMap((c) => rotate(c, radians(2 * Math.asin(1 / 4))));
  // 4. Let Y be the union of Sa and Sb with the vertices (1/3, 0) and (???1/3, 0) deleted.
  const y = [...sa, ...sb].filter(
    (c) =>
      C.distance(toXY(c), { x: 1 / 3, y: 0 }) >= C.tolerance &&
      C.distance(toXY(c), { x: -1 / 3, y: 0 }) >= C.tolerance
  );
  if (y.length !== 397 * 2 - 2)
    throw new Error(`y.length: expected ${397 * 2 - 2}, got ${y.length}`);
  // (5) Rotate Y anticlockwise about (-2,0) by ??/2 + arcsin(1/8) to give Ya.
  const ya = y.map((c) =>
    rotateAbout(c, radians(Math.PI / 2 + Math.asin(1 / 8)), xy(-2, 0))
  );
  // (6) Rotate Y anticlockwise about (-2,0) by ??/2 ??? arcsin(1/8) to give Yb.
  const yb = y.map((c) =>
    rotateAbout(c, radians(Math.PI / 2 - Math.asin(1 / 8)), xy(-2, 0))
  );
  // (7) Let G be the union of Ya and Yb.
  // ...our current record being the 1581-vertex graph G
  const g = C.mergeCoords([...ya, ...yb]);
  if (g.length !== 1581)
    throw new Error(`g.length: expected 1581, got ${g.length}`);
  // hooray, now turn them into nodes and we're done
  return g.map((coords, i) => ({ id: `${name}-${i}`, coords }));
  // TODO: something is wrong here. it's not even symmetrical :(
  // https://chrom-graph.erosson.org/chrom-graph/section51
}
