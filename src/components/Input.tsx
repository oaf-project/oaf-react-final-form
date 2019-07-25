import React, { InputHTMLAttributes } from "react";
import { Field, FieldRenderProps } from "react-final-form";
import { SafeMeta } from ".";
import { FieldValue } from ".";

type InputType = "text" | "url" | "number" | "search";

type ExtraProps = {
  /**
   * A non-optional label that we render in a <label> element to ensure accessibility.
   */
  readonly label: string;
  readonly type?: InputType;
};

/**
 * Input props that come directly from InputHTMLAttributes.
 */
type HTMLInputProps = Readonly<
  Pick<
    InputHTMLAttributes<HTMLInputElement>,
    // tslint:disable-next-line: max-union-size
    "id" | "required" | "placeholder" | "min" | "max" | "step" | "name"
  >
>;

export type InputProps<
  A extends { readonly [key: string]: unknown }
> = HTMLInputProps &
  ExtraProps & {
    readonly name: keyof A & string;
  };

type RenderProps<FV extends FieldValue> = Omit<
  FieldRenderProps<FV, HTMLInputElement>,
  "meta"
> &
  SafeMeta<FV> &
  HTMLInputProps &
  ExtraProps;

const RenderComponent = <FV extends FieldValue>(props: RenderProps<FV>) => {
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
          {props.meta.error || "This field is invalid."}
        </div>
      )}
    </div>
  );
};

export const Input = <A extends { readonly [key: string]: unknown }>(
  props: InputProps<A>,
) => {
  const render = (renderProps: FieldRenderProps<FieldValue, HTMLElement>) =>
    RenderComponent({ ...renderProps, ...props });

  return <Field {...props} render={render} />;
};
