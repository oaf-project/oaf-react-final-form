import React, { InputHTMLAttributes } from "react";
import { FieldRenderProps } from "react-final-form";
import { OmitStrict, Overwrite } from "type-zoo";
import {
  ExtractFormValue,
  FieldMetaState,
  FormData,
  InputType,
} from "./common";
import { FormGroup, FormGroupChildProps } from "./FormGroup";

export type ExtraInputProps = {
  /**
   * A non-optional label that we render in a <label> element to ensure accessibility.
   */
  readonly label: string | JSX.Element;
  readonly type?: InputType;
} & HTMLInputProps &
  FormGroupChildProps;

/**
 * Input props that come directly from InputHTMLAttributes.
 */
type HTMLInputProps = Readonly<
  OmitStrict<
    InputHTMLAttributes<HTMLInputElement>,
    // tslint:disable-next-line: max-union-size
    | "value"
    | "onBlur"
    | "onChange"
    | "defaultValue"
    | "name"
    | "aria-invalid"
    | "aria-describedby"
  >
>;

export type InputRenderProps<
  FD extends FormData,
  Name extends keyof FD & string
> = Overwrite<
  FieldRenderProps<ExtractFormValue<FD[Name]>, HTMLInputElement>,
  FieldMetaState<ExtractFormValue<FD[Name]>>
> &
  ExtraInputProps & { readonly id: string };

export const InputRenderComponent = <
  FD extends FormData,
  Name extends keyof FD & string
>(
  props: InputRenderProps<FD, Name>,
) => {
  // We don't want to render these into the dom so discard them.
  const {
    label,
    input,
    meta,
    formGroupProps,
    labelProps,
    feedbackProps,
    ...inputProps
  } = props;

  return (
    <FormGroup
      id={props.id}
      label={label}
      meta={props.meta}
      formGroupProps={formGroupProps}
      labelProps={labelProps}
      feedbackProps={feedbackProps}
    >
      {({ isInvalid, className, describedby }) => (
        <input
          value={props.input.value}
          onBlur={props.input.onBlur}
          onChange={props.input.onChange}
          name={props.input.name}
          type={props.input.type}
          aria-invalid={isInvalid}
          className={className}
          aria-describedby={describedby}
          {...inputProps}
        />
      )}
    </FormGroup>
  );
};
