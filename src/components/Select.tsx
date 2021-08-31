import React from "react";
import { Field, FieldRenderProps } from "react-final-form";
import { OmitStrict } from "type-zoo/types";
import {
  ExtractFormValue,
  FormData,
  Multiple,
  ParsedFormData,
  Required,
  isInputInvalid,
  isInputValid,
} from "./common";
import {
  ExtraSelectProps,
  HTMLSelectProps,
  SelectRenderProps,
} from "./render/default/Select";
import { touchedHack, TouchedHackProps } from "./touched-hack";

export type SelectProps<
  PFD extends ParsedFormData,
  FD extends FormData,
  Name extends keyof PFD & keyof FD & string,
> = HTMLSelectProps &
  ExtraSelectProps<FD, Name> &
  TouchedHackProps & {
    readonly id?: string;
    readonly name: Name;
    readonly render: (props: SelectRenderProps<FD, Name>) => JSX.Element;
    readonly value?: ExtractFormValue<FD[Name]>;
  };

export const Select = <
  PFD extends ParsedFormData,
  FD extends FormData,
  Name extends keyof PFD & keyof FD & string,
>(
  props: SelectProps<PFD, FD, Name>,
): JSX.Element => {
  const [touchedState, updateTouched] = React.useReducer(
    (touched: boolean | undefined) => touched,
    undefined,
  );

  const {
    id,
    name,
    value,
    label,
    options,
    multiple,
    render,
    keepTouchedOnReinitialize,
    ...selectProps
  } = props;

  const renderFunc = (
    renderProps: FieldRenderProps<
      ExtractFormValue<FD[Name]>,
      HTMLSelectElement
    >,
  ): JSX.Element => {
    const propsForRender: SelectRenderProps<FD, Name> = {
      selectProps,
      renderProps: touchedHack(
        renderProps,
        touchedState,
        updateTouched,
        keepTouchedOnReinitialize,
      ),
      id: id ?? name,
      label,
      options,
      multiple,
      isInvalid: isInputInvalid(renderProps),
      isValid: isInputValid(renderProps),
    };

    return render(propsForRender);
  };

  return (
    <Field
      type="select"
      name={name}
      value={value}
      multiple={multiple}
      render={renderFunc}
    />
  );
};

export type DefaultSelectForCodecProps<
  PFD extends ParsedFormData,
  FD extends FormData,
> = Pick<
  SelectProps<PFD, FD, keyof PFD & keyof FD & string>,
  "render" | "keepTouchedOnReinitialize"
>;

export type SelectForCodecProps<
  PFD extends ParsedFormData,
  FD extends FormData,
  Name extends keyof PFD & keyof FD & string,
> = OmitStrict<SelectProps<PFD, FD, Name>, "render" | "multiple"> &
  Partial<Pick<SelectProps<PFD, FD, Name>, "render">> &
  Required<PFD[Name]> &
  Multiple<PFD[Name]>;

// eslint-disable-next-line functional/functional-parameters
export const selectForCodec = <PFD extends ParsedFormData, FD extends FormData>(
  defaultProps: DefaultSelectForCodecProps<PFD, FD>,
) => {
  // eslint-disable-next-line react/display-name
  return <Name extends keyof PFD & keyof FD & string>(
    props: SelectForCodecProps<PFD, FD, Name>,
  ): JSX.Element => {
    const { required, multiple, ...rest } = props;
    return (
      <Select<PFD, FD, Name>
        {...defaultProps}
        required={required}
        multiple={multiple}
        {...rest}
      />
    );
  };
};
