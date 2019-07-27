import { Type } from "io-ts";
import React, { ReactNode, SelectHTMLAttributes } from "react";
import { Field, FieldRenderProps } from "react-final-form";
import { FormData, RawFormData, Required, SafeMeta } from ".";
import { FieldValue } from ".";

type ExtraProps = {
  // A non-optional label that we render in a <label> element to ensure accessibility.
  readonly label: string;

  // TODO strongly typed options and selected value(s)
  readonly children?: ReactNode;
};

/**
 * Select props that come directly from SelectHTMLAttributes.
 */
type HTMLSelectProps = Readonly<
  Pick<
    SelectHTMLAttributes<HTMLSelectElement>,
    // tslint:disable-next-line: max-union-size
    "id" | "required" | "multiple" | "placeholder" | "name"
  >
>;

export type SelectProps<
  A extends RawFormData,
  Name extends keyof A & string
> = HTMLSelectProps &
  ExtraProps & {
    readonly name: Name;
  };

type RenderProps<FV extends FieldValue> = Omit<
  FieldRenderProps<FV, HTMLSelectElement>,
  "meta"
> &
  SafeMeta<FV> &
  HTMLSelectProps &
  ExtraProps;

const RenderComponent = <FV extends FieldValue>(props: RenderProps<FV>) => {
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
        name={props.name}
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
        multiple={
          props.multiple !== undefined
            ? props.multiple
            : Array.isArray(props.meta.initial)
        }
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

export const Select = <A extends RawFormData, Name extends keyof A & string>(
  props: SelectProps<A, Name>,
) => {
  const { label, ...rest } = props;

  const render = (renderProps: FieldRenderProps<FieldValue, HTMLElement>) =>
    RenderComponent({
      ...renderProps,
      label,
    });

  return <Field {...rest} render={render} />;
};

export const SelectForCodec = <A extends FormData, O extends RawFormData>(
  _: Type<A, O>,
) => {
  return <Name extends keyof O & string>(
    props: SelectProps<O, Name> & Required<O, Name>,
  ) => {
    const { required, ...rest } = props;
    return <Select<O, Name> required={required} {...rest} />;
  };
};
