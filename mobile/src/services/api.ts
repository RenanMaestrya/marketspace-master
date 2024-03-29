import {
  storageAuthTokenGet,
  storageAuthTokenSave,
} from '@storage/StorageAuthToken';
import { AppError } from '@utils/AppError';
import axios, { AxiosInstance } from 'axios';

type RegisterInterceptTokenManagerProps = {
  signOut: () => void;
  refreshTokenUpdated: (newToken: string) => void;
};

type APIInstanceProps = AxiosInstance & {
  registerInterceptTokenManager: (
    data: RegisterInterceptTokenManagerProps
  ) => () => void;
};

type PromiseType = {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
};

type ProcessQueueParams = {
  error: Error | null;
  token: string | null;
};

const api = axios.create({
  baseURL: 'http://10.0.1.254:3333/',
}) as APIInstanceProps;

let isRefreshing = false;
let failedQueue: PromiseType[] = [];

const processQueue = ({ error, token }: ProcessQueueParams) => {
  failedQueue.forEach((request) => {
    if (error) {
      request.reject(error);
    } else {
      request.resolve(token);
    }
  });

  failedQueue = [];
};

api.registerInterceptTokenManager = ({ signOut, refreshTokenUpdated }) => {
  const interceptTokenManager = api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (requestError) => {
      if (requestError?.response?.status === 401) {
        if (
          requestError.response.data?.message === 'token.expired' ||
          requestError.response.data?.message === 'token.invalid'
        ) {
          const oldToken = await storageAuthTokenGet();

          // não há token
          if (!oldToken) {
            signOut();

            return Promise.reject(requestError);
          }

          // requisição a ser enfileirada
          const originalRequest = requestError.config;

          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;

                return axios(originalRequest);
              })
              .catch((error) => {
                throw error;
              });
          }

          isRefreshing = true;

          return new Promise(async (resolve, reject) => {
            try {
              const { data } = await api.post('/sessions/refresh-token', {
                token: oldToken,
              });

              await storageAuthTokenSave(data.token);

              api.defaults.headers.common[
                'Authorization'
              ] = `Bearer ${data.token}`;

              originalRequest.headers['Authorization'] = `Bearer ${data.token}`;

              refreshTokenUpdated(data.token);

              processQueue({ error: null, token: data.token });

              resolve(originalRequest);
            } catch (error: any) {
              processQueue({ error, token: null });
              signOut();
              reject(error);
            } finally {
              isRefreshing = false;
            }
          });
        }

        signOut();
      }

      if (requestError.response?.data) {
        return Promise.reject(new AppError(requestError.response.data.message));
      } else {
        return Promise.reject(requestError);
      }
    }
  );

  return () => {
    api.interceptors.response.eject(interceptTokenManager);
  };
};

export { api };
