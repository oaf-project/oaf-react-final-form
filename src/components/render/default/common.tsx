import { HTMLAttributes, LabelHTMLAttributes } from "react";
import { OmitStrict } from "type-zoo";
import { InputType } from "../../common";

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

export type LabelProps = OmitStrict<
  LabelHTMLAttributes<HTMLLabelElement>,
  "htmlFor"
>;

export type RenderLabelProps = {
  readonly labelProps?: LabelProps;
  readonly inputId: string;
  readonly label: string | JSX.Element;
  readonly inputType?: InputType | string;
};

/**
 * Props to pass on to the actual element that contains the invalid feedback when a form element fails validation.
 *
 * Excludes `id` because that is used to ensure aria-labelledby is hooked up appropriately.
 * */
export type FeedbackProps = Readonly<
  OmitStrict<HTMLAttributes<HTMLDivElement>, "id">
>;

export type RenderInvalidFeedbackProps = {
  /** Props to pass on to the actual element that contains the invalid feedback when a form element fails validation. */
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
  /** Props to pass on to the actual element that contains the invalid feedback when a form element fails validation. */
  readonly feedbackProps?: FeedbackProps;
};

export type FormElementChildrenProps = {
  readonly invalidFeedbackId?: string;
};
