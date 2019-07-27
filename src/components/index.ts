import * as t from "io-ts";

export * from "./Form";
export * from "./Input";
export * from "./Select";

export const formCodec = <R extends t.Props, O extends t.Props>(fields: {
  readonly required?: R;
  readonly optional?: O;
}) => {
  return t.readonly(
    t.intersection([
      t.type(fields.required || ({} as R)),
      t.partial(fields.optional || ({} as O)),
    ]),
  );
};
