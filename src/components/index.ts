import * as t from "io-ts";
import { Type } from "io-ts";
import { FormData, ParsedFormData } from "./common";
import { formForCodec, DefaultFormForCodecProps } from "./Form";
import { inputForCodec, DefaultInputForCodecProps } from "./Input";
import { selectForCodec, DefaultSelectForCodecProps } from "./Select";
import { SelectRenderComponent } from "./render/SelectRenderComponent";
import { InputRenderComponent } from "./render/InputRenderComponent";
import { FormError } from "./render/Form";
import { Label, InvalidFeedback } from "./render/FormElement";

export * from "./Form";
export * from "./Input";
export * from "./render/InputRenderComponent";
export * from "./Select";
export * from "./render/SelectRenderComponent";

/* eslint-disable functional/prefer-readonly-type */

/**
 * A convenience function over the top of
 * `intersection`, `type`, `partial` and `readonly` from io-ts.
 * @see https://github.com/gcanti/io-ts#mixing-required-and-optional-props
 */
export function formCodec<R extends t.Props, O extends t.Props>(fields: {
  readonly required: R;
  readonly optional: O;
}): t.ReadonlyC<t.IntersectionC<[t.TypeC<R>, t.PartialC<O>]>>;
export function formCodec<R extends t.Props>(fields: {
  readonly required: R;
}): t.ReadonlyC<t.TypeC<R>>;
export function formCodec<O extends t.Props>(fields: {
  readonly optional: O;
}): t.ReadonlyC<t.PartialC<O>>;
export function formCodec<R extends t.Props, O extends t.Props>(
  fields:
    | {
        readonly required: R;
        readonly optional: O;
      }
    | {
        readonly required: R;
        readonly optional?: undefined;
      }
    | {
        readonly required?: undefined;
        readonly optional: O;
      },
):
  | t.ReadonlyC<t.IntersectionC<[t.TypeC<R>, t.PartialC<O>]>>
  | t.ReadonlyC<t.TypeC<R>>
  | t.ReadonlyC<t.PartialC<O>> {
  const { required, optional } = fields;

  return required !== undefined && optional !== undefined
    ? t.readonly(t.intersection([t.type(required), t.partial(optional)]))
    : required !== undefined
    ? t.readonly(t.type(required))
    : t.readonly(t.partial(optional as O));
}

export const elementsForCodecWithDefaults = <
  A extends ParsedFormData,
  O extends FormData
>(
  defaultFormProps: DefaultFormForCodecProps<A, O>,
  defaultInputProps: DefaultInputForCodecProps<A, O>,
  defaultSelectProps: DefaultSelectForCodecProps<A, O>,
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => (codec: Type<A, O>) => ({
  Form: formForCodec(codec, defaultFormProps),
  Input: inputForCodec<A, O>(defaultInputProps),
  Select: selectForCodec<A, O>(defaultSelectProps),
  // TODO: text areas https://github.com/oaf-project/oaf-react-final-form/issues/4
  // TODO: button, reset, file inputs ?
});

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const elementsForCodec = <A extends ParsedFormData, O extends FormData>(
  codec: Type<A, O>,
) =>
  elementsForCodecWithDefaults<A, O>(
    { renderFormError: FormError },
    {
      render: InputRenderComponent({
        renderLabel: Label,
        renderInvalidFeedback: InvalidFeedback,
      }),
    },
    {
      render: SelectRenderComponent({
        renderLabel: Label,
        renderInvalidFeedback: InvalidFeedback,
      }),
    },
  )(codec);
