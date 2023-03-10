import React from "react";
import * as C from "sigma";
// import * as G from './graph.js'
import * as G from "graphology";
import * as Route from "../route.js";
import Nav from "../nav.js";
import gexf from "graphology-gexf/browser";
import {colors} from './node.js'
import * as CNF from './cnf/lookup.js'
import * as CNFO from './cnf/output-file.js'
import { Link, useParams } from "react-router-dom";

const style = {
  canvas: {
    border: "1px solid red",
    borderRadius: "0.5em",
    width: "90vw",
    height: "90vh",
  },
};

export default function ChromaticGraphFetch(): JSX.Element {
  const params = useParams();
  const figureName = params.figure ?? "figure1";
  const gexfSrc = `/graphdata/${figureName}.gexf`;
  const cnfSrc = `/graphdata/${figureName}.cnf`;
  const satSrc = `/graphdata/${figureName}.sat.txt`;
  const [graph, setGraph] = React.useState<G.default | null>(null);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    (async () => {
      const srcs = [gexfSrc, cnfSrc, satSrc];
      const ress = await Promise.all(srcs.map((src) => fetch(src)));
      for (let res of ress) {
        if (res.status !== 200) {
          throw new Error("missing graph file");
        }
      }
      const strs = await Promise.all(ress.map((res) => res.text()));
      const [gexfS, cnfS, satS] = strs;
      // @ts-expect-error graphology-types is screwy
      const graph0 = gexf.parse(G.default, gexfS)
      const cnfOutput = CNFO.parse(satS)
      const graph = cnfOutput.type === 'output-sat' ? CNFO.colorize(graph0, colors, cnfOutput) : graph0
      setGraph(graph);
    })().catch((err) => {
      console.error(err);
      setError(err);
    });
  }, [figureName]);

  const canvas = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (graph && canvas.current) {
      const render = new C.Sigma(graph, canvas.current, {});
      return () => render.kill();
    }
  }, [canvas, graph]);
  return error ? (
    <pre>{error.message}</pre>
  ) : !graph ? (
    <pre>loading: fetching graph...</pre>
  ) : (
    <div>
      <Nav />
      <div>
        Viewing pre-rendered graph (
        <Link to={Route.chromGraphGen(figureName)}>generate it live</Link>)
      </div>
      <ul>
        <li>{graph.nodes().length} nodes</li>
        <li>{graph.edges().length} unit edges</li>
        <li>
          download: <a href={gexfSrc}>.gexf</a>,{" "}
          <a href={cnfSrc}>4-color .cnf</a>,{" "}
          <a href={satSrc}>4-color minisat output</a>
        </li>
      </ul>
      <div style={style.canvas} ref={canvas}></div>
    </div>
  );
}
