import { fold } from "fp-ts/lib/Either";
import { Type } from "io-ts/lib";
import { Dictionary } from "lodash";
// TODO remove lodash dependency
import _ from "lodash/fp";
import { FieldValue, FormData } from "../components";

/**
 * The result of running a form validator against a value. A string containing an error message
 * if the validator failed, otherwise undefined.
 */
type FormValidatorResult = string | undefined;

export type FormValidator<A> = (value: A | undefined) => FormValidatorResult;

export type Parser<A> = (s: string) => A | undefined;

export type ValidatorObject<A extends FormData> = {
  readonly [k in keyof Partial<A>]: FormValidator<A[k]>;
};

export type ValidationResult<A extends FormData> = { [P in keyof A]?: string };

export const runValidators = <A extends FormData>(
  validators: ValidatorObject<A>,
  formData: A,
): ValidationResult<A> => {
  const validatorPairs = _.toPairs(validators);

  const validationResultPairs = validatorPairs.map(pair => {
    const [key, validator] = pair;
    // TODO: get rid of this cast.
    const typedValidator = validator as FormValidator<FieldValue>;
    const formDataValue = formData[key];
    const validationResult = typedValidator(formDataValue);
    return [key, validationResult];
  });

  // TODO: remove lodash dependency
  const validationResults: Dictionary<unknown> = _.fromPairs(
    validationResultPairs,
  );

  // HACK we cast back to ValidationResult<T> here because TypeScript & lodash lose all our type information.
  // See e.g. https://github.com/Microsoft/TypeScript/issues/7698
  return validationResults as ValidationResult<A>;
};

export const trueForAll = (
  validator: FormValidator<string>,
  // tslint:disable-next-line: readonly-array
): FormValidator<string[]> => {
  // tslint:disable-next-line: readonly-array
  return (maybeArray: string[] | undefined | null) => {
    const values =
      maybeArray === undefined || maybeArray === null ? [] : maybeArray;
    const validationResults = values.map(validator);
    return validationResults.find(result => result !== undefined);
  };
};

export const trueForAny = (
  validator: FormValidator<string>,
  // tslint:disable-next-line: readonly-array
): FormValidator<string[]> => {
  // tslint:disable-next-line: readonly-array
  return (maybeArray: string[] | undefined | null) => {
    const values =
      maybeArray === undefined || maybeArray === null ? [] : maybeArray;
    const validationResults = values.map(validator);
    return validationResults.some(result => result === undefined)
      ? undefined
      : validationResults.find(result => result !== undefined);
  };
};

/**
 * True if the provided value is null, undefined, the empty string or a string containing only whitespace; false otherwise.
 * @param value the value to test
 */
export const isMissing = (value: unknown) =>
  value === null ||
  value === undefined ||
  (typeof value === "string" && value.trim() === "");

export const required: (
  message: string,
) => FormValidator<string> = message => value =>
  isMissing(value) ? message : undefined;

export const validatorFromType = <A>(
  type: Type<unknown, A>,
  errorMessage: string,
): FormValidator<A> => (value: A | undefined) =>
  value === undefined || isMissing(value)
    ? undefined
    : fold(() => errorMessage, () => undefined)(type.decode(value));

export const validatorFromParser = (
  parser: Parser<unknown>,
): ((message: string) => FormValidator<string | undefined>) => message => s =>
  s === undefined || isMissing(s)
    ? undefined
    : parser(s) === undefined
    ? message
    : undefined;

export const composeValidators = <T>(
  first: FormValidator<T>,
  // tslint:disable-next-line: readonly-array
  ...rest: Array<FormValidator<T>>
): FormValidator<T> => {
  const head = _.head(rest);
  return head === undefined
    ? first
    : v => first(v) || composeValidators(head, ..._.tail(rest))(v);
};
