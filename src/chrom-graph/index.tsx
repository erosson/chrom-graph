import React from "react";
import * as C from "sigma";
import * as Route from "../route";
import * as Graph from "./graph";
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

export default function ChromaticGraph(): JSX.Element {
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
      <nav>
        <div>
          <a target="_blank" href="https://arxiv.org/abs/1804.02385">
            arXiv:1804.02385
          </a>
        </div>
        <ul>
          <li>
            <Link to={Route.chromGraph("figure1")}>figure 1</Link>
          </li>
          <li>
            <Link to={Route.chromGraph("figure2")}>figure 2</Link>
          </li>
          <li>
            <Link to={Route.chromGraph("figure4")}>figure 4</Link>
          </li>
          <li>
            <Link to={Route.chromGraph("figure5")}>figure 5</Link>
          </li>
          <li>
            <Link to={Route.chromGraph("figure7a")}>
              figure 7a (moser spindle)
            </Link>
          </li>
          <li>
            <Link to={Route.chromGraph("figure7b")}>figure 7b</Link>
          </li>
          <li>
            <Link to={Route.chromGraph("figure7c")}>figure 7c</Link>
          </li>
          <li>
            <Link to={Route.chromGraph("figureW")}>graph W (slow!)</Link>
          </li>
          <li>
            <Link to={Route.chromGraph("figure8")}>
              figure 8/graph M (slow!)
            </Link>
          </li>
          <li>
            <Link to={Route.chromGraph("figurePreN2")}>figure 2-preN</Link>
          </li>
          <li>
            <Link to={Route.chromGraph("figurePreN4")}>figure 4-preN</Link>
          </li>
          <li>
            <Link to={Route.chromGraph("figurePreN5")}>figure 5-preN</Link>
          </li>
        </ul>
      </nav>
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
