// Standardized API response utilities

export interface ApiResponse<T = any> {
  ok: true;
  data: T;
}

export interface ApiError {
  ok: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export function apiResponse<T>(data: T): ApiResponse<T> {
  return {
    ok: true,
    data,
  };
}

export function apiError(
  message: string,
  statusCode: number = 500,
  details?: any,
  code?: string
): ApiError {
  return {
    ok: false,
    error: {
      code: code || `ERROR_${statusCode}`,
      message,
      details,
    },
  };
}