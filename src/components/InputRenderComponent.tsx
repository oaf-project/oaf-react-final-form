import React, { InputHTMLAttributes } from "react";
import { FieldRenderProps } from "react-final-form";
import { OmitStrict, Overwrite } from "type-zoo";
import {
  ExtractFormValue,
  FieldMetaState,
  FormData,
  InputType,
} from "./common";
import { FormGroup, FormGroupChildProps } from "./FormGroup";

export type ExtraInputProps = {
  /**
   * A non-optional label that we render in a <label> element to ensure accessibility.
   */
  readonly label: string | JSX.Element;
  readonly type?: InputType;
} & FormGroupChildProps;

/**
 * Input props that come directly from InputHTMLAttributes.
 */
export type HTMLInputProps = Readonly<
  OmitStrict<
    InputHTMLAttributes<HTMLInputElement>,
    | "id"
    | "value"
    | "onBlur"
    | "onChange"
    | "onFocus"
    | "defaultValue"
    | "name"
    | "aria-invalid"
    | "aria-describedby"
    | "type"
  >
>;

export type InputRenderProps<
  FD extends FormData,
  Name extends keyof FD & string
> = ExtraInputProps & {
  readonly renderProps: Overwrite<
    FieldRenderProps<ExtractFormValue<FD[Name]>, HTMLInputElement>,
    FieldMetaState<ExtractFormValue<FD[Name]>>
  >;
  readonly inputProps: HTMLInputProps;
  readonly id: string;
};

export const InputRenderComponent = <
  FD extends FormData,
  Name extends keyof FD & string
>(
  props: InputRenderProps<FD, Name>,
): JSX.Element => (
  <FormGroup
    inputId={props.id}
    inputType={props.renderProps.input.type}
    inputDisabled={props.inputProps.disabled}
    label={props.label}
    inputClassName={props.inputProps.className}
    // TODO plumb these through
    invalidClassName={undefined}
    validClassName={undefined}
    meta={props.renderProps.meta}
    formGroupProps={props.formGroupProps}
    labelProps={props.labelProps}
    feedbackProps={props.feedbackProps}
  >
    {({ isInvalid, className, describedby }) => (
      <input
        {...props.inputProps}
        id={props.id}
        value={props.renderProps.input.value}
        checked={props.renderProps.input.checked}
        onBlur={props.renderProps.input.onBlur}
        onChange={props.renderProps.input.onChange}
        onFocus={props.renderProps.input.onFocus}
        name={props.renderProps.input.name}
        type={props.renderProps.input.type}
        aria-invalid={isInvalid}
        className={className}
        aria-describedby={describedby}
      />
    )}
  </FormGroup>
);
