import { ValidationErrors } from "final-form";
import { Errors } from "io-ts/lib";

// tslint:disable-next-line: readonly-array
export type FieldValue = undefined | string | string[];

export type FormData = {
  readonly [index in string]: FieldValue;
};

/**
 * Converts an io-ts Errors to a final-form ValidationErrors.
 */
export const toValidationErrors = (ioTsErrors: Errors): ValidationErrors => {
  const initial: ValidationErrors = {};

  return ioTsErrors.reduce((accumulator, error) => {
    const lastContext = error.context[error.context.length - 1];
    return {
      ...accumulator,
      [lastContext.key]: error.message || "This field is invalid.",
    };
  }, initial);
};
