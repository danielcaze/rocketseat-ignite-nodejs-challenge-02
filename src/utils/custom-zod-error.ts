import type { z } from "zod";

export class CustomZodError {
  name: string;
  statusCode: number;
  details: { path: string; message: string }[];

  constructor(error: z.ZodError) {
    this.name = "CustomZodError";
    this.statusCode = 400;

    const isBodyMissing = error.errors.some(
      (err) =>
        err.code === "invalid_type" &&
        err.expected === "object" &&
        err.received === "undefined" &&
        err.path.length === 0
    );

    if (isBodyMissing) {
      this.details = [
        {
          path: "",
          message: "Request body is required",
        },
      ];
    } else {
      this.details = error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      }));
    }
  }
}
