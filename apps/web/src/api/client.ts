import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition: (error: AxiosError) => boolean;
}

const defaultRetryConfig: RetryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error: AxiosError) => {
    if (!error.response) return true;
    return error.response.status >= 500;
  },
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

const BRIDGE_URL = '/ai-bridge';

const sendToBridge = async (data: any) => {
  try {
    await axios.post(`${BRIDGE_URL}/front-send`, data, {
      timeout: 5000,
    });
  } catch (e) {
    console.log('Bridge sync failed (non-critical):', e);
  }
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    sendToBridge({
      type: 'request',
      url: config.url,
      method: config.method,
      data: config.data,
      params: config.params,
      timestamp: new Date().toISOString(),
    });
    
    return config;
  },
  error => {
    sendToBridge({
      type: 'request_error',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  response => {
    sendToBridge({
      type: 'response',
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data,
      timestamp: new Date().toISOString(),
    });
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean; _retryCount?: number };

    sendToBridge({
      type: 'response_error',
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      error: error.message,
      responseData: error.response?.data,
      timestamp: new Date().toISOString(),
    });

    if (error.response?.status === 401) {
      if (!originalRequest._retry) {
        if (isRefreshing) {
          return new Promise(resolve => {
            subscribeTokenRefresh((token: string) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              resolve(apiClient(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshToken = localStorage.getItem('refresh_token');
          if (refreshToken) {
            const response = await apiClient.post('/auth/refresh', {
              refresh_token: refreshToken,
            });

            const { access_token, refresh_token: newRefreshToken } = response.data.data;
            localStorage.setItem('auth_token', access_token);
            localStorage.setItem('refresh_token', newRefreshToken);

            onTokenRefreshed(access_token);
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('refresh_token');
          if (window.location.pathname !== '/') {
            window.location.href = '/';
          }
        } finally {
          isRefreshing = false;
        }
      }
      return Promise.reject(error);
    }

    const retryConfig = defaultRetryConfig;

    if (retryConfig.retryCondition(error)) {
      originalRequest._retryCount = originalRequest._retryCount || 0;

      if (originalRequest._retryCount < retryConfig.retries) {
        originalRequest._retryCount += 1;

        await delay(retryConfig.retryDelay * originalRequest._retryCount);

        return apiClient(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  code?: number;
  success?: boolean;
  timestamp?: number;
}

export const apiRequest = async <T = any>(config: AxiosRequestConfig): Promise<T> => {
  try {
    const response: AxiosResponse<ApiResponse<T>> = await apiClient(config);

    if (response.data.code !== undefined && response.data.code !== 0) {
      const error = new Error(response.data.message || '请求失败');
      sendToBridge({
        type: 'business_error',
        url: config.url,
        message: response.data.message,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }

    if (response.data.success === false) {
      const error = new Error(response.data.message || '请求失败');
      sendToBridge({
        type: 'business_error',
        url: config.url,
        message: response.data.message,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }

    return response.data.data;
  } catch (error) {
    sendToBridge({
      type: 'api_request_error',
      url: config.url,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
};

export default apiClient;
