import { createBrowserRouter } from "react-router";

import { AppLayout } from "./layouts/AppLayout";
import { HomePage } from "../pages/home/HomePage";
import { AiUsagePage } from "../pages/ai-usage/AiUsagePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "ai-usage",
        element: <AiUsagePage />,
      },
    ],
  },
]);
