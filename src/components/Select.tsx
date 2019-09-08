import React from "react";
import { Field, FieldRenderProps } from "react-final-form";
import { ExtractFormValue, Multiple, ParsedFormData, Required } from "./common";
import {
  ExtraSelectProps,
  SelectRenderComponent,
} from "./SelectRenderComponent";

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
};

export const Select = <
  FD extends ParsedFormData,
  Name extends keyof FD & string
>(
  props: SelectProps<FD, Name>,
) => {
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
    ...selectProps
  } = props;
  const idOrName = id || name;

  const defaultRender = (
    renderProps: FieldRenderProps<ExtractFormValue<FD[Name]>, HTMLElement>,
  ) =>
    SelectRenderComponent({
      formGroupProps,
      labelProps,
      feedbackProps,
      selectProps,
      renderProps,
      id: idOrName,
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

export const selectForCodec = <FD extends ParsedFormData>() => {
  return <Name extends keyof FD & string>(
    props: Exclude<SelectProps<FD, Name>, "required" | "multiple"> &
      Required<FD[Name]> &
      Multiple<FD[Name]>,
  ) => {
    const { required, multiple, ...rest } = props;
    return <Select required={required} multiple={multiple} {...rest} />;
  };
};
