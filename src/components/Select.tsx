import { Type } from "io-ts";
import React, { Key, SelectHTMLAttributes } from "react";
import { Field, FieldRenderProps } from "react-final-form";
import { OmitStrict as Omit } from "type-zoo";
import { FormData, Multiple, RawFormData, Required, SafeMeta } from "./common";

// TODO https://github.com/Microsoft/tslint-microsoft-contrib/issues/409
// tslint:disable: react-a11y-role-has-required-aria-props

export type SelectOption<A> = {
  // Union with empty string to allow default empty value as first select option.
  readonly value: A | "";
  readonly label: string;
  readonly disabled?: boolean;
  readonly selected?: boolean;
  // https://reactjs.org/docs/lists-and-keys.html#keys
  readonly key?: Key;
};

export type SelectOptionGroup<A> = {
  readonly label?: string;
  readonly disabled?: boolean;
  readonly options: ReadonlyArray<SelectOption<A>>;
  // https://reactjs.org/docs/lists-and-keys.html#keys
  readonly key?: Key;
};

type SelectOptionOrGroup<A> = SelectOptionGroup<A> | SelectOption<A>;

const isSelectOption = <A, _>(
  o: SelectOptionOrGroup<A>,
): o is SelectOption<A> =>
  (o as SelectOption<A>).label !== undefined &&
  (o as SelectOption<A>).value !== undefined;

export type SelectOptionType<A> = Exclude<
  A extends ReadonlyArray<infer X> ? X : A,
  undefined
>;

export type SelectOptions<A> = ReadonlyArray<
  SelectOptionOrGroup<SelectOptionType<A>>
>;

type ExtraProps<A extends RawFormData, Name extends keyof A> = {
  // A non-optional label that we render in a <label> element to ensure accessibility.
  readonly label: string;
  readonly name: Name;
  readonly options: SelectOptions<A[Name]>;
};

/**
 * Select props that come directly from SelectHTMLAttributes.
 */
type HTMLSelectProps = Readonly<
  Pick<
    SelectHTMLAttributes<HTMLSelectElement>,
    // tslint:disable-next-line: max-union-size
    "id" | "required" | "multiple" | "placeholder"
  >
>;

export type SelectProps<
  A extends RawFormData,
  Name extends keyof A & string
> = HTMLSelectProps & ExtraProps<A, Name>;

type RenderProps<A extends RawFormData, Name extends keyof A & string> = Omit<
  FieldRenderProps<A[Name], HTMLSelectElement>,
  "meta"
> &
  SafeMeta<A[Name]> &
  HTMLSelectProps &
  ExtraProps<A, Name>;

const RenderOptions = <A extends RawFormData, Name extends keyof A & string>({
  options,
}: {
  readonly options: SelectOptions<A[Name]>;
}) => {
  // tslint:disable: readonly-array
  return (
    <>
      {options.map(o =>
        isSelectOption(o) ? (
          <option
            key={o.key}
            // TODO remove this horrible cast
            value={(o.value as unknown) as string}
            disabled={o.disabled}
            selected={o.selected}
          >
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
  // tslint:enable: readonly-array
};

const RenderComponent = <A extends RawFormData, Name extends keyof A & string>(
  props: RenderProps<A, Name>,
) => {
  const feedbackId = `${props.id}-feedback`;
  // 'To stop form controls from announcing as invalid by default, one can add aria-invalid="false" to any necessary element.'
  // See https://developer.paciellogroup.com/blog/2019/02/required-attribute-requirements/
  const isInvalid: boolean =
    (props.meta.touched && props.meta.invalid) || false;
  const isValid = props.meta.touched && props.meta.valid;

  // We have to discard ReadonlyArray<string> from this type to be able to assign it to the input's value.
  // tslint:disable-next-line: readonly-array max-union-size
  const value = props.input.value as string | string[] | number | undefined;

  return (
    <div className="form-group">
      <label htmlFor={props.id}>{props.label}</label>
      <select
        value={props.multiple && !Array.isArray(value) ? [] : value}
        onBlur={props.input.onBlur}
        onChange={props.input.onChange}
        id={props.id}
        name={props.name}
        className={
          "form-control" +
          (isInvalid ? " is-invalid" : "") +
          (isValid ? " is-valid" : "")
        }
        placeholder={props.placeholder}
        aria-invalid={isInvalid}
        required={props.required}
        aria-required={props.required}
        aria-labelledby={isInvalid ? feedbackId : undefined}
        multiple={props.multiple}
      >
        <RenderOptions options={props.options} />
      </select>
      {isInvalid && (
        <div id={feedbackId} className="invalid-feedback">
          {/* TODO i18n */}
          {props.meta.error ||
            props.meta.submitError ||
            "This field is invalid."}
        </div>
      )}
    </div>
  );
};

export const Select = <A extends RawFormData, Name extends keyof A & string>(
  props: SelectProps<A, Name>,
) => {
  const { name, id, label, options, multiple, ...rest } = props;

  const render = (renderProps: FieldRenderProps<A[Name], HTMLElement>) =>
    RenderComponent<A, Name>({
      name,
      label,
      options,
      multiple,
      ...renderProps,
    });

  return <Field name={name} id={id || name} {...rest} render={render} />;
};

export const selectForCodec = <A extends FormData, O extends RawFormData>(
  _: Type<A, O>,
) => {
  return <Name extends keyof O & string>(
    props: SelectProps<O, Name> & Required<O, Name> & Multiple<O, Name>,
  ) => {
    const { required, multiple, ...rest } = props;
    return (
      <Select<O, Name> required={required} multiple={multiple} {...rest} />
    );
  };
};
