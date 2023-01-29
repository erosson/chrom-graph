import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import ChromGraphGen from "./chrom-graph/view-gen.js";
import ChromGraphFetch from "./chrom-graph/view-fetch.js";
import * as Route from "./route.js";

function Layout() {
  return (
    <>
      {/* <Nav /> */}
      <Outlet />
    </>
  );
}
function App(): JSX.Element {
  // https://reactrouter.com/en/main/start/tutorial
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: Route.Route.home,
          element: <ChromGraphFetch/>,
        },
        {
          path: Route.Route.chromGraph,
          element: <ChromGraphFetch />,
        },
        {
          path: Route.Route.chromGraphGen,
          element: <ChromGraphGen />,
        },
      ],
    },
  ]);

  return (
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  );
}

async function main() {
  const rootEl = document.getElementById("root");
  if (!rootEl) throw new Error("no root");
  const root = ReactDOM.createRoot(rootEl);
  root.render(<App />);
}

main();
