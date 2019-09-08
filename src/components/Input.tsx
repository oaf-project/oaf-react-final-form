import React from "react";
import { Field, FieldRenderProps } from "react-final-form";
import {
  ExtractFormValue,
  ParsedFormData,
  Required,
  InputTypeConstraint,
} from "./common";
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
  const { name, id, label, ...rest } = props;

  const render = (
    renderProps: FieldRenderProps<ExtractFormValue<FD[Name]>, HTMLElement>,
  ) => InputRenderComponent({ label, ...rest, ...renderProps });

  return <Field name={name} id={id || name} {...rest} render={render} />;
};

export const inputForCodec = <FD extends ParsedFormData>() => {
  return <Name extends keyof FD & string>(
    // TODO ExcludeStrict
    props: Exclude<InputProps<FD, Name>, "required" | "type"> &
      Required<FD[Name]> &
      InputTypeConstraint<FD[Name]>,
  ) => {
    const { required, type, ...rest } = props;
    return <Input<FD, Name> required={required} type={type} {...rest} />;
  };
};
