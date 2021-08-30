import React, { HTMLAttributes, LabelHTMLAttributes } from "react";
import { OmitStrict } from "type-zoo";
import {
  ExtractFormValue,
  FieldMetaState,
  FormData,
  InputType,
} from "../common";

/**
 * Specifies how form elements (inputs and selects) should be rendered.
 */
export type FormElementRenderConfig = {
  readonly renderLabel: (props: RenderLabelProps) => JSX.Element;
  readonly renderInvalidFeedback: (
    props: RenderInvalidFeedbackProps,
  ) => JSX.Element;
  /**
   * The CSS class name that will be assigned to the actual input and select elements.
   * Useful for assigning classes that are specific to input state (touched, validation, etc).
   */
  readonly className: (props: RenderClassNameProps) => string;
};

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

/**
 * The properties used to determine the CSS class name to use when
 * rendering an element (an input or a select).
 */
export type RenderClassNameProps = {
  readonly inputClassName?: string; // TODO remove this?
  readonly invalidClassName?: string; // TODO remove this?
  readonly validClassName?: string; // TODO remove this?
  readonly inputType?: InputType | string;
  readonly isValid?: boolean;
  readonly isInvalid?: boolean;
};

// TODO the names of the following two types are terrible. Do we even need the first of the two?
export type FormElementChildProps = {
  readonly labelProps?: LabelProps;
  readonly feedbackProps?: FeedbackProps;
};

export type FormElementChildrenProps = {
  readonly invalidFeedbackId?: string;
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
    readonly children: (props: FormElementChildrenProps) => React.ReactNode;
    readonly isInvalid: boolean;
    readonly isValid: boolean;
  };

// TODO: the whole relationship between FormElement and InputRenderComponent, SelectRenderComponent needs rethinking.

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
      {props.children({ ...props, invalidFeedbackId })}
      {isCheckboxOrRadio ? label : null}
      {/* TODO support the case where we only want to render a single invalidFeedback for an entire radio/checkbox group */}
      {props.isInvalid ? invalidFeedback : null}
    </>
  );
};
