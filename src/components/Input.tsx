import { Type } from "io-ts";
import React, { InputHTMLAttributes } from "react";
import { Field, FieldRenderProps } from "react-final-form";
import { FormData, RawFormData, Required, SafeMeta } from "./common";

// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#Form_%3Cinput%3E_types
type InputType =
  | "color"
  | "date"
  | "datetime-local"
  | "email"
  | "month"
  | "number"
  | "password"
  | "range"
  | "search"
  | "tel"
  | "text"
  | "time"
  | "url"
  | "week";

type ExtraProps<A extends RawFormData, Name extends keyof A & string> = {
  /**
   * A non-optional label that we render in a <label> element to ensure accessibility.
   */
  readonly label: string;
  readonly type?: InputType;
  readonly name: Name;
  readonly required?: boolean;
};

/**
 * Input props that come directly from InputHTMLAttributes.
 */
type HTMLInputProps = Readonly<
  Pick<
    InputHTMLAttributes<HTMLInputElement>,
    // tslint:disable-next-line: max-union-size
    "id" | "placeholder" | "min" | "minLength" | "max" | "maxLength" | "step"
  >
>;

export type InputProps<
  A extends RawFormData,
  Name extends keyof A & string
> = HTMLInputProps & ExtraProps<A, Name>;

type RenderProps<A extends RawFormData, Name extends keyof A & string> = Omit<
  FieldRenderProps<A[Name], HTMLInputElement>,
  "meta"
> &
  SafeMeta<A[Name]> &
  InputProps<A, Name>;

const RenderComponent = <A extends RawFormData, Name extends keyof A & string>(
  props: RenderProps<A, Name>,
) => {
  const feedbackId = `${props.id}-feedback`;
  // 'To stop form controls from announcing as invalid by default, one can add aria-invalid="false" to any necessary element.'
  // See https://developer.paciellogroup.com/blog/2019/02/required-attribute-requirements/
  const isInvalid: boolean =
    (props.meta.touched && props.meta.invalid) || false;
  const isValid = props.meta.touched && props.meta.valid;

  // We have to discard ReadonlyArray<string> from this type to be able to assign it to the input's value.
  // tslint:disable-next-line: readonly-array
  const value = props.input.value as string | string[] | number;

  return (
    // TODO extract common FormGroup component and share with Select.tsx
    <div className="form-group">
      <label htmlFor={props.id}>{props.label}</label>
      <input
        value={value}
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

export const Input = <A extends RawFormData, Name extends keyof A & string>(
  props: InputProps<A, Name>,
) => {
  const render = (renderProps: FieldRenderProps<A[Name], HTMLElement>) =>
    RenderComponent<A, Name>({ ...renderProps, ...props });

  const { name, id, ...rest } = props;

  return <Field name={name} id={id || name} {...rest} render={render} />;
};

export const inputForCodec = <A extends FormData, O extends RawFormData>(
  _: Type<A, O>,
) => {
  return <Name extends keyof O & string>(
    props: InputProps<O, Name> & Required<O, Name>,
  ) => {
    const { required, ...rest } = props;
    return <Input<O, Name> required={required} {...rest} />;
  };
};
