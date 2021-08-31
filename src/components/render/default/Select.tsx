import React, { Key, SelectHTMLAttributes } from "react";
import { FieldRenderProps } from "react-final-form";
import { OmitStrict } from "type-zoo";
import { ExtractFormValue, FormData } from "../../common";
import { FormElementRenderConfig } from "./common";

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
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion, @typescript-eslint/no-unnecessary-condition, @typescript-eslint/consistent-type-assertions
  (o as SelectOption<A>).label !== undefined &&
  // eslint-disable-next-line total-functions/no-unsafe-type-assertion, @typescript-eslint/no-unnecessary-condition, @typescript-eslint/consistent-type-assertions
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
  Name extends keyof FD & string,
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
  Name extends keyof FD & string,
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

// TODO: factor out duplication between Select and Input
export const Select =
  <FD extends FormData, Name extends keyof FD & string>(
    config: FormElementRenderConfig,
  ) =>
  // eslint-disable-next-line react/display-name
  (props: SelectRenderProps<FD, Name>): JSX.Element => {
    // TODO: make the derivation of feedback ID configurable
    const invalidFeedbackId = props.isInvalid
      ? `${props.id}-feedback`
      : undefined;

    const label = config.renderLabel({
      labelProps: undefined, // TODO: either plumb this through or remove it
      inputId: props.id,
      label: props.label,
      inputType: undefined, // This is a select so doesn't have an input type
    });

    const invalidFeedback =
      invalidFeedbackId !== undefined
        ? config.renderInvalidFeedback({
            feedbackProps: undefined, // TODO: either plumb this through or remove it
            id: invalidFeedbackId,
            // TODO fix this `any`
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            error:
              props.renderProps.meta.error ??
              props.renderProps.meta.submitError,
          })
        : null;

    return (
      <>
        {label}
        <select
          {...props.selectProps}
          id={props.id}
          value={
            props.multiple === true &&
            !Array.isArray(props.renderProps.input.value)
              ? []
              : props.renderProps.input.value
          }
          // TODO why doesn't props.renderProps.input.multiple work here?
          multiple={props.multiple}
          onBlur={props.renderProps.input.onBlur}
          onChange={props.renderProps.input.onChange}
          onFocus={props.renderProps.input.onFocus}
          name={props.renderProps.input.name}
          // 'To stop form controls from announcing as invalid by default, one can add aria-invalid="false" to any necessary element.'
          // See https://www.tpgi.com/required-attribute-requirements/
          aria-invalid={props.isInvalid}
          className={config.className({
            inputClassName: props.selectProps.className,
            invalidClassName: undefined, // TODO: either plumb this through or remove it
            validClassName: undefined, // TODO: either plumb this through or remove it
            inputType: undefined, // This is a select so doesn't have an input type
            isValid: props.isValid,
            isInvalid: props.isInvalid,
          })}
          // See https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA1#example-2-using-aria-describedby-to-associate-instructions-with-form-fields
          aria-describedby={invalidFeedbackId}
        >
          <RenderOptions options={props.options} />
        </select>
        {props.isInvalid ? invalidFeedback : null}
      </>
    );
  };
