import { realApi } from './realApi';

type ApiType = typeof realApi;

let currentApi: ApiType = realApi;
let isUsingMock = false;
let hasCheckedService = false;

export const initApi = async (): Promise<void> => {
  currentApi = realApi;
  isUsingMock = false;
  hasCheckedService = true;
  console.log('[API] Force using real backend API (production mode)');
};

export const getApi = (): ApiType => {
  return currentApi;
};

export const isMockMode = (): boolean => {
  return false;
};

export const api = currentApi;
