import * as t from "io-ts";

export * from "./Form";
export * from "./Input";
export * from "./Select";

export function formCodec<R extends t.Props, O extends t.Props>(fields: {
  readonly required: R;
  readonly optional: O;
  // tslint:disable-next-line: readonly-array
}): t.ReadonlyC<t.IntersectionC<[t.TypeC<R>, t.PartialC<O>]>>;
export function formCodec<R extends t.Props>(fields: {
  readonly required: R;
}): t.ReadonlyC<t.TypeC<R>>;
export function formCodec<O extends t.Props>(optional: {
  readonly optional: O;
}): t.ReadonlyC<t.PartialC<O>>;
// tslint:disable-next-line: typedef
export function formCodec<R extends t.Props, O extends t.Props>(fields: {
  readonly required?: R;
  readonly optional?: O;
}) {
  const { required, optional } = fields;

  // tslint:disable: no-if-statement
  if (required !== undefined) {
    if (optional !== undefined) {
      return t.readonly(
        t.intersection([t.type(required), t.partial(optional)]),
      );
    } else {
      return t.readonly(t.type(required));
    }
  } else {
    if (optional !== undefined) {
      return t.readonly(t.partial(optional));
    } else {
      return t.undefined;
    }
  }
  // tslint:enable: no-if-statement
}
