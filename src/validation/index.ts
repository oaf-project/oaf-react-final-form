import { ContextEntry } from "io-ts";
import { Errors, ValidationError } from "io-ts/lib";
import { FormData, ValidationErrors } from "../components/common";
import { getOrUndefined } from "total-functions";

// We re-export some types from io-ts-types just for the convenience of users.
export { withMessage } from "io-ts-types/lib/withMessage";
export { NumberFromString } from "io-ts-types/lib/NumberFromString";

type FinalFormValidationError =
  | undefined
  | string
  | readonly FinalFormValidationError[]
  | { readonly [k: string]: FinalFormValidationError };

type FinalFormValidationArray = readonly FinalFormValidationError[];
type FinalFormValidationRecord = {
  readonly [k: string]: FinalFormValidationError;
};

type TypeWithTag = {
  readonly _tag?: string;
  readonly type?: TypeWithTag;
};

// TODO: make this smarter
const isArrayType = (c: ContextEntry): boolean => {
  const tag = ((c as unknown) as TypeWithTag).type?._tag;
  return (
    Array.isArray(c.actual) ||
    (tag !== undefined &&
      ["AnyArrayType", "ArrayType", "ReadonlyArrayType"].includes(tag))
  );
};

// Shenanigans to work around the fact that io-ts puts separate entries in the error array when an intersection type is used,
// which will always be the case if a form codec has a required and an optional component.
const isIntersectionType = (c: ContextEntry): boolean => {
  const typeWithTag = (c as unknown) as TypeWithTag;
  return (
    typeWithTag?.type?._tag === "IntersectionType" || // This might be "ReadonlyType", so we also have to check the descendant
    typeWithTag?.type?.type?._tag === "IntersectionType"
  );
};

const renderError = (
  errorMessage: string,
  c: ContextEntry,
  cs: ReadonlyArray<ContextEntry>,
  isArrayEntry: boolean,
  isIntersection: boolean,
): FinalFormValidationError => {
  const [nextC, ...nextCs] = cs;

  const nextResult = (nextIsArrayEntry: boolean): FinalFormValidationError =>
    cs.length > 0
      ? renderError(
          errorMessage,
          nextC,
          nextCs,
          nextIsArrayEntry,
          isIntersectionType(c),
        )
      : errorMessage; // This is a leaf, so render the error message string.

  /* eslint-disable functional/no-conditional-statement */
  if (isArrayType(c)) {
    if (nextC === undefined) {
      return { [c.key]: "Expected next context entry to exist." };
    }
    const index = Number.parseInt(nextC.key, 10);
    if (Number.isNaN(index)) {
      return { [c.key]: `Index [${nextC.key}] not an integer` };
    }
    return { [c.key]: [...new Array(index), nextResult(true)] };
  } else {
    return isArrayEntry || isIntersection
      ? nextResult(false)
      : { [c.key]: nextResult(false) };
  }
  /* eslint-enable functional/no-conditional-statement */
};

const isObject = (item: unknown): item is FinalFormValidationRecord =>
  item && typeof item === "object" && !Array.isArray(item);

const mergeDeepObjects = <
  A extends FinalFormValidationRecord,
  B extends FinalFormValidationRecord
>(
  a: A,
  b: B,
): A & B =>
  Object.keys(b).reduce(
    (acc, key) => ({
      ...acc,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      [key]: mergeDeep(getOrUndefined(a, key), getOrUndefined(b, key)),
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

  return aExtended.map((value, index) =>
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    mergeDeep(value, getOrUndefined(b, index)),
  );
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
    const [context0, c, ...cs] = error.context;

    const isArrayEntry = false;

    const errorMessage = error.message || defaultMessage(error);

    const nextError = renderError(
      errorMessage,
      c,
      cs,
      isArrayEntry,
      isIntersectionType(context0),
    );
    // TODO remove this gnarly cast
    return mergeDeep(accumulator, nextError) as ValidationErrors<FD>;
  }, {});
