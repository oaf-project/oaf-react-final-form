import * as t from "io-ts";
import { Type } from "io-ts";
import { FormData } from "./common";
import { formForCodec } from "./Form";
import { inputForCodec } from "./Input";
import { selectForCodec } from "./Select";

export * from "./Form";
export * from "./Input";
export * from "./InputRenderComponent";
export * from "./Select";
export * from "./SelectRenderComponent";

// tslint:disable: readonly-array

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

export const elementsForCodec = <A extends FormData, O extends FormData>(
  codec: Type<A, O>,
) => ({
  Form: formForCodec(codec),
  Input: inputForCodec<O>(),
  Select: selectForCodec<O>(),
  // TODO: checkbox, radio, text area
  // TODO: file inputs
});
