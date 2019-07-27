import { FieldMetaState } from "react-final-form";

// TODO: should this be a recursive type to allow nested fields?
// See https://github.com/final-form/final-form#field-names
// tslint:disable-next-line: readonly-array
export type FieldValue = undefined | string | string[];

export type RawFormData = {
  readonly [index in string]: FieldValue;
};

export type FormData = {
  readonly [index in string]: unknown;
};

/**
 * Replace any with unknown for improved type-safety.
 */
export type SafeMeta<FV> = {
  readonly meta: Omit<
    FieldMetaState<FV>,
    "error" | "submitError" | "initial"
  > & {
    readonly error?: unknown;
    readonly submitError?: unknown;
    // TODO https://github.com/final-form/final-form/pull/251
    readonly initial?: FV;
  };
};

export type Required<
  A extends RawFormData,
  Name extends keyof A & string
> = A[Name] extends Exclude<A[Name], undefined>
  ? { readonly required: true }
  : {};