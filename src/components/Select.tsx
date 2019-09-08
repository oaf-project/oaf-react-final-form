import React from "react";
import { Field, FieldRenderProps } from "react-final-form";
import { ExtractFormValue, Multiple, ParsedFormData, Required } from "./common";
import {
  ExtraSelectProps,
  SelectRenderComponent,
} from "./SelectRenderComponent";

export type SelectProps<
  FD extends ParsedFormData,
  Name extends keyof FD & string
> = ExtraSelectProps<FD, Name> & { readonly name: Name };

export const Select = <
  FD extends ParsedFormData,
  Name extends keyof FD & string
>(
  props: SelectProps<FD, Name>,
) => {
  const { name, id, label, options, multiple, ...rest } = props;
  const idOrName = id || name;

  const render = (
    renderProps: FieldRenderProps<ExtractFormValue<FD[Name]>, HTMLElement>,
  ) =>
    SelectRenderComponent({
      ...rest,
      ...renderProps,
      id: idOrName,
      label,
      options,
      multiple,
    });

  return (
    <Field
      type="select"
      name={name}
      id={idOrName}
      multiple={multiple}
      render={render}
    />
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
