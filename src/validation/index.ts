import { ContextEntry } from "io-ts";
import { Errors, ValidationError } from "io-ts/lib";
import { FormData, ValidationErrors } from "../components/common";

// We re-export some types from io-ts-types just for the convenience of users.
export { withMessage } from "io-ts-types/lib/withMessage";
export { NumberFromString } from "io-ts-types/lib/NumberFromString";

type FinalFormValidationError =
  | undefined
  | string
  | FinalFormValidationArray
  | FinalFormValidationRecord;
interface FinalFormValidationRecord
  extends Readonly<Record<string, FinalFormValidationError>> {}
interface FinalFormValidationArray
  extends ReadonlyArray<FinalFormValidationError> {}

// TODO: make this smarter
const isArray = (c: ContextEntry) => {
  const tag = ((c as unknown) as { readonly type: { readonly _tag?: string } })
    .type._tag;
  return (
    Array.isArray(c.actual) ||
    (tag !== undefined &&
      ["AnyArrayType", "ArrayType", "ReadonlyArrayType"].includes(tag))
  );
};

// tslint:disable: no-if-statement
const renderError = (
  errorMessage: string,
  c: ContextEntry,
  cs: ReadonlyArray<ContextEntry>,
  isArrayEntry: boolean = false,
): FinalFormValidationError => {
  const [nextC, ...nextCs] = cs;

  const nextResult = (nextIsArrayEntry: boolean) =>
    cs.length > 0
      ? renderError(errorMessage, nextC, nextCs, nextIsArrayEntry)
      : errorMessage; // This is a leaf, so render the error message string.

  if (isArray(c)) {
    if (nextC === undefined) {
      return { [c.key]: "Expected next context entry to exist." };
    }
    const index = Number.parseInt(nextC.key, 10);
    if (Number.isNaN(index)) {
      return { [c.key]: `Index [${nextC.key}] not an integer` };
    }
    return { [c.key]: [...new Array(index), nextResult(true)] };
  } else {
    return isArrayEntry ? nextResult(false) : { [c.key]: nextResult(false) };
  }
};
// tslint:enable: no-if-statement

const isObject = (item: unknown): item is FinalFormValidationRecord =>
  item && typeof item === "object" && !Array.isArray(item);

const mergeDeepObjects = <
  A extends FinalFormValidationRecord,
  B extends FinalFormValidationRecord
>(
  a: A,
  b: B,
) =>
  Object.keys(b).reduce(
    (acc, key) => ({
      ...acc,
      [key]: mergeDeep(a[key], b[key]),
    }),
    a,
  ) as A & B;

const mergeDeepArrays = <
  A extends FinalFormValidationArray,
  B extends FinalFormValidationArray
>(
  a: A,
  b: B,
): FinalFormValidationArray => {
  const aExtended: FinalFormValidationArray =
    a.length >= b.length ? a : [...a, ...new Array(b.length - a.length)];

  return aExtended.map((value, index) => mergeDeep(value, b[index]));
};

const mergeDeep = <
  A extends FinalFormValidationError,
  B extends FinalFormValidationError
>(
  a: A,
  b: B,
): FinalFormValidationError =>
  isObject(a) && isObject(b)
    ? mergeDeepObjects(a, b)
    : Array.isArray(a) && Array.isArray(b)
    ? mergeDeepArrays(a, b)
    : a || b;

/**
 * Converts an io-ts Errors to a (strongly typed version of) final-form ValidationErrors.
 */
export const toValidationErrors = <FD extends FormData>(
  ioTsErrors: Errors,
  defaultMessage: (e: ValidationError) => string,
): ValidationErrors<FD> =>
  ioTsErrors.reduce((accumulator, error) => {
    const [c, ...cs] = error.context.slice(1);

    const errorMessage = error.message || defaultMessage(error);

    const nextError = renderError(errorMessage, c, cs);
    // TODO remove this gnarly cast
    return mergeDeep(accumulator, nextError) as ValidationErrors<FD>;
  }, {});
