import React, { Key, SelectHTMLAttributes } from "react";
import { FieldRenderProps } from "react-final-form";
import { OmitStrict, Overwrite } from "type-zoo";
import {
  ExtractFormValue,
  FieldMetaState,
  FormData,
  FormValue,
} from "./common";
import { FormGroup, FormGroupChildProps } from "./FormGroup";

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

export type ExtraSelectProps<FD extends FormData, Name extends keyof FD> = {
  // A non-optional label that we render in a <label> element to ensure accessibility.
  readonly label: string | JSX.Element;
  readonly multiple?: boolean;
  readonly options: SelectOptions<FD[Name]>;
} & FormGroupChildProps;

/**
 * Select props that come directly from SelectHTMLAttributes.
 */
type HTMLSelectProps = Readonly<
  OmitStrict<
    SelectHTMLAttributes<HTMLSelectElement>,
    | "id"
    | "value"
    | "multiple"
    | "onBlur"
    | "onChange"
    | "onFocus"
    | "name"
    | "aria-invalid"
    | "aria-describedby"
  >
>;

export type SelectRenderProps<
  FD extends FormData,
  Name extends keyof FD & string
> = ExtraSelectProps<FD, Name> & {
  readonly renderProps: Overwrite<
    FieldRenderProps<ExtractFormValue<FD[Name]>, HTMLSelectElement>,
    FieldMetaState<ExtractFormValue<FD[Name]>>
  >;
  readonly selectProps: HTMLSelectProps;
  readonly id: string;
};

export const RenderOptions = <
  FD extends FormData,
  Name extends keyof FD & string
>({
  options,
}: {
  readonly options: SelectOptions<FD[Name]>;
}): JSX.Element => (
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

export const SelectRenderComponent = <
  FD extends FormData,
  Name extends keyof FD & string
>(
  props: SelectRenderProps<FD, Name>,
): JSX.Element => (
  <FormGroup
    inputId={props.id}
    label={props.label}
    inputClassName={props.selectProps.className}
    // TODO plumb these through
    invalidClassName={undefined}
    validClassName={undefined}
    meta={props.renderProps.meta}
    formGroupProps={props.formGroupProps}
    labelProps={props.labelProps}
    feedbackProps={props.feedbackProps}
  >
    {({ isInvalid, className, describedby }) => (
      <select
        {...props.selectProps}
        id={props.id}
        value={
          props.multiple && !Array.isArray(props.renderProps.input.value)
            ? []
            : props.renderProps.input.value
        }
        // TODO why doesn't props.renderProps.input.multiple work here?
        multiple={props.multiple}
        onBlur={props.renderProps.input.onBlur}
        onChange={props.renderProps.input.onChange}
        onFocus={props.renderProps.input.onFocus}
        name={props.renderProps.input.name}
        className={className}
        aria-invalid={isInvalid}
        aria-describedby={describedby}
      >
        <RenderOptions options={props.options} />
      </select>
    )}
  </FormGroup>
);
