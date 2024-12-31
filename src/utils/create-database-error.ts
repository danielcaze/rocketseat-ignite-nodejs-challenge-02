import { ErrorCode } from "../enums/app-error";
import { AppError } from "./app-error";

export function createDatabaseError(knexError: any) {
  let message = "An unknown database error occurred.";
  let statusCode = 500;
  let code = ErrorCode.DATABASE_ERROR;

  if (knexError.code === "ER_DUP_ENTRY") {
    statusCode = 400;
    code = ErrorCode.DUPLICATE_ENTRY;
    message = extractDuplicateValue(knexError.message);
  } else if (
    knexError.code === "ER_NO_REFERENCED_ROW" ||
    knexError.code === "ER_ROW_IS_REFERENCED"
  ) {
    statusCode = 409;
    code = ErrorCode.FOREIGN_KEY_CONFLICT;
    message =
      "This record is linked to another resource and cannot be deleted or modified.";
  }

  return new AppError(code, message, statusCode, { original: knexError });
}

function extractDuplicateValue(knexErrorMessage: string) {
  const valueMatch = knexErrorMessage.match(/Duplicate entry '([^']+)'/);
  const fieldMatch = knexErrorMessage.match(/for key '([^']+)'/);

  const duplicateValue = valueMatch ? valueMatch[1] : "unknown value";
  const field = fieldMatch ? fieldMatch[1].split(".").pop() : "unknown field";

  return `Duplicate entry '${duplicateValue}' for the unique field '${field}'.`;
}
