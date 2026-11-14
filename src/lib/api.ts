const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  // 204 No Content (ex.: DELETE) não tem corpo para ler.
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
