import React from "react";
import * as C from "sigma";
// import * as G from './graph.js'
import * as G from "graphology";
import * as Route from '../route.js'
import Nav from "../nav.js";
import gexf from "graphology-gexf/browser";
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
  const [graph, setGraph] = React.useState<G.default | null>(null);
  const [error, setError] = React.useState<Error | null>(null);
  const [gexfS, setGexfS] = React.useState<string | null>(null);
  const [cnfS, setCnfS] = React.useState<string | null>(null);
  const download = gexfS ? `data:text/plain;base64,${encodeURIComponent(btoa(gexfS))}` : null;
  const downloadFilename = `${params.figure ?? "figure1"}.gexf`;
  const downloadCnf = cnfS? `data:text/plain;base64,${encodeURIComponent(btoa(cnfS))}` : null;
  const downloadFilenameCnf = `${params.figure ?? "figure1"}.gexf`;

  React.useEffect(() => {
    (async () => {
      const [gexfRes, cnfRes] = await Promise.all([
        fetch(`/graphdata/${figureName}.gexf`),
        fetch(`/graphdata/${figureName}.cnf`),
      ]);
      if (gexfRes.status !== 200) {
        throw new Error('no such graph gexf')
      }
      if (cnfRes.status !== 200) {
        throw new Error('no such graph cnf')
      }
      const [gexfS, cnfS] = await Promise.all([gexfRes.text(), cnfRes.text()]);
      // @ts-expect-error graphology-types is screwy
      setGraph(gexf.parse(G.default, gexfS));
      setGexfS(gexfS)
      setCnfS(cnfS)
    })().catch(err => {
      console.error(err)
      setError(err)
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
      <div>Viewing pre-rendered graph (<Link to={Route.chromGraphGen(figureName)}>generate it live</Link>)</div>
      <ul>
        <li>
          {graph.nodes().length} nodes
        </li>
        <li>
          {graph.edges().length} unit edges
        </li>
        <li>
          download:{" "}
          <a href={download ?? ''} download={downloadFilename}>
            .gexf
          </a>,{' '}
          <a href={downloadCnf ?? ''} download={downloadFilenameCnf}>
            4-color .cnf
          </a>
        </li>
      </ul>
      <div style={style.canvas} ref={canvas}></div>
    </div>
  );
}
