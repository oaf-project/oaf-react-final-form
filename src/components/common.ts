import { FORM_ERROR } from "final-form";
import { FieldMetaState } from "react-final-form";
import { Overwrite } from "type-zoo";

// tslint:disable: readonly-array
export type FormData<I extends string = string, J extends string = string> = {
  readonly [index in I]:  // tslint:disable-next-line: max-union-size
    | undefined
    | FormValue
    | FormValue[]
    | ReadonlyArray<FormValue>
    | FormData<J>
    | Array<FormData<J>>
    | ReadonlyArray<FormData<J>>;
};

// TODO: should we include undefined here?
export type FormValue = string;

export type FormValueType<A> = Exclude<A, undefined> extends ReadonlyArray<
  infer X
>
  ? Extract<X, FormValue>
  : Exclude<A, undefined> extends Array<infer Y>
  ? Extract<Y, FormValue>
  : Extract<A, FormValue>;

// TODO: push MapToErrorType and ValidationErrors upstream to final-form
// TODO: include ARRAY_ERROR in the below

type MapToErrorType<A> = {
  readonly object: {
    readonly [key in keyof A]?: undefined | MapToErrorType<A[key]>;
  };
  readonly array: ReadonlyArray<
    undefined | MapToErrorType<A extends Array<infer X> ? X : never>
  >;
  readonly string: string;
}[A extends object
  ? "object"
  : A extends unknown[]
  ? "array"
  : A extends ReadonlyArray<unknown>
  ? "array"
  : "string"];
// tslint:enable: readonly-array

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
export type ValidationErrors<FD extends FormData> = {
  readonly [FORM_ERROR]?: string;
} & MapToErrorType<FD>;

/**
 * Replace any with string for improved type-safety.
 * io-ts error messages are strings, so we can get away
 * with this here.
 */
export type FieldMetaState<FV> = {
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
