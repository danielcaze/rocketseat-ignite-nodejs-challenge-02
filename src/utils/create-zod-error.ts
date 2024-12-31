import type { z } from "zod";
import { AppError } from "./app-error";
import { ErrorCode, ErrorMessage, ErrorStatusCode } from "../enums/app-error";

export function createZodError(error: z.ZodError) {
  const isBodyMissing = error.errors.some(
    (err) =>
      err.code === "invalid_type" &&
      err.expected === "object" &&
      err.received === "undefined" &&
      err.path.length === 0
  );

  const details = isBodyMissing
    ? [{ path: "", message: "Request body is required" }]
    : error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));

  return new AppError(
    ErrorCode.VALIDATION_ERROR,
    ErrorMessage[ErrorCode.VALIDATION_ERROR],
    ErrorStatusCode[ErrorCode.VALIDATION_ERROR],
    details
  );
}
