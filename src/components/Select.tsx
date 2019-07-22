import React, { ReactNode, SelectHTMLAttributes } from "react";
import { Field, FieldRenderProps } from "react-final-form";
import { SafeMeta } from ".";
import { FieldValue, FormData } from "../validation";

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  // A non-optional label that we render in a <label> element to ensure accessibility.
  readonly label: string;
};

type SelectRenderProps<FV extends FieldValue> = Omit<
  FieldRenderProps<FV, HTMLSelectElement>,
  "meta"
> &
  SafeMeta<FV> &
  SelectFieldProps;

const RenderComponent = <FV extends FieldValue, _>(
  props: SelectRenderProps<FV>,
) => {
  const feedbackId = `${props.id}-feedback`;
  const isInvalid = props.meta.touched && props.meta.invalid;
  const isValid = props.meta.touched && props.meta.valid;

  return (
    <div className="form-group">
      <label htmlFor={props.id}>{props.label}</label>
      <select
        value={props.input.value}
        onBlur={props.input.onBlur}
        onChange={props.input.onChange}
        id={props.id}
        className={
          "form-control" +
          (isInvalid ? " is-invalid" : "") +
          (isValid ? " is-valid" : "")
        }
        placeholder={props.placeholder}
        aria-invalid={isInvalid}
        required={props.required}
        aria-required={props.required}
        aria-labelledby={isInvalid ? feedbackId : undefined}
        multiple={props.multiple}
      >
        {/* TODO: type safe children? */}
        {props.children}
      </select>
      {isInvalid && (
        <div id={feedbackId} className="invalid-feedback">
          {/* TODO i18n */}
          {props.meta.error || "This field is invalid."}
        </div>
      )}
    </div>
  );
};

export interface SelectProps<A extends FormData> {
  readonly id: keyof A & string;
  readonly label: string;
  readonly required?: boolean;
  readonly placeholder?: string;
  readonly initialValues: Partial<A>;
  readonly children?: ReactNode; // TODO strongly typed options and selected value(s)
}

export const Select = <A extends FormData>(props: SelectProps<A>) => {
  const { initialValues, label, ...rest } = props;
  const value = initialValues[props.id];
  const multiple = Array.isArray(value);

  const render = (renderProps: FieldRenderProps<typeof value, HTMLElement>) =>
    RenderComponent({
      ...renderProps,
      label,
      multiple,
    });

  return <Field {...rest} name={props.id} value={value} render={render} />;
};
