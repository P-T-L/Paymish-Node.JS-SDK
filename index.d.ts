export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | string;

export interface RequestOptions {
  headers?: Record<string, string>;
  idempotencyKey?: string;
  customTimeout?: number;
  [key: string]: any;
}

export interface HttpClientOptions {
  baseUrl?: string;
  timeout?: number;
  maxRetries?: number;
  retryDelayMs?: number;
}

export interface AuthCredentials {
  public_key: string;
  secret_key: string;
}

export interface GenerateTokenData {
  token?: string;
  access_token?: string;
  expires_in?: number;
  token_type?: string;
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  status: "success" | "error" | string;
  message?: string;
  data?: T;
  errors?: any;
  [key: string]: any;
}

export class PaymishError extends Error {
  name: "PaymishError";
  statusCode: number;
  errors: any;
  requestData: any;

  constructor(message: string, statusCode: number, errors?: any, requestData?: any);
}

export class HttpClient {
  baseUrl: string;
  timeout: number;
  maxRetries: number;
  retryDelayMs: number;

  constructor(options?: HttpClientOptions);

  request<T = any>(
    method: HttpMethod,
    endpoint: string,
    body?: any,
    options?: RequestOptions | Record<string, string>,
    customTimeout?: number | null
  ): Promise<T>;
}

export class Auth {
  private client: HttpClient;

  constructor(client: HttpClient);

  /**
   * Generates an authentication token using public and secret keys
   * POST /api/user-service/external/v1/generate-token
   */
  generateToken(
    credentials: AuthCredentials,
    options?: RequestOptions
  ): Promise<ApiResponse<GenerateTokenData>>;
}

export class Paymish {
  client: HttpClient;
  auth: Auth;

  constructor(options?: HttpClientOptions);

  static PaymishError: typeof PaymishError;
}

export default Paymish;
