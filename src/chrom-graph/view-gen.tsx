import React from "react";
import * as C from "sigma";
import * as Route from "../route.js";
import * as Graph from "./graph.js";
import Nav from '../nav.js'
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

export default function ChromaticGraphGen(): JSX.Element {
  const params = useParams();
  const figureName = params.figure ?? "figure1";
  const instance = Graph.byName[figureName];
  if (!instance) throw new Error(`no such figure: ${figureName}`);
  const { graph, collide, fig, elapsedCollide, elapsedLoad } =
    Graph.buildGraph(instance);
  const gexfS = gexf.write(graph);
  const download = `data:text/plain;base64,${encodeURIComponent(btoa(gexfS))}`;
  const downloadFilename = `${params.figure ?? "figure1"}.gexf`;

  const canvas = React.useRef<HTMLDivElement | null>(null);
  React.useEffect(() => {
    if (canvas.current) {
      const render = new C.Sigma(graph, canvas.current, {});
      return () => render.kill();
    }
  }, [canvas, graph]);
  return (
    <div>
      <Nav />
      <div>Viewing live-generated graph (<Link to={Route.chromGraph(figureName)}>view it pre-rendered</Link>)</div>
      <ul>
        <li>
          {collide.fig.nodes.length} nodes ({fig.length} generated nodes;{" "}
          {collide.removed.size} collisions removed)
        </li>
        <li>
          {collide.fig.edges.length} unit edges (
          {collide.intersectingEdges.length} generated edges;{" "}
          {collide.intersectingEdges.length - collide.fig.edges.length}{" "}
          collisions removed)
        </li>
        <li>
          node generation in {elapsedLoad}ms, collision detection
          (edges/duplicates) in {elapsedCollide}ms
        </li>
        <li>
          download:{" "}
          <a href={download} download={downloadFilename}>
            .gexf
          </a>
        </li>
      </ul>
      <div style={style.canvas} ref={canvas}></div>
    </div>
  );
}
