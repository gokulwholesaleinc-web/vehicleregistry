/**
 * Standardized API Response Helpers
 * 
 * Ensures all API endpoints use consistent response format:
 * Success: { ok: true, data: ... }
 * Error: { ok: false, error: { message: string, details?: any } }
 */

import { Response } from "express";

export interface StandardSuccessResponse<T = any> {
  ok: true;
  data: T;
}

export interface StandardErrorResponse {
  ok: false;
  error: {
    message: string;
    details?: any;
  };
}

export type StandardResponse<T = any> = StandardSuccessResponse<T> | StandardErrorResponse;

/**
 * Send a standardized success response
 */
export function sendSuccess<T>(res: Response, data: T, status: number = 200): Response {
  return res.status(status).json({
    ok: true,
    data
  } as StandardSuccessResponse<T>);
}

/**
 * Send a standardized error response
 */
export function sendError(
  res: Response, 
  message: string, 
  status: number = 400, 
  details?: any
): Response {
  return res.status(status).json({
    ok: false,
    error: {
      message,
      details
    }
  } as StandardErrorResponse);
}

/**
 * Send a standardized validation error response
 */
export function sendValidationError(res: Response, zodError: any): Response {
  return sendError(res, "Invalid input", 400, zodError.flatten());
}

/**
 * Send a standardized not found error response
 */
export function sendNotFound(res: Response, resource: string = "Resource"): Response {
  return sendError(res, `${resource} not found`, 404);
}

/**
 * Send a standardized unauthorized error response
 */
export function sendUnauthorized(res: Response, message: string = "Unauthorized"): Response {
  return sendError(res, message, 401);
}

/**
 * Send a standardized forbidden error response
 */
export function sendForbidden(res: Response, message: string = "Forbidden"): Response {
  return sendError(res, message, 403);
}

/**
 * Send a standardized server error response
 */
export function sendServerError(res: Response, message: string = "Internal server error"): Response {
  return sendError(res, message, 500);
}

/**
 * Wrapper for async route handlers that automatically catch errors
 */
export function asyncHandler(fn: Function) {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      console.error("Async handler error:", error);
      sendServerError(res, error.message || "Internal server error");
    });
  };
}