import React from "react";
import { Field, FieldRenderProps } from "react-final-form";
import { FormData, FormValueType, Multiple, Required } from "./common";
import { ExtraProps, SelectRenderComponent } from "./SelectRenderComponent";

export type SelectProps<
  A extends FormData,
  Name extends keyof A & string
> = ExtraProps<A, Name> & { readonly name: Name };

export const Select = <A extends FormData, Name extends keyof A & string>(
  props: SelectProps<A, Name>,
) => {
  const { name, id, label, options, multiple, required, placeholder } = props;

  const render = (
    renderProps: FieldRenderProps<FormValueType<A[Name]>, HTMLElement>,
  ) =>
    SelectRenderComponent({
      label,
      options,
      multiple,
      ...renderProps,
    });

  return (
    <Field
      type="select"
      name={name}
      multiple={multiple}
      required={required}
      id={id || name}
      placeholder={placeholder}
      render={render}
    />
  );
};

export const selectForCodec = <FD extends FormData>() => {
  return <Name extends keyof FD & string>(
    props: Exclude<SelectProps<FD, Name>, "required" | "multiple"> &
      Required<FD[Name]> &
      Multiple<FD[Name]>,
  ) => {
    const { required, multiple, ...rest } = props;
    return <Select required={required} multiple={multiple} {...rest} />;
  };
};
