import { Errors, ValidationError } from "io-ts/lib";

export { withMessage } from "io-ts-types/lib/withMessage";

// TODO https://github.com/final-form/final-form/pull/254
export const FORM_ERROR = "FINAL_FORM/form-error" as const;

// tslint:disable-next-line: no-commented-code
// https://github.com/final-form/final-form#form_error-string
// https://github.com/final-form/final-form#onsubmit-values-object-form-formapi-callback-errors-object--void--object--promiseobject--void
// "Submission errors must be in the same shape as the values of the form. You may return a generic error for the whole form (e.g. 'Login Failed') using the special FORM_ERROR string key."
// "Validation errors must be in the same shape as the values of the form. You may return a generic error for the whole form using the special FORM_ERROR string key."
export type ValidationErrors<O> = Partial<
  { readonly [key in keyof O | typeof FORM_ERROR]: string }
>;

/**
 * Converts an io-ts Errors to a final-form ValidationErrors.
 */
export const toValidationErrors = <O>(
  ioTsErrors: Errors,
  defaultMessage: (e: ValidationError) => string,
): ValidationErrors<O> => {
  const initial = {} as ValidationErrors<O>;

  return ioTsErrors.reduce((accumulator, error) => {
    const lastContext = error.context[error.context.length - 1];
    return {
      ...accumulator,
      [lastContext.key]: error.message || defaultMessage(error),
    };
  }, initial);
};
