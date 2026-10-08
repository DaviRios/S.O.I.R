const BASE_URL = (import.meta.env.VITE_API_CMS_URL ?? '/v1').replace(/\/$/, '');

export class HttpClient {
  get<T>(path: string, signal?: AbortSignal): Promise<T> {
    return this.request<T>('GET', path, undefined, signal);
  }
  post<T = void>(
    path: string,
    body?: BodyInit,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>('POST', path, body, signal);
  }
  put<T = void>(
    path: string,
    body?: BodyInit,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>('PUT', path, body, signal);
  }
  patch<T = void>(
    path: string,
    body?: BodyInit,
    signal?: AbortSignal,
  ): Promise<T> {
    return this.request<T>('PATCH', path, body, signal);
  }
  delete<T = void>(path: string, signal?: AbortSignal): Promise<T> {
    return this.request<T>('DELETE', path, undefined, signal);
  }
  raw(method: string, path: string, body?: BodyInit, signal?: AbortSignal) {
    return this.fetch(method, path, body, signal, true);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: BodyInit,
    signal?: AbortSignal,
  ) {
    const response = await this.fetch(method, path, body, signal, true);
    if (
      response.status === 204 ||
      response.headers.get('content-length') === '0'
    )
      return undefined as T;
    const text = await response.text();
    if (!text) return undefined as T;
    return (
      (response.headers.get('content-type') ?? '').includes('json')
        ? JSON.parse(text)
        : text
    ) as T;
  }

  private async fetch(
    method: string,
    path: string,
    body: BodyInit | undefined,
    signal: AbortSignal | undefined,
    retry: boolean,
  ): Promise<Response> {
    const response = await fetch(`${BASE_URL}/${path.replace(/^\//, '')}`, {
      method,
      body,
      signal,
      credentials: 'include',
      headers:
        body && typeof body === 'string'
          ? { 'Content-Type': 'application/json' }
          : undefined,
    });
    if (response.status === 401 && retry && path !== 'users/auth/refresh') {
      const refreshed = await fetch(`${BASE_URL}/users/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshed.ok) return this.fetch(method, path, body, signal, false);
    }
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;
      throw new Error(payload?.message ?? `HTTP ${response.status}`);
    }
    return response;
  }
}

export const httpClient = new HttpClient();
