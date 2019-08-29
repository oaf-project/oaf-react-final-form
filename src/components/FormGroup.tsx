import React from "react";
import { FieldRenderProps } from "react-final-form";
import { Overwrite } from "type-zoo";
import { FormData, FormValueType, SafeMeta } from "./common";

type FormGroupProps<
  A extends FormData,
  Name extends keyof A & string,
  Elem extends HTMLElement
> = Overwrite<
  FieldRenderProps<FormValueType<A[Name]>, Elem>,
  SafeMeta<FormValueType<A[Name]>>
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
  A extends FormData,
  Name extends keyof A & string,
  Elem extends HTMLElement
> = FormGroupProps<A, Name, Elem> & {
  readonly children: (
    props: FormGroupProps<A, Name, Elem> & ChildrenProps,
  ) => React.ReactNode;
};

export const FormGroup = <
  A extends FormData,
  Name extends keyof A & string,
  Elem extends HTMLElement
>(
  props: FormGroupChildrenProps<A, Name, Elem>,
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
