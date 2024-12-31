import { ErrorCode, ErrorMessage, ErrorStatusCode } from "../enums/app-error";

export class AppError extends Error {
  public code: ErrorCode;
  public statusCode: number;
  public details?: any;

  constructor(
    code: ErrorCode,
    message?: string,
    statusCode?: number,
    details?: any
  ) {
    const finalMessage =
      message ?? ErrorMessage[code] ?? ErrorMessage[ErrorCode.UNKNOWN_ERROR];
    super(finalMessage);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode ?? ErrorStatusCode[code] ?? 500;
    this.details = details;
  }
}
