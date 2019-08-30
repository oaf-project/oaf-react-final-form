import { AllHTMLAttributes } from "react";
import { FieldMetaState } from "react-final-form";
import { ExcludeStrict, Overwrite } from "type-zoo";

export type FormData<I extends string = string, J extends string = string> = {
  readonly [index in I]:  // tslint:disable-next-line: max-union-size
    | FormValue
    | undefined
    | FormData<J>
    // tslint:disable-next-line: readonly-array
    | Array<FormData<J>>
    | ReadonlyArray<FormData<J>>;
};

// TODO: should we exclude undefined here? and number?
// string | number | string[]
export type FormValue = ExcludeStrict<
  AllHTMLAttributes<HTMLSelectElement>["value"],
  undefined
>;

// string | number
// tslint:disable-next-line: readonly-array
export type FormValueOption = ExcludeStrict<FormValue, string[]>;

export type FormValueType<A> = Exclude<A, undefined> extends ReadonlyArray<
  infer X
>
  ? Extract<X, FormValueOption>
  : Extract<A, FormValueOption>;

/**
 * Replace any with string for improved type-safety.
 * io-ts error messages are strings, so we can get away
 * with this here.
 */
export type SafeMeta<FV> = {
  readonly meta: Overwrite<
    FieldMetaState<FV>,
    {
      readonly error?: string;
      readonly submitError?: string;
    }
  >;
};

export type Required<Value> = undefined extends Value
  ? { readonly required?: false }
  : { readonly required: true };

// tslint:disable-next-line: readonly-array no-any
export type Multiple<Value> = any[] extends Value
  ? { readonly multiple: true }
  : { readonly multiple?: false };
