const DEFAULT_API_BASE_URL = "http://localhost:4000/api/v1";
const TENANT_STORAGE_KEY = "rura.activeTenantId";
const TENANT_GLOBAL_KEY = "__RURA_ACTIVE_TENANT_ID__";
const FALLBACK_TENANT_ID = "tenant-demo";

type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

type QueryParamValue = string | number | boolean | null | undefined;

interface RequestOptions<TBody = unknown> {
  method?: HttpMethod;
  tenantId?: string;
  body?: TBody;
  query?: Record<string, QueryParamValue>;
  headers?: Record<string, string>;
  cache?: RequestCache;
  signal?: AbortSignal;
}

declare global {
  interface Window {
    __RURA_ACTIVE_TENANT_ID__?: string;
  }
}

export class HttpError extends Error {
  public readonly status: number;
  public readonly details: unknown;

  constructor(status: number, message: string, details: unknown) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.details = details;
  }
}

const isBrowser = (): boolean => typeof window !== "undefined";

const getBaseUrl = (): string => {
  const fromEnv = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_API_BASE_URL;
};

const parseErrorPayload = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const parsedJson = (await response.json()) as unknown;
    return parsedJson;
  }

  return response.text();
};

const buildUrl = (path: string, query?: Record<string, QueryParamValue>): string => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${getBaseUrl()}${normalizedPath}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
};

export const getTenantIdFromRuntime = (): string => {
  if (!isBrowser()) {
    return FALLBACK_TENANT_ID;
  }

  const tenantInWindow = window[TENANT_GLOBAL_KEY];
  if (tenantInWindow && tenantInWindow.length > 0) {
    return tenantInWindow;
  }

  const tenantInStorage = window.localStorage.getItem(TENANT_STORAGE_KEY);
  if (tenantInStorage && tenantInStorage.length > 0) {
    return tenantInStorage;
  }

  return FALLBACK_TENANT_ID;
};

export const setTenantIdInRuntime = (tenantId: string): void => {
  if (!isBrowser()) {
    return;
  }

  window[TENANT_GLOBAL_KEY] = tenantId;
  window.localStorage.setItem(TENANT_STORAGE_KEY, tenantId);
};

const request = async <TResponse, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {}
): Promise<TResponse> => {
  const {
    method = "GET",
    tenantId,
    body,
    query,
    headers,
    cache = "no-store",
    signal
  } = options;

  const resolvedTenantId = tenantId ?? getTenantIdFromRuntime();
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const response = await fetch(buildUrl(path, query), {
    method,
    cache,
    signal,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      "x-tenant-id": resolvedTenantId,
      ...headers
    },
    body: body === undefined ? undefined : isFormData ? (body as BodyInit) : JSON.stringify(body)
  });

  if (!response.ok) {
    const details = await parseErrorPayload(response);
    const errorMessage =
      typeof details === "object" &&
      details !== null &&
      "message" in details &&
      typeof (details as { message: unknown }).message === "string"
        ? (details as { message: string }).message
        : `HTTP ${response.status} ${response.statusText}`;

    throw new HttpError(response.status, errorMessage, details);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const parsedJson = (await response.json()) as unknown;
    return parsedJson as TResponse;
  }

  const parsedText = (await response.text()) as unknown;
  return parsedText as TResponse;
};

export const httpClient = {
  get: <TResponse>(path: string, options?: Omit<RequestOptions<never>, "method" | "body">) =>
    request<TResponse>(path, { ...options, method: "GET" }),
  post: <TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options?: Omit<RequestOptions<TBody>, "method" | "body">
  ) => request<TResponse, TBody>(path, { ...options, method: "POST", body }),
  put: <TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options?: Omit<RequestOptions<TBody>, "method" | "body">
  ) => request<TResponse, TBody>(path, { ...options, method: "PUT", body }),
  patch: <TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options?: Omit<RequestOptions<TBody>, "method" | "body">
  ) => request<TResponse, TBody>(path, { ...options, method: "PATCH", body }),
  delete: <TResponse>(path: string, options?: Omit<RequestOptions<never>, "method" | "body">) =>
    request<TResponse>(path, { ...options, method: "DELETE" })
};

export const apiGet = async <TResponse>(path: string): Promise<TResponse> => {
  return httpClient.get<TResponse>(path);
};