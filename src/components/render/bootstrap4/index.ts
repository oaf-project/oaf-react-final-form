import { RenderClassNameProps } from "../FormElement";

export * from "./FormError";
export * from "./InvalidFeedback";
export * from "./Label";

/**
 * Determines the CSS class name to apply to the input or select, per bootstrap 4 markup conventions.
 */
export const className = (props: RenderClassNameProps): string => {
  const isCheckboxOrRadio =
    props.inputType === "checkbox" || props.inputType === "radio";

  return [
    props.inputClassName ??
      (isCheckboxOrRadio ? "form-check-input" : "form-control"),
  ]
    .concat(
      props.isInvalid === true ? [props.invalidClassName ?? "is-invalid"] : [],
    )
    .concat(props.isValid === true ? [props.validClassName ?? "is-valid"] : [])
    .join(" ");
};
