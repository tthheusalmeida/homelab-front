import { createBrowserRouter } from "react-router";

import { AppLayout } from "./layouts/AppLayout";
import { HomePage } from "../pages/home/HomePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
]);
