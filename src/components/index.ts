import * as t from "io-ts";
import { Type } from "io-ts";
import { FormData, ParsedFormData } from "./common";
import { formForCodec, DefaultFormForCodecProps } from "./Form";
import { inputForCodec, DefaultInputForCodecProps } from "./Input";
import { selectForCodec, DefaultSelectForCodecProps } from "./Select";
import * as defaultRenderComponents from "./render/default";
import * as bootstrap4RenderComponents from "./render/bootstrap4";

export * from "./Form";
export * from "./Input";
export * from "./Select";

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
    : t.readonly(t.partial(optional as O)); // eslint-disable-line total-functions/no-unsafe-type-assertion, @typescript-eslint/consistent-type-assertions
}

export const elementsForCodecWithDefaults =
  <A extends ParsedFormData, O extends FormData>(
    defaultFormProps: DefaultFormForCodecProps<A, O>,
    defaultInputProps: DefaultInputForCodecProps<A, O>,
    defaultSelectProps: DefaultSelectForCodecProps<A, O>,
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  ) =>
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  (codec: Type<A, O>) => ({
    Form: formForCodec(codec, defaultFormProps),
    Input: inputForCodec<A, O>(defaultInputProps),
    Select: selectForCodec<A, O>(defaultSelectProps),
    // TODO: text areas https://github.com/oaf-project/oaf-react-final-form/issues/4
    // TODO: button, reset, file inputs ?
  });

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/explicit-module-boundary-types
export const bootstrap4Elements = <
  A extends ParsedFormData,
  O extends FormData,
>(
  codec: Type<A, O>,
) =>
  elementsForCodecWithDefaults<A, O>(
    { renderFormError: bootstrap4RenderComponents.FormError },
    {
      render: defaultRenderComponents.Input({
        renderLabel: bootstrap4RenderComponents.Label,
        renderInvalidFeedback: bootstrap4RenderComponents.InvalidFeedback,
        className: bootstrap4RenderComponents.className,
      }),
    },
    {
      render: defaultRenderComponents.Select({
        renderLabel: bootstrap4RenderComponents.Label,
        renderInvalidFeedback: bootstrap4RenderComponents.InvalidFeedback,
        className: bootstrap4RenderComponents.className,
      }),
    },
  )(codec);

// TODO default form elements https://github.com/oaf-project/oaf-react-final-form/issues/18
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const elementsForCodec = bootstrap4Elements;

// TODO add bootstrap 5 elements https://github.com/oaf-project/oaf-react-final-form/issues/496
