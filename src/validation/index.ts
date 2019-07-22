import { ValidationErrors } from "final-form";
import { fold } from "fp-ts/lib/Either";
import { Errors, Type } from "io-ts/lib";

// tslint:disable-next-line: readonly-array
export type FieldValue = undefined | string | string[];

export type FormData = {
  readonly [index in string]: FieldValue;
};

/**
 * The result of running a form validator against a value. A string containing an error message
 * if the validator failed, otherwise undefined.
 */
type FormValidatorResult = string | undefined;

export type FormValidator<A> = (value: A | undefined) => FormValidatorResult;

export type ValidatorObject<A> = {
  readonly [k in keyof Partial<A>]: FormValidator<A[k]>;
};

export type ValidationResult<A extends FormData> = { [P in keyof A]?: string };

export const runValidators = <A extends FormData>(
  validators: ValidatorObject<A>,
  formData: A,
): ValidationResult<A> => {
  const validatorPairs = Object.entries(validators);

  const validationResultPairs = validatorPairs.map(pair => {
    const [key, validator] = pair;
    // TODO: get rid of this cast.
    const typedValidator = validator as FormValidator<FieldValue>;
    const formDataValue = formData[key];
    const validationResult = typedValidator(formDataValue);
    return { key, validationResult };
  });

  return validationResultPairs.reduce(
    (accumulator, value) => {
      const { key, validationResult } = value;
      // TODO: get rid of this cast.
      // tslint:disable-next-line: no-object-mutation no-expression-statement
      accumulator[key as keyof A] = validationResult;
      return accumulator;
    },
    {} as ValidationResult<A>,
  );
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

export const required: <A>(
  message: string,
) => FormValidator<A> = message => value =>
  isMissing(value) ? message : undefined;

export const validatorFromType = <A, O = A, I = unknown>(
  type: Type<A, O, I>,
  errorMessage: string,
): FormValidator<I | undefined> => (value: I | undefined) =>
  value === undefined || isMissing(value)
    ? undefined
    : fold(() => errorMessage, () => undefined)(type.decode(value));

export const composeValidators = <T>(
  first: FormValidator<T>,
  // tslint:disable-next-line: readonly-array
  ...rest: Array<FormValidator<T>>
): FormValidator<T> => {
  const [head, ...tail] = rest;
  return head === undefined
    ? first
    : v => first(v) || composeValidators(head, ...tail)(v);
};

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
