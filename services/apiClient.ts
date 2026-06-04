import axios from 'axios';
import {BASE_URL} from '@env';

const baseURL = typeof BASE_URL === 'string' ? BASE_URL.trim() : '';

if (!baseURL) {
  throw new Error(
    'BASE_URL is missing: define BASE_URL in .env before running the app.',
  );
}

export const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (__DEV__) {
  apiClient.interceptors.request.use(config => {
    console.log(
      `[apiClient] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
      config.params ? `params=${JSON.stringify(config.params)}` : '',
    );
    return config;
  });

  apiClient.interceptors.response.use(
    response => response,
    error => {
      if (error.response) {
        console.error(
          `[apiClient] ERROR ${error.response.status}`,
          `${error.config?.method?.toUpperCase()} ${error.config?.url}`,
          JSON.stringify(error.response.data),
        );
      }
      return Promise.reject(error);
    },
  );
}

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

export const extractApiData = <T>(payload: T | ApiEnvelope<T>): T => {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    (payload as ApiEnvelope<T>).data !== undefined
  ) {
    return (payload as ApiEnvelope<T>).data as T;
  }

  return payload as T;
};
