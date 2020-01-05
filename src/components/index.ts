import * as t from "io-ts";
import { Type } from "io-ts";
import { FormData, ParsedFormData } from "./common";
import { formForCodec } from "./Form";
import { inputForCodec } from "./Input";
import { selectForCodec } from "./Select";

export * from "./Form";
export * from "./Input";
export * from "./render/InputRenderComponent";
export * from "./Select";
export * from "./render/SelectRenderComponent";

/* eslint-disable functional/prefer-readonly-type */

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

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const elementsForCodec = <A extends ParsedFormData, O extends FormData>(
  codec: Type<A, O>,
  // TODO allow some defaults to be specified here, for example render overrides, label props, invalid class name, valid class name, etc.
) => ({
  Form: formForCodec(codec),
  Input: inputForCodec<A, O>(),
  Select: selectForCodec<A, O>(),
  // TODO: text area
  // TODO: button, reset ?
  // TODO: file inputs ?
});
