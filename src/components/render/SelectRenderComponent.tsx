import React, { Key, SelectHTMLAttributes } from "react";
import { FieldRenderProps } from "react-final-form";
import { OmitStrict } from "type-zoo";
import { ExtractFormValue, FormData } from "../common";
import {
  FormElement,
  RenderLabelProps,
  RenderInvalidFeedbackProps,
} from "./FormElement";

export type SelectOption<A extends string> = {
  // Union with empty string to allow default empty value as first select option.
  // TODO should we constrain `SelectOptions` below so that only the first element can be empty string?
  readonly value: A | "";
  readonly label: string;
  readonly disabled?: boolean;
  // https://reactjs.org/docs/lists-and-keys.html#keys
  readonly key?: Key;
};

export type SelectOptionGroup<A extends string> = {
  readonly label?: string;
  readonly disabled?: boolean;
  readonly options: ReadonlyArray<SelectOption<A>>;
  // https://reactjs.org/docs/lists-and-keys.html#keys
  readonly key?: Key;
};

type SelectOptionOrGroup<A extends string> =
  | SelectOptionGroup<A>
  | SelectOption<A>;

const isSelectOption = <A extends string>(
  o: SelectOptionOrGroup<A>,
): o is SelectOption<A> =>
  (o as SelectOption<A>).label !== undefined &&
  (o as SelectOption<A>).value !== undefined;

export type SelectOptions<A extends unknown> = ReadonlyArray<
  SelectOptionOrGroup<ExtractFormValue<A>>
>;

export type ExtraSelectProps<FD extends FormData, Name extends keyof FD> = {
  /**
   * A non-optional label that we render in a <label> element to ensure accessibility.
   */
  readonly label: string | JSX.Element;
  readonly multiple?: boolean;
  readonly options: SelectOptions<FD[Name]>;
};

/**
 * Select props that come directly from SelectHTMLAttributes.
 */
export type HTMLSelectProps = Readonly<
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
  // TODO go back to common FieldMetaState with safe error and submitError props once type coverage is sorted
  readonly renderProps: FieldRenderProps<
    ExtractFormValue<FD[Name]>,
    HTMLSelectElement
  >;
  readonly selectProps: HTMLSelectProps;
  readonly id: string;
  readonly isInvalid: boolean;
  readonly isValid: boolean;
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
    {options.map((o) =>
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

export type SelectRenderComponentConfig = {
  readonly renderLabel: (props: RenderLabelProps) => JSX.Element;
  readonly renderInvalidFeedback: (
    props: RenderInvalidFeedbackProps,
  ) => JSX.Element;
};

export const SelectRenderComponent = <
  FD extends FormData,
  Name extends keyof FD & string
>(
  config: SelectRenderComponentConfig,
) => (props: SelectRenderProps<FD, Name>): JSX.Element => (
  <FormElement
    inputId={props.id}
    inputType={undefined}
    label={props.label}
    renderLabel={config.renderLabel}
    renderInvalidFeedback={config.renderInvalidFeedback}
    inputClassName={props.selectProps.className}
    // TODO plumb these through config, then move selectProps to the same place, then update inputClassName
    invalidClassName={undefined}
    validClassName={undefined}
    labelProps={undefined}
    feedbackProps={undefined}
    meta={props.renderProps.meta}
    isInvalid={props.isInvalid}
    isValid={props.isValid}
  >
    {({ className, invalidFeedbackId }): JSX.Element => (
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
        // 'To stop form controls from announcing as invalid by default, one can add aria-invalid="false" to any necessary element.'
        // See https://developer.paciellogroup.com/blog/2019/02/required-attribute-requirements/
        aria-invalid={props.isInvalid}
        // See https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA1#example-2-using-aria-describedby-to-associate-instructions-with-form-fields
        aria-describedby={invalidFeedbackId}
      >
        <RenderOptions options={props.options} />
      </select>
    )}
  </FormElement>
);
