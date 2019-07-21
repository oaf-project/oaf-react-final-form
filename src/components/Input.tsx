import React, { InputHTMLAttributes } from "react";
import { Field, FieldRenderProps } from "react-final-form";
import { FieldValue, FormData } from ".";

type InputType = "text" | "url" | "number" | "search";

export type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  /**
   * A non-optional label that we render in a <label> element to ensure accessibility.
   */
  readonly label: string;
  readonly type?: InputType;
};

export type InputRenderProps<FV extends FieldValue> = FieldRenderProps<
  FV,
  HTMLInputElement
> &
  InputFieldProps;

const RenderComponent = <FV extends FieldValue, _>(
  props: InputRenderProps<FV>,
) => {
  const feedbackId = `${props.id}-feedback`;
  const isInvalid = props.meta.touched && props.meta.invalid;
  const isValid = props.meta.touched && props.meta.valid;

  return (
    // TODO extract common FormGroup component and share with Select.tsx
    <div className="form-group">
      <label htmlFor={props.id}>{props.label}</label>
      <input
        value={props.input.value}
        onBlur={props.input.onBlur}
        onChange={props.input.onChange}
        id={props.id}
        name={props.name}
        className={
          "form-control" +
          (isInvalid ? " is-invalid" : "") +
          (isValid ? " is-valid" : "")
        }
        placeholder={props.placeholder}
        type={props.type}
        aria-invalid={isInvalid}
        required={props.required}
        aria-required={props.required}
        aria-describedby={isInvalid ? feedbackId : undefined}
      />
      {isInvalid && (
        <div id={feedbackId} className="invalid-feedback">
          {/* TODO i18n */}
          {/* TODO props.meta.error should have a better type */}
          {props.meta.error || "This field is invalid."}
        </div>
      )}
    </div>
  );
};

// tslint:disable-next-line: interface-name
export interface InputProps<A extends FormData> {
  readonly id: keyof A & string;
  readonly label: string;
  readonly required?: boolean;
  readonly type?: InputType;
  readonly placeholder?: string;
  readonly initialValues: Partial<A>;

  // TODO: min, max, step but only if type === "number"
}

export const Input = <A extends FormData>(props: InputProps<A>) => {
  const { initialValues, ...rest } = props;
  const value = initialValues[props.id];

  const render = (renderProps: FieldRenderProps<typeof value, HTMLElement>) =>
    RenderComponent({ ...renderProps, ...rest });

  return <Field {...rest} name={props.id} value={value} render={render} />;
};
