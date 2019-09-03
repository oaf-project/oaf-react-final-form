import React from "react";
import { Field, FieldRenderProps } from "react-final-form";
import { ExtractFormValue, ParsedFormData, Required } from "./common";
import { ExtraInputProps, InputRenderComponent } from "./InputRenderComponent";

export type InputProps<
  FD extends ParsedFormData,
  Name extends keyof FD & string
> = ExtraInputProps & {
  readonly name: Name;
};

export const Input = <
  FD extends ParsedFormData,
  Name extends keyof FD & string
>(
  props: InputProps<FD, Name>,
) => {
  const { name, id, label, type, ...rest } = props;

  // TODO render min, max, etc.
  const render = (
    renderProps: FieldRenderProps<ExtractFormValue<FD[Name]>, HTMLElement>,
  ) => InputRenderComponent({ label, ...renderProps });

  return (
    <Field name={name} id={id || name} type={type} {...rest} render={render} />
  );
};

export const inputForCodec = <FD extends ParsedFormData>() => {
  return <Name extends keyof FD & string>(
    props: Exclude<InputProps<FD, Name>, "required"> & Required<FD[Name]>,
  ) => {
    const { required, ...rest } = props;
    return <Input<FD, Name> required={required} {...rest} />;
  };
};
