import React from "react";
import { defaultFieldErrorMessage } from "../../common";
import { RenderInvalidFeedbackProps } from "../default/common";

export const InvalidFeedback = (
  props: RenderInvalidFeedbackProps,
): JSX.Element => (
  <div className="invalid-feedback" {...props.feedbackProps} id={props.id}>
    {props.error ?? defaultFieldErrorMessage}
  </div>
);
