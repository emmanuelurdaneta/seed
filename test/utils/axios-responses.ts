import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Respuesta simulada de axios.get: recibe la URL pedida y devuelve (o rechaza con) lo que
// devolvería axios. Qué mock aplica a qué URL lo decide cada test.
export type MockReply = (url: string) => Promise<AxiosResponse>;

const response = (
  status: number,
  data: unknown,
  url: string,
): AxiosResponse => ({
  status,
  statusText: String(status),
  data,
  headers: {},
  config: { url } as InternalAxiosRequestConfig,
});

// axios rechaza la promesa con un AxiosError cuando el status no es 2xx
const statusError = (
  status: number,
  code: string,
  data: unknown,
  url: string,
) =>
  new AxiosError(
    `Request failed with status code ${status}`,
    code,
    undefined,
    undefined,
    response(status, data, url),
  );

export const ok =
  (data: unknown): MockReply =>
  (url) =>
    Promise.resolve(response(200, data, url));

export const notFound = (): MockReply => (url) =>
  Promise.reject(
    statusError(404, AxiosError.ERR_BAD_REQUEST, { detail: 'Not found' }, url),
  );

export const serverError = (): MockReply => (url) =>
  Promise.reject(statusError(500, AxiosError.ERR_BAD_RESPONSE, {}, url));

export const networkError = (): MockReply => () =>
  Promise.reject(
    new AxiosError('connect ECONNREFUSED', AxiosError.ERR_NETWORK),
  );
