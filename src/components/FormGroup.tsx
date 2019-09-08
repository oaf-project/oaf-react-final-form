import React, { HTMLAttributes, LabelHTMLAttributes } from "react";
import { OmitStrict } from "type-zoo";
import { ExtractFormValue, FieldMetaState, FormData } from "./common";

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
    readonly id: string;
    readonly label: string | JSX.Element;
    // tslint:disable-next-line: prefer-optional
    readonly inputClassName: string | undefined;
    readonly children: (props: {
      readonly isInvalid: boolean;
      readonly className?: string;
      readonly describedby?: string;
    }) => React.ReactNode;
  };

export const FormGroup = <FD extends FormData, Name extends keyof FD>(
  props: FormGroupProps<FD, Name>,
) => {
  const feedbackId = `${props.id}-feedback`;
  // 'To stop form controls from announcing as invalid by default, one can add aria-invalid="false" to any necessary element.'
  // See https://developer.paciellogroup.com/blog/2019/02/required-attribute-requirements/
  const isInvalid: boolean =
    (props.meta.touched && props.meta.invalid) || false;
  const isValid = (props.meta.touched && props.meta.valid) || false;

  const className = [props.inputClassName || "form-control"]
    .concat(isInvalid ? ["is-invalid"] : [])
    .concat(isValid ? ["is-valid"] : [])
    .join(" ");

  const describedby = isInvalid ? feedbackId : undefined;

  return (
    <div className="form-group" {...props.formGroupProps}>
      <label {...props.labelProps} htmlFor={props.id}>
        {props.label}
      </label>
      {props.children({ isInvalid, className, describedby })}
      {isInvalid && (
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
      )}
    </div>
  );
};
