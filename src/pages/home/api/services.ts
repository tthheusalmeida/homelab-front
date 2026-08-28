export async function checkService(url: string): Promise<boolean> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Serviço não disponível: ${url} | Status: ${response.status}`,
    );
  }

  return true;
}
