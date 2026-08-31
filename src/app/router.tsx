import { createBrowserRouter } from "react-router";

import { AppLayout } from "./layouts/AppLayout";

import { HomePage } from "../pages/home/HomePage";

import { ChatPage } from "../pages/ai/chat/ChatPage";
import { UsagePage } from "../pages/ai/usage/UsagePage";

import { CreatePage } from "../pages/jobs/create/CreatePage";
import { TrackPage } from "../pages/jobs/track/TrackPage";

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
        path: "ai",
        children: [
          {
            path: "chat",
            element: <ChatPage />,
          },
          {
            path: "usage",
            element: <UsagePage />,
          },
        ],
      },
      {
        path: "jobs",
        children: [
          {
            path: "create",
            element: <CreatePage />,
          },
          {
            path: "track",
            element: <TrackPage />,
          },
        ],
      },
    ],
  },
]);
