import React from "react";
import { Field, FieldRenderProps } from "react-final-form";
import { OmitStrict } from "type-zoo/types";
import {
  ExtractFormValue,
  FormData,
  Multiple,
  ParsedFormData,
  Required,
} from "./common";
import {
  ExtraSelectProps,
  SelectRenderComponent,
} from "./SelectRenderComponent";
import { touchedHack } from "./touched-hack";

export type RenderSelect<
  PFD extends ParsedFormData,
  FD extends FormData,
  Name extends keyof PFD & keyof FD & string
> = (
  props: SelectProps<PFD, FD, Name>,
) => (
  renderProps: FieldRenderProps<ExtractFormValue<FD[Name]>, HTMLSelectElement>,
) => JSX.Element;

export type SelectProps<
  PFD extends ParsedFormData,
  FD extends FormData,
  Name extends keyof PFD & keyof FD & string
> = ExtraSelectProps<FD, Name> & {
  readonly id?: string;
  readonly name: Name;
  readonly render?: RenderSelect<PFD, FD, Name>;
  readonly keepTouchedOnReinitialize?: boolean;
};

export type SelectForCodecProps<
  PFD extends ParsedFormData,
  FD extends FormData,
  Name extends keyof PFD & keyof FD & string
> = OmitStrict<SelectProps<PFD, FD, Name>, "multiple"> &
  Required<PFD[Name]> &
  Multiple<PFD[Name]>;

export const Select = <
  PFD extends ParsedFormData,
  FD extends FormData,
  Name extends keyof PFD & keyof FD & string
>(
  props: SelectProps<PFD, FD, Name>,
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
export const selectForCodec = <
  PFD extends ParsedFormData,
  FD extends FormData
>() => {
  // eslint-disable-next-line react/display-name
  return <Name extends keyof PFD & keyof FD & string>(
    props: SelectForCodecProps<PFD, FD, Name>,
  ) => {
    const { required, multiple, ...rest } = props;
    return (
      <Select<PFD, FD, Name>
        required={required}
        multiple={multiple}
        {...rest}
      />
    );
  };
};
