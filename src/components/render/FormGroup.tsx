import React, { HTMLAttributes, LabelHTMLAttributes } from "react";
import { OmitStrict } from "type-zoo";
import {
  ExtractFormValue,
  FieldMetaState,
  FormData,
  InputType,
} from "../common";

export type FormGroupChildProps = {
  readonly formGroupProps?: Readonly<HTMLAttributes<HTMLDivElement>>;
  readonly labelProps?: Readonly<
    OmitStrict<LabelHTMLAttributes<HTMLLabelElement>, "htmlFor">
  >;
  readonly feedbackProps?: Readonly<
    OmitStrict<HTMLAttributes<HTMLDivElement>, "id">
  >;
};

type FormGroupProps<
  FD extends FormData,
  Name extends keyof FD
> = FieldMetaState<ExtractFormValue<FD[Name]>> &
  FormGroupChildProps & {
    readonly inputId: string;
    readonly label: string | JSX.Element;
    readonly inputType?: InputType | string;
    readonly inputDisabled?: boolean;
    readonly inputClassName: string | undefined;
    readonly invalidClassName: string | undefined;
    readonly validClassName: string | undefined;
    readonly children: (props: {
      readonly isInvalid: boolean;
      readonly className?: string;
      readonly describedby?: string;
    }) => React.ReactNode;
  };

export const FormGroup = <FD extends FormData, Name extends keyof FD>(
  props: FormGroupProps<FD, Name>,
  // eslint-disable-next-line sonarjs/cognitive-complexity
): JSX.Element => {
  const isCheckboxOrRadio =
    props.inputType === "checkbox" || props.inputType === "radio";

  const feedbackId = `${props.inputId}-feedback`;
  // 'To stop form controls from announcing as invalid by default, one can add aria-invalid="false" to any necessary element.'
  // See https://developer.paciellogroup.com/blog/2019/02/required-attribute-requirements/
  const isInvalid: boolean =
    (props.meta.touched && props.meta.invalid) || false;
  const isValid = (props.meta.touched && props.meta.valid) || false;

  const className = [
    props.inputClassName ||
      (isCheckboxOrRadio ? "form-check-input" : "form-control"),
  ]
    .concat(isInvalid ? [props.invalidClassName || "is-invalid"] : [])
    .concat(isValid ? [props.validClassName || "is-valid"] : [])
    .join(" ");

  const describedby = isInvalid ? feedbackId : undefined;

  const label = (
    <label
      className={isCheckboxOrRadio ? "form-check-label" : undefined}
      {...props.labelProps}
      htmlFor={props.inputId}
    >
      {props.label}
    </label>
  );

  const contents = (
    <>
      {isCheckboxOrRadio ? null : label}
      {props.children({ isInvalid, className, describedby })}
      {isCheckboxOrRadio ? label : null}

      {isInvalid ? (
        <div
          className="invalid-feedback"
          {...props.feedbackProps}
          id={feedbackId}
        >
          {/* TODO i18n */}
          {props.meta.error ||
            props.meta.submitError ||
            "This field is invalid."}
        </div>
      ) : null}
    </>
  );

  return (
    <div className="form-group" {...props.formGroupProps}>
      {isCheckboxOrRadio ? (
        <div
          className={props.inputDisabled ? "form-check disabled" : "form-check"}
        >
          {contents}
        </div>
      ) : (
        <>{contents}</>
      )}
    </div>
  );
};
