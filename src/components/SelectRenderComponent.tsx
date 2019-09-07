import React, { Key, SelectHTMLAttributes } from "react";
import { FieldRenderProps } from "react-final-form";
import { OmitStrict, Overwrite } from "type-zoo";
import {
  ExtractFormValue,
  FieldMetaState,
  FormData,
  FormValue,
  ParsedFormData,
} from "./common";
import { FormGroup } from "./FormGroup";

// TODO https://github.com/Microsoft/tslint-microsoft-contrib/issues/409
// tslint:disable: react-a11y-role-has-required-aria-props

export type SelectOption<A extends FormValue> = {
  // Union with empty string to allow default empty value as first select option.
  readonly value: A | "";
  readonly label: string;
  readonly disabled?: boolean;
  // https://reactjs.org/docs/lists-and-keys.html#keys
  readonly key?: Key;
};

export type SelectOptionGroup<A extends FormValue> = {
  readonly label?: string;
  readonly disabled?: boolean;
  readonly options: ReadonlyArray<SelectOption<A>>;
  // https://reactjs.org/docs/lists-and-keys.html#keys
  readonly key?: Key;
};

type SelectOptionOrGroup<A extends FormValue> =
  | SelectOptionGroup<A>
  | SelectOption<A>;

const isSelectOption = <A extends FormValue>(
  o: SelectOptionOrGroup<A>,
): o is SelectOption<A> =>
  (o as SelectOption<A>).label !== undefined &&
  (o as SelectOption<A>).value !== undefined;

export type SelectOptions<A extends unknown> = ReadonlyArray<
  SelectOptionOrGroup<ExtractFormValue<A>>
>;

export type ExtraSelectProps<
  FD extends ParsedFormData,
  Name extends keyof FD
> = {
  // A non-optional label that we render in a <label> element to ensure accessibility.
  readonly label: string | JSX.Element;
  readonly options: SelectOptions<FD[Name]>;
} & HTMLSelectProps;

/**
 * Select props that come directly from SelectHTMLAttributes.
 */
type HTMLSelectProps = Readonly<
  OmitStrict<
    SelectHTMLAttributes<HTMLSelectElement>,
    // tslint:disable-next-line: max-union-size
    | "value"
    | "onBlur"
    | "onChange"
    | "name"
    | "aria-invalid"
    | "aria-describedby"
  >
>;

export type SelectRenderProps<
  FD extends FormData,
  Name extends keyof FD & string
> = Overwrite<
  FieldRenderProps<ExtractFormValue<FD[Name]>, HTMLSelectElement>,
  FieldMetaState<ExtractFormValue<FD[Name]>>
> &
  ExtraSelectProps<FD, Name>;

export const RenderOptions = <
  FD extends FormData,
  Name extends keyof FD & string
>({
  options,
}: {
  readonly options: SelectOptions<FD[Name]>;
}) => {
  return (
    <>
      {options.map(o =>
        isSelectOption(o) ? (
          <option key={o.key} value={o.value} disabled={o.disabled}>
            {o.label}
          </option>
        ) : (
          <optgroup key={o.key} label={o.label} disabled={o.disabled}>
            <RenderOptions options={o.options} />
          </optgroup>
        ),
      )}
    </>
  );
};

export const SelectRenderComponent = <
  FD extends FormData,
  Name extends keyof FD & string
>(
  props: SelectRenderProps<FD, Name>,
) => {
  // We don't want to render these into the dom so discard them.
  const { label, options, input, meta, ...selectProps } = props;
  return (
    <FormGroup {...props}>
      {({ isInvalid, className, describedby }) => (
        <select
          value={
            props.multiple && !Array.isArray(props.input.value)
              ? []
              : props.input.value
          }
          onBlur={props.input.onBlur}
          onChange={props.input.onChange}
          name={props.input.name}
          className={className}
          aria-invalid={isInvalid}
          aria-describedby={describedby}
          {...selectProps}
        >
          <RenderOptions options={props.options} />
        </select>
      )}
    </FormGroup>
  );
};
