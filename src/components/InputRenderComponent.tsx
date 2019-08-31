import React, { InputHTMLAttributes } from "react";
import { FieldRenderProps } from "react-final-form";
import { Overwrite } from "type-zoo";
import { FormData, FormValueType, SafeMeta } from "./common";
import { FormGroup } from "./FormGroup";

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

export type ExtraInputProps = {
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
  ExtraInputProps;

export const InputRenderComponent = <
  A extends FormData,
  Name extends keyof A & string
>(
  props: InputRenderProps<A, Name>,
) => {
  return (
    <FormGroup {...props}>
      {({ isInvalid, className, describedby }) => (
        <input
          value={
            (props.input.value as unknown) as Exclude<
              typeof props.input.value,
              ReadonlyArray<string>
            >
          }
          onBlur={props.input.onBlur}
          onChange={props.input.onChange}
          id={props.id}
          name={props.input.name}
          className={className}
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
          aria-describedby={describedby}
        />
      )}
    </FormGroup>
  );
};
