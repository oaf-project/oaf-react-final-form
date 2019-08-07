import { FieldMetaState } from "react-final-form";

// TODO: should this be a recursive type to allow nested fields?
// See https://github.com/final-form/final-form#field-names
// tslint:disable-next-line: readonly-array
export type FieldValue = undefined | string | string[] | ReadonlyArray<string>;

export type RawFormData = {
  readonly [index in string]: FieldValue;
};

export type FormData = {
  readonly [index in string]: unknown;
};

/**
 * Replace any with string for improved type-safety.
 * io-ts error messages are strings, so we can get away
 * with this here.
 */
export type SafeMeta<FV> = {
  readonly meta: Omit<
    FieldMetaState<FV>,
    "error" | "submitError" | "initial"
  > & {
    readonly error?: string;
    readonly submitError?: string;
    // TODO https://github.com/final-form/final-form/pull/251
    readonly initial?: FV;
  };
};

export type Required<
  A extends RawFormData,
  Name extends keyof A & string
> = A[Name] extends Exclude<A[Name], undefined>
  ? { readonly required: true }
  : { readonly required?: false };

export type Multiple<
  A extends RawFormData,
  Name extends keyof A & string
  // tslint:disable-next-line: readonly-array no-any
> = any[] extends A[Name]
  ? { readonly multiple: true }
  : { readonly multiple?: false };
