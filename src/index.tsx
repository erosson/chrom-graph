import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import ChromGraph from "./chrom-graph";
import * as Route from "./route";

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
          // element: <>howdy! click a demo link above</>,
          element: <ChromGraph />,
        },
        {
          path: Route.Route.chromGraph,
          element: <ChromGraph />,
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
