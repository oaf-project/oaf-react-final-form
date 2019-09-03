import React from "react";
import { FieldRenderProps } from "react-final-form";
import { Overwrite } from "type-zoo";
import { ExtractFormValue, FieldMetaState, FormData } from "./common";

type FormGroupProps<
  FD extends FormData,
  Name extends keyof FD,
  Elem extends HTMLElement
> = Overwrite<
  FieldRenderProps<ExtractFormValue<FD[Name]>, Elem>,
  FieldMetaState<ExtractFormValue<FD[Name]>>
> & {
  readonly id?: string; // TODO make this required
  readonly label: string | JSX.Element;
};

type ChildrenProps = {
  readonly isInvalid: boolean;
  readonly className: string;
  readonly describedby?: string;
};

type FormGroupChildrenProps<
  FD extends FormData,
  Name extends keyof FD,
  Elem extends HTMLElement
> = FormGroupProps<FD, Name, Elem> & {
  readonly children: (
    props: FormGroupProps<FD, Name, Elem> & ChildrenProps,
  ) => React.ReactNode;
};

export const FormGroup = <
  FD extends FormData,
  Name extends keyof FD,
  Elem extends HTMLElement
>(
  props: FormGroupChildrenProps<FD, Name, Elem>,
) => {
  const feedbackId = `${props.id}-feedback`;
  // 'To stop form controls from announcing as invalid by default, one can add aria-invalid="false" to any necessary element.'
  // See https://developer.paciellogroup.com/blog/2019/02/required-attribute-requirements/
  const isInvalid: boolean =
    (props.meta.touched && props.meta.invalid) || false;
  const isValid = (props.meta.touched && props.meta.valid) || false;

  const className = ["form-control"]
    .concat(isInvalid ? ["is-invalid"] : [])
    .concat(isValid ? ["is-valid"] : [])
    .join(" ");

  const describedby = isInvalid ? feedbackId : undefined;

  const { children, ...rest } = props;

  return (
    <div className="form-group">
      <label htmlFor={props.id}>{props.label}</label>
      {children({ ...rest, isInvalid, className, describedby })}
      {isInvalid && (
        <div id={feedbackId} className="invalid-feedback">
          {/* TODO i18n */}
          {props.meta.error ||
            props.meta.submitError ||
            "This field is invalid."}
        </div>
      )}
    </div>
  );
};
