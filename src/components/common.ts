import { FORM_ERROR } from "final-form";
import { FieldMetaState } from "react-final-form";
import { ExcludeStrict, Overwrite } from "type-zoo";

export type NumericInputType = "number" | "range";

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Form_%3Cinput%3E_types
export type InputType =
  | NumericInputType
  | "color"
  | "date"
  | "datetime-local"
  | "email"
  | "month"
  | "password"
  | "search"
  | "tel"
  | "text"
  | "time"
  | "url"
  | "week";

// tslint:disable: readonly-array

type FormDataValues<A, B> =
  | undefined
  | A
  | A[]
  | ReadonlyArray<A>
  | B
  | B[]
  | ReadonlyArray<B>;

/**
 * A form value that can survive the DOM round trip.
 * These constitute the leaves in a FormData type.
 *
 * This type _could_ perhaps be expanded thanks to `HTMLInputElement`'s
 * `valueAsNumber` (and even `valueAsDate` maybe), but these aren't easy
 * to get at via final-form so we omit the corresponding types here.
 */
export type FormValue = string;

export type FormData<I extends string = string, J extends string = string> = {
  readonly [key in I]: FormDataValues<FormValue, FormData<J>>;
};

/**
 * All JavaScript types except arrays and objects (and void).
 * These constitute the leaves in a ParsedFormData type.
 */
export type ParsedFormValue =
  | string
  | number
  | boolean
  | symbol
  | null
  | undefined;

export type ParsedFormData<
  I extends string = string,
  J extends string = string
> = {
  readonly [key in I]: FormDataValues<ParsedFormValue, FormData<J>>;
};

export type ExtractFormValue<A> = Extract<
  NonNullable<A> extends ReadonlyArray<infer X>
    ? X
    : NonNullable<A> extends Array<infer Y>
    ? Y
    : A,
  FormValue
>;

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
export type ValidationErrors<FD extends ParsedFormData> = {
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

// TODO expand this to enforce other constraints: max, min, maxlength, etc
export type InputTypeConstraint<Value> = Value extends number // TODO: non-optional type?
  ? { readonly type?: NumericInputType }
  : { readonly type?: ExcludeStrict<InputType, NumericInputType> };
