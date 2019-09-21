import React from "react";
import { Field, FieldRenderProps } from "react-final-form";
import { OmitStrict } from "type-zoo/types";
import { ExtractFormValue, Multiple, ParsedFormData, Required } from "./common";
import {
  ExtraSelectProps,
  SelectRenderComponent,
} from "./SelectRenderComponent";
import { touchedHack } from "./touched-hack";

export type RenderSelect<
  FD extends ParsedFormData,
  Name extends keyof FD & string
> = (
  props: SelectProps<FD, Name>,
) => (
  renderProps: FieldRenderProps<ExtractFormValue<FD[Name]>, HTMLSelectElement>,
) => JSX.Element;

export type SelectProps<
  FD extends ParsedFormData,
  Name extends keyof FD & string
> = ExtraSelectProps<FD, Name> & {
  readonly id?: string;
  readonly name: Name;
  readonly render?: RenderSelect<FD, Name>;
  readonly keepTouchedOnReinitialize?: boolean;
};

export type SelectForCodecProps<
  FD extends ParsedFormData,
  Name extends keyof FD & string
> = OmitStrict<SelectProps<FD, Name>, "multiple"> &
  Required<FD[Name]> &
  Multiple<FD[Name]>;

export const Select = <
  FD extends ParsedFormData,
  Name extends keyof FD & string
>(
  props: SelectProps<FD, Name>,
): JSX.Element => {
  const touchedState = React.useState<boolean>();

  const {
    name,
    id,
    label,
    options,
    formGroupProps,
    multiple,
    labelProps,
    feedbackProps,
    render,
    keepTouchedOnReinitialize,
    ...selectProps
  } = props;

  const defaultRender = (
    renderProps: FieldRenderProps<ExtractFormValue<FD[Name]>, HTMLElement>,
  ): JSX.Element =>
    SelectRenderComponent({
      formGroupProps,
      labelProps,
      feedbackProps,
      selectProps,
      renderProps: touchedHack(
        renderProps,
        touchedState,
        keepTouchedOnReinitialize,
      ),
      id: id || name,
      label,
      options,
      multiple,
    });

  const renderFunc =
    typeof render !== "undefined" ? render(props) : defaultRender;

  return (
    <Field type="select" name={name} multiple={multiple} render={renderFunc} />
  );
};

// eslint-disable-next-line functional/functional-parameters
export const selectForCodec = <FD extends ParsedFormData>() => {
  // eslint-disable-next-line react/display-name
  return <Name extends keyof FD & string>(
    props: SelectForCodecProps<FD, Name>,
  ) => {
    const { required, multiple, ...rest } = props;
    return (
      <Select<FD, Name> required={required} multiple={multiple} {...rest} />
    );
  };
};
