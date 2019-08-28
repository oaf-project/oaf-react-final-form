import React, { InputHTMLAttributes } from "react";
import { FieldRenderProps } from "react-final-form";
import { Overwrite } from "type-zoo";
import { FormData, FormValueType, SafeMeta } from "./common";

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Form_%3Cinput%3E_types
type InputType =
  | "color"
  | "date"
  | "datetime-local"
  | "email"
  | "month"
  // TODO: only allow number if codec type extends number?
  | "number"
  | "password"
  | "range"
  | "search"
  | "tel"
  // TODO: only allow text, search, etc if codec type extends string?
  | "text"
  | "time"
  | "url"
  | "week";

export type ExtraProps = {
  /**
   * A non-optional label that we render in a <label> element to ensure accessibility.
   */
  readonly label: string | JSX.Element;
  readonly type?: InputType;
} & HTMLInputProps;

/**
 * Input props that come directly from InputHTMLAttributes.
 */
export type HTMLInputProps = Readonly<
  Pick<
    InputHTMLAttributes<HTMLInputElement>,
    // tslint:disable-next-line: max-union-size
    | "id"
    | "required"
    | "placeholder"
    | "min"
    | "minLength"
    | "max"
    | "maxLength"
    | "step"
  >
>;

export type InputRenderProps<
  A extends FormData,
  Name extends keyof A & string
> = Overwrite<
  FieldRenderProps<FormValueType<A[Name]>, HTMLInputElement>,
  SafeMeta<FormValueType<A[Name]>>
> &
  ExtraProps;

export const InputRenderComponent = <
  A extends FormData,
  Name extends keyof A & string
>(
  props: InputRenderProps<A, Name>,
) => {
  const feedbackId = `${props.id}-feedback`;
  // 'To stop form controls from announcing as invalid by default, one can add aria-invalid="false" to any necessary element.'
  // See https://developer.paciellogroup.com/blog/2019/02/required-attribute-requirements/
  const isInvalid: boolean =
    (props.meta.touched && props.meta.invalid) || false;
  const isValid = props.meta.touched && props.meta.valid;

  // We have to discard ReadonlyArray<string> from this type to be able to assign it to the input's value.
  // tslint:disable-next-line: readonly-array
  // const value = (props.input.value as unknown) as string | string[] | number;

  return (
    // TODO extract common FormGroup component and share with Select.tsx
    <div className="form-group">
      <label htmlFor={props.id}>{props.label}</label>
      <input
        value={props.input.value}
        onBlur={props.input.onBlur}
        onChange={props.input.onChange}
        id={props.id}
        name={props.input.name}
        className={
          "form-control" +
          (isInvalid ? " is-invalid" : "") +
          (isValid ? " is-valid" : "")
        }
        placeholder={props.placeholder}
        min={props.min}
        minLength={props.minLength}
        max={props.max}
        maxLength={props.maxLength}
        step={props.step}
        type={props.input.type}
        aria-invalid={isInvalid}
        required={props.required}
        aria-required={props.required}
        aria-describedby={isInvalid ? feedbackId : undefined}
      />
      {isInvalid && (
        <div id={feedbackId} className="invalid-feedback">
          {/* TODO i18n */}
          {props.meta.error ||
            props.meta.submitError ||
            "This field is invalid."}
        </div>
      )}
    </div>
  );
};
