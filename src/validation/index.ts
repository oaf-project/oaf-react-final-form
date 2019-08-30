import { FORM_ERROR } from "final-form";
import { ValidationError as IoTsValidationError } from "io-ts";
import { Errors, ValidationError } from "io-ts/lib";
import { FormData } from "../components/common";

// We re-export `withMessage` just for the convenience of users.
export { withMessage } from "io-ts-types/lib/withMessage";

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
export type ValidationErrors<FD extends FormData, ErrorType = string> = Partial<
  Readonly<Record<keyof FD | typeof FORM_ERROR, ErrorType>>
>;
// TODO the type above only works for "flat" form data objects.

// tslint:disable: no-if-statement no-object-mutation no-expression-statement
const renderError = (
  error: IoTsValidationError,
  defaultMessage: (e: ValidationError) => string,
) => {
  // Discard the first context entry because it's of no use to us here.
  const context = error.context.slice(1);

  // tslint:disable-next-line: readonly-keyword
  const result: { [k: string]: unknown } = {};

  // tslint:disable-next-line: no-let
  let cursor: typeof result = result;

  // tslint:disable-next-line: no-loop-statement
  context.forEach((c, i) => {
    const isLastContextEntry = i === context.length - 1;
    if (isLastContextEntry) {
      // This is a leaf, so render the error message string.
      const errorMessage = error.message || defaultMessage(error);
      cursor[c.key] = errorMessage;
    } else {
      // Not a leaf, so move the cursor down to next level.
      const nextLevel: typeof result = {};
      cursor[c.key] = nextLevel;
      cursor = nextLevel;
    }
  });

  return result;
};
// tslint:enable: no-if-statement no-object-mutation no-expression-statement

const isObject = (item: unknown): item is object => {
  return item && typeof item === "object" && !Array.isArray(item);
};

// tslint:disable no-expression-statement no-if-statement no-object-mutation no-any
const mergeDeep = <
  A extends Record<string, any>,
  B extends Record<string, any>
>(
  target: A,
  source: B,
): A & B => {
  const output: Record<string, any> = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key] = mergeDeep(target[key], source[key]);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output as A & B;
};
// tslint:enable no-expression-statement no-if-statement no-object-mutation no-any

/**
 * Converts an io-ts Errors to a (strongly typed version of) final-form ValidationErrors.
 */
export const toValidationErrors = <FD extends FormData>(
  ioTsErrors: Errors,
  defaultMessage: (e: ValidationError) => string,
): ValidationErrors<FD> => {
  const initial = {} as ValidationErrors<FD>;

  return ioTsErrors.reduce((accumulator, error) => {
    return mergeDeep(accumulator, renderError(error, defaultMessage));
  }, initial);
};
