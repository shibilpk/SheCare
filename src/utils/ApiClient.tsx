import useStore from '../hooks/useStore';

// Custom API Error class
export class APIError extends Error {
  public readonly type: 'network' | 'server' | 'cancelled';
  public readonly statusCode?: number;
  public readonly data?: unknown;

  constructor(
    message: string,
    type: 'network' | 'server' | 'cancelled',
    statusCode?: number,
    data?: unknown
  ) {
    super(message);
    this.name = 'APIError';
    this.type = type;
    this.statusCode = statusCode;
    this.data = data;
  }
}

// Request/Response Interceptor types
type RequestInterceptor = (
  url: string,
  options: RequestInit
) => Promise<{ url: string; options: RequestInit }> | { url: string; options: RequestInit };

type ResponseInterceptor = (response: Response) => Promise<Response> | Response;

// HTTP Methods
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API Options interface
interface ApiOptions {
  method?: HttpMethod;
  data?: unknown;
  is_auth?: boolean;
  abortPrevious?: boolean;
  headers?: Record<string, string>;
}

// Queued Request interface
interface QueuedRequest {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  endpoint: string;
  options: ApiOptions;
}

// Token Response interface
interface TokenResponse {
  access?: string;
  access_token?: string;
  refresh?: string;
  refresh_token?: string;
}

// Extended RequestInit with custom auth flag
interface ExtendedRequestInit extends RequestInit {
  is_auth?: boolean;
}

class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private readonly requestInterceptors: RequestInterceptor[] = [];
  private readonly responseInterceptors: ResponseInterceptor[] = [];
  private readonly abortControllers: Map<string, AbortController> = new Map();

  // Refresh token logic
  private isRefreshing: boolean = false;
  private refreshQueue: QueuedRequest[] = [];
  private refreshPromise: Promise<void> | null = null;

  constructor(baseURL: string, defaultHeaders: Record<string, string> = {}) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };

    // Add default authentication interceptor
    this.addRequestInterceptor(this.authInterceptor.bind(this));
  }

  // Add request interceptor
  public addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  // Add response interceptor
  public addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  // Authentication interceptor - attaches Bearer token if is_auth is true
  private async authInterceptor(
    url: string,
    options: ExtendedRequestInit
  ): Promise<{ url: string; options: RequestInit }> {
    const { is_auth = true, ...restOptions } = options;

    if (is_auth) {
      try {
        const token = useStore.getState().token;

        if (token) {
          restOptions.headers = {
            ...restOptions.headers,
            Authorization: `Bearer ${token}`,
          };
        }
      } catch (error) {
        console.error('Error retrieving token:', error);
      }
    }

    return { url, options: restOptions };
  }

  // Apply all request interceptors
  private async applyRequestInterceptors(
    url: string,
    options: RequestInit
  ): Promise<{ url: string; options: RequestInit }> {
    let modifiedUrl = url;
    let modifiedOptions = options;

    for (const interceptor of this.requestInterceptors) {
      const result = await interceptor(modifiedUrl, modifiedOptions);
      modifiedUrl = result.url;
      modifiedOptions = result.options;
    }

    return { url: modifiedUrl, options: modifiedOptions };
  }

  // Apply all response interceptors
  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let modifiedResponse = response;

    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse);
    }

    return modifiedResponse;
  }

  // Refresh access token
  private async refreshAccessToken(): Promise<void> {
    try {
      const refreshToken = useStore.getState().refreshToken;

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(`${this.baseURL}/api/v1/customers/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Refresh token failed');
      }

      const data = (await response.json()) as TokenResponse;
      console.log('Token refresh response:', data);

      // Update tokens in Zustand store
      const newAccessToken = data.access || data.access_token;
      const newRefreshToken = data.refresh || data.refresh_token || refreshToken;

      if (!newAccessToken) {
        throw new Error('No access token in refresh response');
      }

      useStore.getState().setToken(newAccessToken, newRefreshToken);
    } catch (error) {
      // Clear storage and redirect to login
      await this.handleRefreshFailure();
      throw error;
    }
  }

  // Handle refresh token failure
  private async handleRefreshFailure(): Promise<void> {
    try {
      // Clear all auth-related storage - this will trigger Zustand to update isLoggedIn
      useStore.getState().clearToken();

      // Small delay to ensure storage is cleared and state is updated
      await new Promise<void>(resolve => setTimeout(resolve, 100));

      // The navigation container will automatically show the Login screen
      // because isLoggedIn will be false after clearing tokens
    } catch (error) {
      console.error('Error during refresh failure handling:', error);
    }
  }

  // Process queued requests after token refresh
  private async processQueue(error: Error | null = null): Promise<void> {
    const queue = [...this.refreshQueue];
    this.refreshQueue = [];

    for (const request of queue) {
      if (error) {
        request.reject(error);
      } else {
        try {
          const result = await this.executeRequest(request.endpoint, request.options);
          request.resolve(result);
        } catch (err) {
          request.reject(err);
        }
      }
    }
  }

  // Execute the actual fetch request
  private async executeRequest<T = unknown>(
    endpoint: string,
    options: ApiOptions
  ): Promise<T> {
    const {
      method = 'GET',
      data,
      is_auth = true,
      abortPrevious = false,
      headers = {},
    } = options;

    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;

    console.log('API Request URL:', url);

    // Handle abort previous request logic
    if (abortPrevious) {
      const existingController = this.abortControllers.get(endpoint);
      if (existingController) {
        existingController.abort();
      }
    }

    // Create new AbortController for this request
    const abortController = new AbortController();
    if (abortPrevious) {
      this.abortControllers.set(endpoint, abortController);
    }

    try {
      // Prepare request options
      const requestOptions: ExtendedRequestInit = {
        method,
        headers: {
          ...this.defaultHeaders,
          ...headers,
        },
        signal: abortController.signal,
        is_auth,
      };

      // Add body for methods that support it
      if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        requestOptions.body = JSON.stringify(data);
      }

      // Apply request interceptors
      const intercepted = await this.applyRequestInterceptors(url, requestOptions);

      // Execute fetch
      let response = await fetch(intercepted.url, intercepted.options);

      // Apply response interceptors
      response = await this.applyResponseInterceptors(response);

      // Handle 401 Unauthorized
      if (response.status === 401 && is_auth) {
        console.log('401 Unauthorized - Token refresh needed');

        // If already refreshing, queue this request
        if (this.isRefreshing) {
          console.log('Already refreshing - queuing request');
          return new Promise<T>((resolve, reject) => {
            this.refreshQueue.push({
              resolve: resolve as (value: unknown) => void,
              reject,
              endpoint,
              options,
            });
          });
        }

        // Start refresh process
        this.isRefreshing = true;

        try {
          // Single refresh call
          if (!this.refreshPromise) {
            console.log('Starting token refresh...');
            this.refreshPromise = this.refreshAccessToken();
          }

          await this.refreshPromise;
          this.refreshPromise = null;

          console.log('Token refreshed - retrying original request');

          // Retry the original request with new token
          const retryResult = await this.executeRequest<T>(endpoint, options);

          // Process queued requests
          await this.processQueue();

          return retryResult;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Process queue with error
          await this.processQueue(refreshError as Error);
          throw refreshError;
        } finally {
          this.isRefreshing = false;
        }
      }

      // Handle other error status codes
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.message || `Server error: ${response.status}`,
          'server',
          response.status,
          errorData
        );
      }

      // Parse and return response
      const responseData = (await response.json().catch(() => ({}))) as T;
      return responseData;
    } catch (error: unknown) {
      // Handle AbortError
      if (error instanceof Error && error.name === 'AbortError') {
        throw new APIError('Request was cancelled', 'cancelled');
      }

      // Handle network errors
      if (error instanceof TypeError) {
        throw new APIError('Network error: Unable to connect to server', 'network');
      }

      // Re-throw APIError
      if (error instanceof APIError) {
        throw error;
      }

      // Handle unknown errors
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      throw new APIError(errorMessage, 'network');
    } finally {
      // Clean up abort controller
      if (abortPrevious) {
        this.abortControllers.delete(endpoint);
      }
    }
  }

  // Main callApi method with generic type support
  public async callApi<T = unknown>(
    endpoint: string,
    options: ApiOptions = {}
  ): Promise<T> {
    return this.executeRequest<T>(endpoint, options);
  }

  // Convenience method: GET
  public async get<T = unknown>(
    endpoint: string,
    options: Omit<ApiOptions, 'method'> = {}
  ): Promise<T> {
    return this.callApi<T>(endpoint, { ...options, method: 'GET' });
  }

  // Convenience method: POST
  public async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    options: Omit<ApiOptions, 'method' | 'data'> = {}
  ): Promise<T> {
    return this.callApi<T>(endpoint, { ...options, method: 'POST', data });
  }

  // Convenience method: PUT
  public async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    options: Omit<ApiOptions, 'method' | 'data'> = {}
  ): Promise<T> {
    return this.callApi<T>(endpoint, { ...options, method: 'PUT', data });
  }

  // Convenience method: DELETE
  public async delete<T = unknown>(
    endpoint: string,
    options: Omit<ApiOptions, 'method'> = {}
  ): Promise<T> {
    return this.callApi<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Convenience method: PATCH
  public async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    options: Omit<ApiOptions, 'method' | 'data'> = {}
  ): Promise<T> {
    return this.callApi<T>(endpoint, { ...options, method: 'PATCH', data });
  }

  // Update base URL
  public setBaseURL(url: string): void {
    this.baseURL = url;
  }

  // Update default headers
  public setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  // Cancel all in-flight requests
  public cancelAllRequests(): void {
    this.abortControllers.forEach((controller) => controller.abort());
    this.abortControllers.clear();
  }

  // Cancel specific request
  public cancelRequest(endpoint: string): void {
    const controller = this.abortControllers.get(endpoint);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(endpoint);
    }
  }

  // Get base URL
  public getBaseURL(): string {
    return this.baseURL;
  }

  // Get default headers
  public getDefaultHeaders(): Readonly<Record<string, string>> {
    return { ...this.defaultHeaders };
  }
}

// Create and export singleton instance
// TODO: Update the baseURL to your actual API base URL
const apiClient = new ApiClient('http://localhost:8006');

export default apiClient;

// Export types for external use
export type { ApiOptions, HttpMethod, TokenResponse };