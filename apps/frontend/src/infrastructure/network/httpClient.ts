const DEFAULT_BACKEND_URL = "http://localhost:3001";

const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_BACKEND_URL ?? DEFAULT_BACKEND_URL;
};

export const apiGet = async <TResponse>(path: string): Promise<TResponse> => {
  const response = await fetch(`${getBaseUrl()}${path}`, {
    cache: "no-store",
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  return payload as TResponse;
};