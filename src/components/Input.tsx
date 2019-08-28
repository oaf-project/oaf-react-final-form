import React from "react";
import { Field, FieldRenderProps } from "react-final-form";
import { FormData, FormValueType, Required } from "./common";
import { ExtraProps, InputRenderComponent } from "./InputRenderComponent";

export type InputProps<
  A extends FormData,
  Name extends keyof A & string
> = ExtraProps & {
  readonly name: Name;
};

export const Input = <A extends FormData, Name extends keyof A & string>(
  props: InputProps<A, Name>,
) => {
  const { name, id, label, type, ...rest } = props;

  // TODO render min, max, etc.
  const render = (
    renderProps: FieldRenderProps<FormValueType<A[Name]>, HTMLElement>,
  ) => InputRenderComponent({ label, ...renderProps });

  return (
    <Field name={name} id={id || name} type={type} {...rest} render={render} />
  );
};

export const inputForCodec = <FD extends FormData>() => {
  return <Name extends keyof FD & string>(
    props: Exclude<InputProps<FD, Name>, "required"> & Required<FD[Name]>,
  ) => {
    const { required, ...rest } = props;
    return <Input<FD, Name> required={required} {...rest} />;
  };
};
