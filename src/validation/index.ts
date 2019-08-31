import { FORM_ERROR } from "final-form";
import { ContextEntry } from "io-ts";
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
export type ValidationErrors<FD extends object, ErrorType = string> = Partial<
  Readonly<Record<keyof FD | typeof FORM_ERROR, ErrorType>>
>;
// TODO the type above only works for "flat" form data objects.

// TODO: make this smarter
const isArray = (c: ContextEntry) =>
  Array.isArray(c.actual) ||
  ((c as unknown) as { readonly type: { readonly _tag?: string } }).type
    ._tag === "ReadonlyArrayType";

// tslint:disable: no-if-statement readonly-array no-throw
const renderError = (
  errorMessage: string,
  c: ContextEntry,
  cs: ContextEntry[],
  isArrayEntry: boolean = false,
): string | string[] | Record<string, unknown> => {
  const [nextC, ...nextCs] = cs;

  const nextResult = (nextIsArrayEntry: boolean) =>
    cs.length > 0
      ? renderError(errorMessage, nextC, nextCs, nextIsArrayEntry)
      : errorMessage; // This is a leaf, so render the error message string.

  if (isArray(c)) {
    if (nextC === undefined) {
      throw new Error(`Expect next context entry to exist.`);
    }
    const index = Number.parseInt(nextC.key, 10);
    if (Number.isNaN(index)) {
      throw new Error(`Index [${nextC.key}] not an integer`);
    }
    return { [c.key]: [...new Array(index), nextResult(true)] };
  } else {
    return isArrayEntry ? nextResult(false) : { [c.key]: nextResult(false) };
  }
};
// tslint:enable: no-if-statement readonly-array no-throw

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
    const [c, ...cs] = error.context.slice(1);

    const errorMessage = error.message || defaultMessage(error);

    const nextError = renderError(errorMessage, c, cs);
    // tslint:disable-next-line: no-if-statement
    if (!isObject(nextError)) {
      // tslint:disable-next-line: no-throw
      throw new Error("Unexpected validation result.");
    }
    return mergeDeep(accumulator, nextError);
  }, initial);
};
