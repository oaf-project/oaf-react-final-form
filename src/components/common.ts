import { FieldMetaState } from "react-final-form";
import { OmitStrict as Omit } from "type-zoo";

// TODO: tighten up unknown here
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
  };
};

export type Required<Value> = undefined extends Value
  ? { readonly required?: false }
  : { readonly required: true };

// tslint:disable-next-line: readonly-array no-any
export type Multiple<Value> = any[] extends Value
  ? { readonly multiple: true }
  : { readonly multiple?: false };
