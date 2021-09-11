import React from "react";
import { RenderLabelProps } from "../default/common";

/**
 * A Bootstrap 5 label.
 * @see https://getbootstrap.com/docs/5.0/forms/overview/
 */
export const Label = (props: RenderLabelProps): JSX.Element => (
  <label
    className={
      props.inputType === "checkbox" || props.inputType === "radio"
        ? "form-check-label"
        : "form-label"
    }
    {...props.labelProps}
    htmlFor={props.inputId}
  >
    {props.label}
  </label>
);
