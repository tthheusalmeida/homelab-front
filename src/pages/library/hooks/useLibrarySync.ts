import { useEffect } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { reindex } from "../api/library";

/** Intervalo mínimo entre duas sincronizações, para não reler a pasta à toa. */
export const MIN_SYNC_INTERVAL_MS = 5000;

/**
 * Mantém a tela alinhada com os arquivos: reindexa ao entrar na Biblioteca e
 * sempre que a janela volta ao foco (ex.: depois de mover arquivos de pasta),
 * e então atualiza as listas. Falha na sincronização é silenciosa.
 */
export function useLibrarySync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let running = false;
    let lastRun = 0;

    async function sync() {
      if (running || Date.now() - lastRun < MIN_SYNC_INTERVAL_MS) {
        return;
      }

      running = true;

      try {
        await reindex();
        await queryClient.invalidateQueries({ queryKey: ["library"] });
      } catch {
        // Sem back ou sem resposta: as telas já mostram o próprio erro.
      } finally {
        running = false;
        lastRun = Date.now();
      }
    }

    void sync();
    window.addEventListener("focus", sync);

    return () => window.removeEventListener("focus", sync);
  }, [queryClient]);
}
