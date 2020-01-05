import React from "react";
import { Field, FieldRenderProps } from "react-final-form";
import { OmitStrict } from "type-zoo/types";
import {
  ExtractFormValue,
  FormData,
  InputTypeConstraint,
  ParsedFormData,
  Required,
} from "./common";
import {
  ExtraInputProps,
  HTMLInputProps,
  InputRenderComponent,
} from "./InputRenderComponent";
import { touchedHack } from "./touched-hack";

export type RenderInput<
  PFD extends ParsedFormData,
  FD extends FormData,
  Name extends keyof PFD & keyof FD & string
> = (
  props: InputProps<PFD, FD, Name>,
) => (
  renderProps: FieldRenderProps<ExtractFormValue<FD[Name]>, HTMLInputElement>,
) => JSX.Element;

export type InputProps<
  PFD extends ParsedFormData,
  FD extends FormData,
  Name extends keyof PFD & keyof FD & string
> = HTMLInputProps &
  ExtraInputProps & {
    readonly id?: string;
    readonly name: Name;
    readonly render?: RenderInput<PFD, FD, Name>;
    readonly keepTouchedOnReinitialize?: boolean;
    readonly value?: ExtractFormValue<FD[Name]>;
  };

export type InputForCodecProps<
  PFD extends ParsedFormData,
  FD extends FormData,
  Name extends keyof PFD & keyof FD & string
> = OmitStrict<InputProps<PFD, FD, Name>, "required" | "type"> &
  Required<PFD[Name]> &
  InputTypeConstraint<PFD[Name]>;

export const Input = <
  PFD extends ParsedFormData,
  FD extends FormData,
  Name extends keyof PFD & keyof FD & string
>(
  props: InputProps<PFD, FD, Name>,
): JSX.Element => {
  const touchedState = React.useState<boolean>();

  const {
    id,
    name,
    value,
    label,
    formGroupProps,
    labelProps,
    feedbackProps,
    render,
    keepTouchedOnReinitialize,
    ...inputProps
  } = props;

  const isCheckboxOrRadio =
    inputProps.type === "checkbox" || inputProps.type === "radio";

  const defaultRender = (
    renderProps: FieldRenderProps<ExtractFormValue<FD[Name]>, HTMLInputElement>,
  ): JSX.Element =>
    InputRenderComponent({
      formGroupProps,
      labelProps,
      feedbackProps,
      inputProps,
      renderProps: touchedHack(
        renderProps,
        touchedState,
        keepTouchedOnReinitialize,
      ),
      id:
        id ||
        // include value to ensure unique IDs for checkbox and radio inputs
        (isCheckboxOrRadio ? `${name}-${value}` : name),
      label,
    });

  const renderFunc =
    typeof render !== "undefined" ? render(props) : defaultRender;

  return (
    <Field
      name={name}
      value={value}
      type={inputProps.type}
      render={renderFunc}
    />
  );
};

// eslint-disable-next-line functional/functional-parameters
export const inputForCodec = <
  PFD extends ParsedFormData,
  FD extends FormData
>() => {
  // eslint-disable-next-line react/display-name
  return <Name extends keyof PFD & keyof FD & string>(
    props: InputForCodecProps<PFD, FD, Name>,
  ): JSX.Element => {
    const { required, type, ...rest } = props;
    return <Input<PFD, FD, Name> required={required} type={type} {...rest} />;
  };
};
