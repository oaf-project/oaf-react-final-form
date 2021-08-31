import React, { InputHTMLAttributes } from "react";
import { FieldRenderProps } from "react-final-form";
import { OmitStrict } from "type-zoo";
import { ExtractFormValue, FormData, InputType } from "../../common";
import { FormElementRenderConfig } from "./common";

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
  Name extends keyof FD & string,
> = ExtraInputProps & {
  // TODO go back to common FieldMetaState with safe error and submitError props once type coverage is sorted
  readonly renderProps: FieldRenderProps<
    ExtractFormValue<FD[Name]>,
    HTMLInputElement
  >;
  readonly inputProps: HTMLInputProps;
  readonly id: string;
  readonly isInvalid: boolean;
  readonly isValid: boolean;
};

// TODO: factor out duplication between Select and Input
export const Input =
  <FD extends FormData, Name extends keyof FD & string>(
    config: FormElementRenderConfig,
  ) =>
  // eslint-disable-next-line react/display-name
  (props: InputRenderProps<FD, Name>): JSX.Element => {
    const inputType = props.renderProps.input.type;
    const isCheckboxOrRadio = inputType === "checkbox" || inputType === "radio";

    // TODO: make the derivation of feedback ID configurable
    const invalidFeedbackId = props.isInvalid
      ? `${props.id}-feedback`
      : undefined;

    const label = config.renderLabel({
      labelProps: undefined, // TODO: either plumb this through or remove it
      inputId: props.id,
      label: props.label,
      inputType: inputType,
    });

    const invalidFeedback =
      invalidFeedbackId !== undefined
        ? config.renderInvalidFeedback({
            feedbackProps: undefined, // TODO: either plumb this through or remove it
            id: invalidFeedbackId,
            // TODO fix this `any`
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            error:
              props.renderProps.meta.error ??
              props.renderProps.meta.submitError,
          })
        : null;

    return (
      <>
        {isCheckboxOrRadio ? null : label}
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
          // See https://www.tpgi.com/required-attribute-requirements/
          aria-invalid={props.isInvalid}
          className={config.className({
            inputClassName: props.inputProps.className,
            invalidClassName: undefined, // TODO: either plumb this through or remove it
            validClassName: undefined, // TODO: either plumb this through or remove it
            inputType: props.inputProps.type,
            isValid: props.isValid,
            isInvalid: props.isInvalid,
          })}
          // See https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA1#example-2-using-aria-describedby-to-associate-instructions-with-form-fields
          aria-describedby={invalidFeedbackId}
        />
        {isCheckboxOrRadio ? label : null}
        {/* TODO support the case where we only want to render a single invalidFeedback for an entire radio/checkbox group */}
        {props.isInvalid ? invalidFeedback : null}
      </>
    );
  };
