import React, { Key, SelectHTMLAttributes } from "react";
import { FieldRenderProps } from "react-final-form";
import { Overwrite } from "type-zoo";
import { FormData, FormValueOption, FormValueType, SafeMeta } from "./common";

// TODO https://github.com/Microsoft/tslint-microsoft-contrib/issues/409
// tslint:disable: react-a11y-role-has-required-aria-props

export type SelectOption<A extends FormValueOption> = {
  // Union with empty string to allow default empty value as first select option.
  readonly value: A | "";
  readonly label: string;
  readonly disabled?: boolean;
  // https://reactjs.org/docs/lists-and-keys.html#keys
  readonly key?: Key;
};

export type SelectOptionGroup<A extends FormValueOption> = {
  readonly label?: string;
  readonly disabled?: boolean;
  readonly options: ReadonlyArray<SelectOption<A>>;
  // https://reactjs.org/docs/lists-and-keys.html#keys
  readonly key?: Key;
};

type SelectOptionOrGroup<A extends FormValueOption> =
  | SelectOptionGroup<A>
  | SelectOption<A>;

const isSelectOption = <A extends FormValueOption>(
  o: SelectOptionOrGroup<A>,
): o is SelectOption<A> =>
  (o as SelectOption<A>).label !== undefined &&
  (o as SelectOption<A>).value !== undefined;

export type SelectOptions<A extends unknown> = ReadonlyArray<
  SelectOptionOrGroup<FormValueType<A>>
>;

export type ExtraProps<A extends FormData, Name extends keyof A> = {
  // A non-noptional label that we render in a <label> element to ensure accessibility.
  readonly label: string | JSX.Element;
  readonly options: SelectOptions<A[Name]>;
} & HTMLSelectProps;

/**
 * Select props that come directly from SelectHTMLAttributes.
 */
export type HTMLSelectProps = Readonly<
  Pick<
    SelectHTMLAttributes<HTMLSelectElement>,
    // tslint:disable-next-line: max-union-size
    "id" | "required" | "multiple" | "placeholder"
  >
>;

export type SelectRenderProps<
  A extends FormData,
  Name extends keyof A & string
> = Overwrite<
  FieldRenderProps<FormValueType<A[Name]>, HTMLSelectElement>,
  SafeMeta<FormValueType<A[Name]>>
> &
  ExtraProps<A, Name>;

export const RenderOptions = <
  A extends FormData,
  Name extends keyof A & string
>({
  options,
}: {
  readonly options: SelectOptions<A[Name]>;
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
  A extends FormData,
  Name extends keyof A & string
>(
  props: SelectRenderProps<A, Name>,
) => {
  const feedbackId = `${props.id}-feedback`;
  // 'To stop form controls from announcing as invalid by default, one can add aria-invalid="false" to any necessary element.'
  // See https://developer.paciellogroup.com/blog/2019/02/required-attribute-requirements/
  const isInvalid: boolean =
    (props.meta.touched && props.meta.invalid) || false;
  const isValid = props.meta.touched && props.meta.valid;

  return (
    <div className="form-group">
      <label htmlFor={props.id}>{props.label}</label>
      <select
        value={
          props.multiple && !Array.isArray(props.input.value)
            ? []
            : props.input.value
        }
        onBlur={props.input.onBlur}
        onChange={props.input.onChange}
        id={props.id}
        name={props.input.name}
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
