import React, { InputHTMLAttributes } from "react";
import { FieldRenderProps } from "react-final-form";
import { OmitStrict, Overwrite } from "type-zoo";
import {
  ExtractFormValue,
  FieldMetaState,
  FormData,
  InputType,
} from "../common";
import {
  FormElement,
  RenderLabelProps,
  RenderInvalidFeedbackProps,
} from "./FormElement";

export type ExtraInputProps = {
  /**
   * A non-optional label that we render in a <label> element to ensure accessibility.
   */
  readonly label: string | JSX.Element;
};

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
  > & {
    readonly type?: InputType;
  }
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
  readonly isInvalid: boolean;
  readonly isValid: boolean;
};

export type InputRenderComponentConfig = {
  readonly renderLabel: (props: RenderLabelProps) => JSX.Element;
  readonly renderInvalidFeedback: (
    props: RenderInvalidFeedbackProps,
  ) => JSX.Element;
};

export const InputRenderComponent = <
  FD extends FormData,
  Name extends keyof FD & string
>(
  config: InputRenderComponentConfig,
) => (props: InputRenderProps<FD, Name>): JSX.Element => (
  <FormElement
    inputId={props.id}
    inputType={props.renderProps.input.type}
    label={props.label}
    renderLabel={config.renderLabel}
    renderInvalidFeedback={config.renderInvalidFeedback}
    inputClassName={props.inputProps.className}
    // TODO plumb these through config, then move inputProps to the same place, then update inputClassName
    invalidClassName={undefined}
    validClassName={undefined}
    labelProps={undefined}
    feedbackProps={undefined}
    meta={props.renderProps.meta}
    isInvalid={props.isInvalid}
    isValid={props.isValid}
  >
    {({ className, describedby }): JSX.Element => (
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
        // 'To stop form controls from announcing as invalid by default, one can add aria-invalid="false" to any necessary element.'
        // See https://developer.paciellogroup.com/blog/2019/02/required-attribute-requirements/
        aria-invalid={props.isInvalid}
        className={className}
        aria-describedby={describedby}
      />
    )}
  </FormElement>
);
