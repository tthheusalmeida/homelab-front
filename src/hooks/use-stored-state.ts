import { useCallback, useState } from "react";

/**
 * Estado de texto guardado no navegador (localStorage). Só aceita valores da
 * lista `allowed`; se o armazenamento falhar ou o valor guardado for inválido,
 * usa `fallback`. É só uma conveniência do usuário, nunca um dado importante.
 */
export function useStoredState<T extends string>(
  key: string,
  fallback: T,
  allowed: readonly T[],
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);

      return allowed.includes(stored as T) ? (stored as T) : fallback;
    } catch {
      return fallback;
    }
  });

  const update = useCallback(
    (next: T) => {
      setValue(next);

      try {
        window.localStorage.setItem(key, next);
      } catch {
        // sem armazenamento: a escolha vale só nesta sessão
      }
    },
    [key],
  );

  return [value, update];
}
