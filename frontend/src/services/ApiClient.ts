import { STORAGE_KEYS } from '../constants/storage';
import type { NotificationError } from '../models/NotificationModel';

export class ApiError extends Error {
  public statusCode: number;
  public errors?: NotificationError[];

  constructor(message: string, statusCode: number, errors?: NotificationError[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export class HttpClient {
  private baseUrl: string;

  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  private notify(title: string, message: string, variant: 'success' | 'error' | 'warning' | 'info', messages?: string[]) {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('app:notification', {
        detail: { title, message, variant, messages }
      }));
    }
  }

  private getStatusText(status: number): string {
    const statusMap: Record<number, string> = {
      400: 'Requisição Inválida',
      401: 'Não Autorizado',
      403: 'Acesso Negado',
      404: 'Não Encontrado',
      409: 'Conflito',
      422: 'Entidade Improcessável',
      429: 'Muitas Requisições',
      500: 'Erro Interno do Servidor',
      502: 'Bad Gateway',
      503: 'Serviço Indisponível',
    };
    return statusMap[status] || `Erro ${status}`;
  }

  private notifyError(error: ApiError, options: RequestInit, silent = false) {
    if (silent) return;
    if (options.method !== 'GET' || error.statusCode >= 404 || error.statusCode === 401) {
      if (error.errors && Array.isArray(error.errors)) {
        const errorMessages = error.errors.map((e) => e.message);
        this.notify(error.message || 'Validation failed', '', 'error', errorMessages);
      } else {
        const title = this.getStatusText(error.statusCode);
        this.notify(title, error.message, 'error');
      }
    }
  }

  private async handleResponse(response: Response, options: RequestInit, silent = false) {
    if (!response.ok) {
      let errorData: any = {};
      try {
        errorData = await response.json();
      } catch {
        /* response had no JSON body */
      }

      let errorMessage = 'Erro inesperado no servidor.';

      if (Array.isArray(errorData.message)) {
        errorData.errors = errorData.message.map((msg: string) => ({ context: '', message: msg }));
        errorMessage = 'Falha na validação';
      } else if (errorData.message) {
        errorMessage = errorData.message;
      }

      if (errorData.errors && Array.isArray(errorData.errors)) {
        throw new ApiError(errorMessage, response.status, errorData.errors);
      }

      throw new ApiError(errorMessage, response.status);
    }

    if (!silent) {
      if (response.status >= 300 && response.status < 400) {
        this.notify('Aviso', 'Aviso da API (Redirecionamento).', 'info');
      } else if (response.status >= 200 && response.status < 300) {
        if (options.method !== 'GET') {
          this.notify('Sucesso', 'Operação realizada com sucesso.', 'success');
        }
      }
    }

    if (response.status === 204) return null;

    const text = await response.text();
    if (!text) return null;

    return JSON.parse(text);
  }

  private getHeaders(customHeaders: Record<string, string> = {}) {
    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async executeRequest<T>(path: string, options: RequestInit, silent = false): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const response = await fetch(url, options);

    try {
      return await this.handleResponse(response, options, silent);
    } catch (error: any) {
      if (error instanceof ApiError && error.statusCode === 401) {
        const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

        if (!refreshToken || path === '/auth/refresh') {
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('auth:logout'));
          }
          this.notifyError(error, options, silent);
          throw error;
        }

        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.addRefreshSubscriber((newToken: string) => {
              if (!newToken) {
                this.notifyError(error, options, silent);
                return reject(error);
              }
              const newHeaders = { ...options.headers, 'Authorization': `Bearer ${newToken}` };
              resolve(fetch(url, { ...options, headers: newHeaders }).then(res => this.handleResponse(res, options, silent)).catch(err => {
                if (err instanceof ApiError) this.notifyError(err, options, silent);
                throw err;
              }));
            });
          });
        }

        this.isRefreshing = true;

        try {
          const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (!refreshResponse.ok) {
            throw new Error('Failed to refresh token', { cause: error });
          }

          const data = await refreshResponse.json();
          localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);

          this.isRefreshing = false;
          this.onRefreshed(data.accessToken);

          const newHeaders = { ...options.headers, 'Authorization': `Bearer ${data.accessToken}` };
          const retryResponse = await fetch(url, { ...options, headers: newHeaders });
          try {
            return await this.handleResponse(retryResponse, options, silent);
          } catch (retryError) {
            if (retryError instanceof ApiError) this.notifyError(retryError, options, silent);
            throw retryError;
          }
        } catch {
          this.isRefreshing = false;
          localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
          localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
          this.onRefreshed('');
          window.dispatchEvent(new Event('auth:logout'));

          this.notifyError(error, options, silent);
          throw error;
        }
      }

      if (error instanceof ApiError) {
        this.notifyError(error, options, silent);
      }
      throw error;
    }
  }

  async get<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.executeRequest<T>(path, { method: 'GET', headers: this.getHeaders(headers) });
  }

  async post<T>(path: string, body?: any, headers?: Record<string, string>, silent = false): Promise<T> {
    const requestHeaders = this.getHeaders(headers);
    const isFormData = body instanceof FormData;
    if (isFormData) {
      delete requestHeaders['Content-Type'];
    }
    return this.executeRequest<T>(path, {
      method: 'POST',
      headers: requestHeaders,
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    }, silent);
  }

  async put<T>(path: string, body?: any, headers?: Record<string, string>): Promise<T> {
    const requestHeaders = this.getHeaders(headers);
    const isFormData = body instanceof FormData;
    if (isFormData) {
      delete requestHeaders['Content-Type'];
    }
    return this.executeRequest<T>(path, {
      method: 'PUT',
      headers: requestHeaders,
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  }

  async patch<T>(path: string, body?: any, headers?: Record<string, string>): Promise<T> {
    const requestHeaders = this.getHeaders(headers);
    const isFormData = body instanceof FormData;
    if (isFormData) {
      delete requestHeaders['Content-Type'];
    }
    return this.executeRequest<T>(path, {
      method: 'PATCH',
      headers: requestHeaders,
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  }

  async delete<T>(path: string, headers?: Record<string, string>): Promise<T> {
    return this.executeRequest<T>(path, { method: 'DELETE', headers: this.getHeaders(headers) });
  }
}

const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;

  // If accessed via a non-localhost hostname, target that same host's backend port
  // instead of hardcoding localhost (useful when testing from another device on the LAN).
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return `${window.location.protocol}//${window.location.hostname}:5000/api`;
  }

  return envUrl || 'http://localhost:5000/api';
};

export const apiClient = new HttpClient(getApiUrl());
