import { ValidationErrors } from "final-form";
import { Errors, ValidationError } from "io-ts/lib";

export { withMessage } from "io-ts-types/lib/withMessage";

/**
 * Converts an io-ts Errors to a final-form ValidationErrors.
 */
export const toValidationErrors = (
  ioTsErrors: Errors,
  defaultMessage: (e: ValidationError) => string,
): ValidationErrors => {
  const initial: ValidationErrors = {};

  return ioTsErrors.reduce((accumulator, error) => {
    const lastContext = error.context[error.context.length - 1];
    return {
      ...accumulator,
      [lastContext.key]: error.message || defaultMessage(error),
    };
  }, initial);
};
