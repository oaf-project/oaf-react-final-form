import React, { HTMLAttributes, LabelHTMLAttributes } from "react";
import { OmitStrict } from "type-zoo";
import {
  ExtractFormValue,
  FieldMetaState,
  FormData,
  InputType,
} from "../common";

export type LabelProps =
  // eslint-disable-next-line @typescript-eslint/ban-types
  Omit<LabelHTMLAttributes<HTMLLabelElement>, "htmlFor">;

export type RenderLabelProps = {
  readonly labelProps?: LabelProps;
  readonly inputId: string;
  readonly label: string | JSX.Element;
  readonly inputType?: InputType | string;
};

export type FeedbackProps = Readonly<
  OmitStrict<HTMLAttributes<HTMLDivElement>, "id">
>;

export type RenderInvalidFeedbackProps = {
  readonly feedbackProps?: FeedbackProps;
  readonly error: string | undefined;
  readonly id: string;
};

export type FormElementChildProps = {
  readonly labelProps?: LabelProps;
  readonly feedbackProps?: FeedbackProps;
};

type FormElementProps<
  FD extends FormData,
  Name extends keyof FD,
> = FieldMetaState<ExtractFormValue<FD[Name]>> &
  FormElementChildProps & {
    readonly inputId: string;
    readonly label: string | JSX.Element;
    readonly renderLabel: (props: RenderLabelProps) => JSX.Element;
    readonly renderInvalidFeedback: (
      props: RenderInvalidFeedbackProps,
    ) => JSX.Element;
    readonly inputType?: InputType | string;
    readonly inputClassName: string | undefined;
    readonly invalidClassName: string | undefined;
    readonly validClassName: string | undefined;
    readonly children: (props: {
      readonly className?: string;
      readonly invalidFeedbackId?: string;
    }) => React.ReactNode;
    readonly isInvalid: boolean;
    readonly isValid: boolean;
  };

export const Label = (props: RenderLabelProps): JSX.Element => (
  <label
    className={
      // TODO: remove bootstrap-specific class name
      props.inputType === "checkbox" || props.inputType === "radio"
        ? "form-check-label"
        : undefined
    }
    {...props.labelProps}
    htmlFor={props.inputId}
  >
    {props.label}
  </label>
);

export const InvalidFeedback = (
  props: RenderInvalidFeedbackProps,
): JSX.Element => (
  // TODO: remove bootstrap-specific class name
  <div className="invalid-feedback" {...props.feedbackProps} id={props.id}>
    {/* TODO i18n */}
    {props.error ?? "This field is invalid."}
  </div>
);

/**
 * Renders a form element, including its label and invalid feedback message.
 */
export const FormElement = <FD extends FormData, Name extends keyof FD>(
  props: FormElementProps<FD, Name>,
): JSX.Element => {
  const isCheckboxOrRadio =
    props.inputType === "checkbox" || props.inputType === "radio";

  const invalidFeedbackId = props.isInvalid
    ? `${props.inputId}-feedback`
    : undefined;

  // TODO: remove bootstrap-specific class names
  const className = [
    props.inputClassName ??
      (isCheckboxOrRadio ? "form-check-input" : "form-control"),
  ]
    .concat(props.isInvalid ? [props.invalidClassName ?? "is-invalid"] : [])
    .concat(props.isValid ? [props.validClassName ?? "is-valid"] : [])
    .join(" ");

  const label = props.renderLabel({
    labelProps: props.labelProps,
    inputId: props.inputId,
    label: props.label,
    inputType: props.inputType,
  });

  const invalidFeedback =
    invalidFeedbackId !== undefined
      ? props.renderInvalidFeedback({
          feedbackProps: props.feedbackProps,
          id: invalidFeedbackId,
          error: props.meta.error ?? props.meta.submitError,
        })
      : null;

  return (
    <>
      {isCheckboxOrRadio ? null : label}
      {props.children({ className, invalidFeedbackId })}
      {isCheckboxOrRadio ? label : null}
      {/* TODO support the case where we only want to render a single invalidFeedback for an entire radio/checkbox group */}
      {props.isInvalid ? invalidFeedback : null}
    </>
  );
};
