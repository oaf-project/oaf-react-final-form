import React from "react";
import { Field, FieldRenderProps } from "react-final-form";
import { OmitStrict } from "type-zoo/types";
import {
  ExtractFormValue,
  FormData,
  InputTypeConstraint,
  ParsedFormData,
  Required,
  isInputInvalid,
  isInputValid,
} from "./common";
import {
  ExtraInputProps,
  HTMLInputProps,
  InputRenderProps,
} from "./render/InputRenderComponent";
import { touchedHack, TouchedHackProps } from "./touched-hack";

export type InputProps<
  PFD extends ParsedFormData,
  FD extends FormData,
  Name extends keyof PFD & keyof FD & string
> = HTMLInputProps &
  ExtraInputProps &
  TouchedHackProps & {
    readonly id?: string;
    readonly name: Name;
    readonly render: (renderProps: InputRenderProps<FD, Name>) => JSX.Element;
    readonly value?: ExtractFormValue<FD[Name]>;
  };

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
    render,
    keepTouchedOnReinitialize,
    ...inputProps
  } = props;

  const renderFunc = (
    renderProps: FieldRenderProps<ExtractFormValue<FD[Name]>, HTMLInputElement>,
  ): JSX.Element => {
    const propsForRender: InputRenderProps<FD, Name> = {
      inputProps,
      renderProps: touchedHack(
        renderProps,
        touchedState,
        keepTouchedOnReinitialize,
      ),
      id:
        id ||
        // include value to ensure unique IDs for checkbox and radio inputs
        (props.type === "checkbox" || props.type === "radio"
          ? // TODO enforce via types that value cannot be undefined if type is checkbox or radio
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            `${name}-${value}`
          : name),
      label,
      isInvalid: isInputInvalid(renderProps),
      isValid: isInputValid(renderProps),
    };

    return render(propsForRender);
  };

  return (
    <Field name={name} value={value} type={props.type} render={renderFunc} />
  );
};

export type DefaultInputForCodecProps<
  PFD extends ParsedFormData,
  FD extends FormData
> = Pick<
  InputProps<PFD, FD, keyof PFD & keyof FD & string>,
  "render" | "keepTouchedOnReinitialize"
>;

export type InputForCodecProps<
  PFD extends ParsedFormData,
  FD extends FormData,
  Name extends keyof PFD & keyof FD & string
> = OmitStrict<InputProps<PFD, FD, Name>, "render" | "required" | "type"> &
  Partial<Pick<InputProps<PFD, FD, Name>, "render">> &
  Required<PFD[Name]> &
  InputTypeConstraint<PFD[Name]>;

// eslint-disable-next-line functional/functional-parameters
export const inputForCodec = <PFD extends ParsedFormData, FD extends FormData>(
  defaultProps: DefaultInputForCodecProps<PFD, FD>,
) => {
  // eslint-disable-next-line react/display-name
  return <Name extends keyof PFD & keyof FD & string>(
    props: InputForCodecProps<PFD, FD, Name>,
  ): JSX.Element => {
    const { required, type, ...rest } = props;
    return (
      <Input<PFD, FD, Name>
        {...defaultProps}
        required={required}
        type={type}
        {...rest}
      />
    );
  };
};
