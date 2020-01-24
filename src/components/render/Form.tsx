import React from "react";
import { FormRenderProps as ReactFinalFormRenderProps } from "react-final-form";
import { OmitStrict } from "type-zoo";

/**
 * Replace any with string for improved type-safety.
 * io-ts error messages are strings, so we can get away
 * with this here.
 */
export type FormRenderProps<FormValues> = OmitStrict<
  ReactFinalFormRenderProps<FormValues>,
  "error" | "submitError"
> & {
  readonly error?: string;
  readonly submitError?: string;
};

/**
 * Renders global errors (i.e. those that aren't associated with a specific form field) at the top of a form.
 * @see https://final-form.org/docs/final-form/api#form_error
 */
export const FormError = <FormValues,>(
  renderProps: FormRenderProps<FormValues>,
): JSX.Element => {
  return renderProps.error !== undefined ||
    renderProps.submitError !== undefined ? (
    // TODO: remove bootstrap-specific class names
    // See https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_alert_role
    <div className="alert alert-danger" role="alert">
      {renderProps.error}
      {renderProps.submitError}
    </div>
  ) : (
    <></>
  );
};
