import type { HealthService } from "../types/services.types";

export async function checkService(url: string): Promise<HealthService> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Serviço não disponível: ${url} | Status: ${response.status}`,
    );
  }

  return response.json();
}
