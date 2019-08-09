import { Errors, ValidationError } from "io-ts/lib";

// We re-export `withMessage` just for the convenience of users.
export { withMessage } from "io-ts-types/lib/withMessage";

// TODO https://github.com/final-form/final-form/pull/254
export const FORM_ERROR = "FINAL_FORM/form-error" as const;

/**
 * A strongly typed version of the ValidationErrors type from final-form.
 *
 * Also doubles as submission errors.
 *
 * "Submission errors must be in the same shape as the values of the form.
 * You may return a generic error for the whole form (e.g. 'Login Failed')
 * using the special FORM_ERROR string key."
 *
 * "Validation errors must be in the same shape as the values of the form.
 * You may return a generic error for the whole form using the special
 * FORM_ERROR string key."
 *
 * @see https://github.com/final-form/final-form#form_error-string
 * @see https://github.com/final-form/final-form#onsubmit-values-object-form-formapi-callback-errors-object--void--object--promiseobject--void
 */
export type ValidationErrors<
  FormValues extends object,
  ErrorType = string
> = Partial<Readonly<Record<keyof FormValues | typeof FORM_ERROR, ErrorType>>>;

/**
 * Converts an io-ts Errors to a (strongly typed version of) final-form ValidationErrors.
 */
export const toValidationErrors = <FormValues extends object>(
  ioTsErrors: Errors,
  defaultMessage: (e: ValidationError) => string,
): ValidationErrors<FormValues> => {
  const initial = {} as ValidationErrors<FormValues>;

  return ioTsErrors.reduce((accumulator, error) => {
    const lastContext = error.context[error.context.length - 1];
    return {
      ...accumulator,
      [lastContext.key]: error.message || defaultMessage(error),
    };
  }, initial);
};
