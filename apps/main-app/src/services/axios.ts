import { NotificationError, NotificationWarning } from '@vissoft-react/common';
import useConfigAppStore from '../modules/Layouts/stores';
import { AnyElement, CommonError } from '@vissoft-react/common';
import { notification } from 'antd';
import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { StorageService, ILoginResponse } from '@vissoft-react/common';
import {
  baseApiUrl,
  OidcClientCredentials,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
} from '../constants';

const authApi = {
  tokenUrl: `${baseApiUrl}/admin-service/private/oauth2/token`,
};

const STATUS_TOKEN_EXPIRED = 401;
const API_REQUEST_TIMEOUT = 60000; // 20s

let isRefreshing = false;
let failedQueue: AnyElement[] = [];

const processQueue = (error: AnyElement, token: AnyElement = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const axiosClient = axios.create({
  baseURL: baseApiUrl + '/admin-service/private/api',
  timeout: API_REQUEST_TIMEOUT,
  responseType: 'json',
  withCredentials: false,
});

const handleRequest = (req: InternalAxiosRequestConfig) => {
  req.headers = req.headers ?? {};
  const token = StorageService.getAccessToken(ACCESS_TOKEN_KEY);
  if (token) {
    if (!req.headers['Authorization']) {
      req.headers['Authorization'] = `Bearer ${token}`;
    }
  }
  req.headers['Accept-Language'] = 'vi-VN';
  req.headers['Accept'] = '*';
  return req;
};

const handleRequestError = (error: AnyElement) => {
  return Promise.reject(error);
};

const resInterceptor = (response: AxiosResponse) => {
  return response;
};

const errInterceptor = (error: AnyElement) => {
  const httpCode = error?.response?.status;
  const config = error?.response?.config;

  if (httpCode === STATUS_TOKEN_EXPIRED && config?.url !== authApi.tokenUrl) {
    const refreshToken = StorageService.getRefreshToken(REFRESH_TOKEN_KEY);

    if (isRefreshing) {
      return new Promise(function (resolve, reject) {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          error.config.headers['Authorization'] = 'Bearer ' + token;
          return axiosClient(error.config);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    error.config._retry = true;
    isRefreshing = true;

    if (!refreshToken) {
      notification.destroy();
      const tokenError = new Error('Không tìm thấy refresh token');
      processQueue(tokenError, null);
      isRefreshing = false;
      useConfigAppStore.getState().logoutStore();
      return Promise.reject(tokenError);
    }
    const bodyRefresh = new URLSearchParams();
    bodyRefresh.append('grant_type', 'refresh_token');
    bodyRefresh.append('refresh_token', refreshToken);
    return axios
      .post<ILoginResponse>(authApi.tokenUrl, bodyRefresh, {
        baseURL: baseApiUrl,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(
            OidcClientCredentials.clientId +
              ':' +
              OidcClientCredentials.clientSecret
          )}`,
        },
      })
      .then((response) => {
        const token = response?.data?.access_token;
        StorageService.setAccessToken(ACCESS_TOKEN_KEY, token);
        processQueue(null, token);
        return new Promise((resolve, reject) => {
          axiosClient
            .request({
              ...config,
              headers: {
                ...config?.headers,
                Authorization: `Bearer ${token}`,
              },
            })
            .then((response: AnyElement) => {
              resolve(response);
            })
            .catch((error: AnyElement) => {
              reject(error);
            });
        });
      })
      .catch((errorRefresh) => {
        processQueue(errorRefresh, null);
        if (
          errorRefresh.status === 401 ||
          errorRefresh?.config?.url === authApi.tokenUrl
        ) {
          useConfigAppStore.getState().logoutStore();
          NotificationWarning(
            'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại'
          );
          return Promise.reject(new Error('Phiên đăng nhập đã hết hạn'));
        }
        return Promise.reject(errorRefresh?.response?.data);
      })
      .finally(() => {
        isRefreshing = false;
      });
  }

  const CError: CommonError = error?.response?.data;

  if (CError instanceof Blob) {
    return Promise.reject(CError);
  } else if (
    (!CError.errors || CError.errors.length === 0) &&
    error?.response?.status !== 404
  ) {
    NotificationError(CError);
  }
  return Promise.reject(CError || error);
};

axiosClient.interceptors.request.use(handleRequest, handleRequestError);
axiosClient.interceptors.response.use(resInterceptor, errInterceptor);

export const safeRequest = async <T>(
  requestPromise: Promise<T>,
  errorHandler?: (error: unknown) => unknown
): Promise<T> => {
  try {
    return await requestPromise;
  } catch (error) {
    console.error('Lỗi API request:', error);
    if (errorHandler) {
      return errorHandler(error) as T;
    }
    throw error;
  }
};

const safeApiClient = {
  get: <T>(url: string, config?: object) =>
    safeRequest(axiosClient.get<T>(url, config)),
  post: <T>(url: string, data?: unknown, config?: object) =>
    safeRequest(axiosClient.post<T>(url, data, config)),
  put: <T>(url: string, data?: unknown, config?: object) =>
    safeRequest(axiosClient.put<T>(url, data, config)),
  delete: <T>(url: string, config?: object) =>
    safeRequest(axiosClient.delete<T>(url, config)),
  patch: <T>(url: string, data?: unknown, config?: object) =>
    safeRequest(axiosClient.patch<T>(url, data, config)),
};

export { authApi, safeApiClient };
