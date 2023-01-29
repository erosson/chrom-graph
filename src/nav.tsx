import React from "react";
import { Link } from "react-router-dom";
import * as Route from "./route.js";
import * as F from "./chrom-graph/figure.js";

export default function Nav() {
  return (
    <nav>
      <div>
        <a target="_blank" href="https://arxiv.org/abs/1804.02385">
          arXiv:1804.02385
        </a>
      </div>
      <ul>
        {F.list.map((instance) => {
          return (
            <li key={instance.name}>
              <Link to={Route.chromGraph(instance.name)}>
                {instance.label ?? instance.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
