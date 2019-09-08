import React from "react";
import { Field, FieldRenderProps } from "react-final-form";
import {
  ExtractFormValue,
  InputTypeConstraint,
  ParsedFormData,
  Required,
} from "./common";
import {
  ExtraInputProps,
  HTMLInputProps,
  InputRenderComponent,
} from "./InputRenderComponent";

export type RenderInput<
  FD extends ParsedFormData,
  Name extends keyof FD & string
> = (
  props: InputProps<FD, Name>,
) => (
  renderProps: FieldRenderProps<ExtractFormValue<FD[Name]>, HTMLInputElement>,
) => JSX.Element;

export type InputProps<
  FD extends ParsedFormData,
  Name extends keyof FD & string
> = HTMLInputProps &
  ExtraInputProps & {
    readonly id?: string;
    readonly name: Name;
    readonly render?: RenderInput<FD, Name>;
  };

export const Input = <
  FD extends ParsedFormData,
  Name extends keyof FD & string
>(
  props: InputProps<FD, Name>,
) => {
  const {
    id,
    name,
    label,
    formGroupProps,
    labelProps,
    feedbackProps,
    render,
    ...inputProps
  } = props;

  const defaultRender = (
    renderProps: FieldRenderProps<ExtractFormValue<FD[Name]>, HTMLInputElement>,
  ) =>
    InputRenderComponent({
      formGroupProps,
      labelProps,
      feedbackProps,
      inputProps,
      renderProps,
      id: id || name,
      label,
    });

  const renderFunc =
    typeof render !== "undefined" ? render(props) : defaultRender;

  return <Field name={name} type={inputProps.type} render={renderFunc} />;
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
