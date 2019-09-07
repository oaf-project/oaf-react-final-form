import React, { InputHTMLAttributes } from "react";
import { FieldRenderProps } from "react-final-form";
import { OmitStrict, Overwrite } from "type-zoo";
import { ExtractFormValue, FieldMetaState, FormData } from "./common";
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
type HTMLInputProps = Readonly<
  OmitStrict<
    InputHTMLAttributes<HTMLInputElement>,
    // tslint:disable-next-line: max-union-size
    | "value"
    | "onBlur"
    | "onChange"
    | "defaultValue"
    | "name"
    | "aria-invalid"
    | "aria-describedby"
  >
>;

export type InputRenderProps<
  FD extends FormData,
  Name extends keyof FD & string
> = Overwrite<
  FieldRenderProps<ExtractFormValue<FD[Name]>, HTMLInputElement>,
  FieldMetaState<ExtractFormValue<FD[Name]>>
> &
  ExtraInputProps;

export const InputRenderComponent = <
  FD extends FormData,
  Name extends keyof FD & string
>(
  props: InputRenderProps<FD, Name>,
) => {
  // We don't want to render these into the dom so discard them.
  const { label, input, meta, ...inputProps } = props;

  return (
    <FormGroup {...props}>
      {({ isInvalid, className, describedby }) => (
        <input
          value={props.input.value}
          onBlur={props.input.onBlur}
          onChange={props.input.onChange}
          name={props.input.name}
          type={props.input.type}
          aria-invalid={isInvalid}
          className={className}
          aria-describedby={describedby}
          {...inputProps}
        />
      )}
    </FormGroup>
  );
};
