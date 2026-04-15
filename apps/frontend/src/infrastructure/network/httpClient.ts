const DEFAULT_BACKEND_URL = "http://localhost:4000";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface HttpRequestOptions {
  tenantId: string;
  method?: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
}

const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_BACKEND_URL ?? DEFAULT_BACKEND_URL;
};

export const httpRequest = async <TResponse>(
  path: string,
  options: HttpRequestOptions
): Promise<TResponse> => {
  const { tenantId, method = "GET", body, headers } = options;

  const response = await fetch(`${getBaseUrl()}${path}`, {
    method,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      "x-tenant-id": tenantId,
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as unknown;
  return payload as TResponse;
};

export const httpGet = async <TResponse>(path: string, tenantId: string): Promise<TResponse> => {
  return httpRequest<TResponse>(path, { tenantId, method: "GET" });
};

export const apiGet = async <TResponse>(path: string): Promise<TResponse> => {
  return httpGet<TResponse>(path, "tenant-demo");
};