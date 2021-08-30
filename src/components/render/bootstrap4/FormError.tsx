import React from "react";
import { FormRenderProps } from "../..";

/**
 * Renders global errors (i.e. those that aren't associated with a specific form field) at the top of a form.
 * @see https://final-form.org/docs/final-form/api#form_error
 */
export const FormError = <FormValues,>(
  renderProps: FormRenderProps<FormValues>,
): JSX.Element => {
  // TODO: simplify this component so the logic below is not duplicated across every form error render component (bootstrap4, default, etc)
  return renderProps.error !== undefined ||
    renderProps.submitError !== undefined ? (
    // See https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_alert_role
    <div className="alert alert-danger" role="alert">
      {renderProps.error}
      {renderProps.submitError}
    </div>
  ) : (
    <></>
  );
};
