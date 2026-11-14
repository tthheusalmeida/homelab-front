import { Outlet } from "react-router";

import { useLibrarySync } from "./hooks/useLibrarySync";

/** Envolve as rotas da Biblioteca mantendo o índice em dia com as pastas. */
export function LibraryLayout() {
  useLibrarySync();

  return <Outlet />;
}
