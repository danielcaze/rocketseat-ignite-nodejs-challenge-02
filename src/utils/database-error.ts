export class DatabaseError {
  name: string;
  statusCode: number;
  code: string;
  details: string;

  constructor(knexError: any) {
    this.name = "DatabaseError";

    this.statusCode = 500;

    this.code = knexError.code;

    switch (knexError.code) {
      case "ER_DUP_ENTRY":
        this.statusCode = 400;
        this.details = this.extractDuplicateValue(knexError.message);
        break;

      case "ER_NO_REFERENCED_ROW":
      case "ER_ROW_IS_REFERENCED":
        this.statusCode = 409;
        this.details =
          "This record is linked to another resource and cannot be deleted or modified.";
        break;

      default:
        this.details =
          knexError.message || "An unknown database error occurred.";
    }
  }

  /**
   * Extracts the duplicated field from the error message.
   */
  private extractDuplicateValue(message: string): string {
    const valueMatch = message.match(/Duplicate entry '([^']+)'/);
    const fieldMatch = message.match(/for key '([^']+)'/);

    const duplicateValue = valueMatch ? valueMatch[1] : "unknown value";
    const field = fieldMatch ? fieldMatch[1].split(".").pop() : "unknown field";

    return `Duplicate entry '${duplicateValue}' for the unique field '${field}'.`;
  }
}
