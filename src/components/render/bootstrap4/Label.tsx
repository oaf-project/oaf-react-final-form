import React from "react";
import { RenderLabelProps } from "../default/common";

export const Label = (props: RenderLabelProps): JSX.Element => (
  <label
    className={
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
