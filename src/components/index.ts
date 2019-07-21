import { FieldMetaState } from "react-final-form";

export type FormStateProps<A extends FormData> = {
  readonly initialValues: A;
};

// tslint:disable-next-line: readonly-array
export type FieldValue = undefined | string | string[];

export type FormData = {
  readonly [index in string]: FieldValue;
};

/**
 * Replace any with unknown for improved type-safety.
 */
export type SafeMeta<FV> = {
  readonly meta: Omit<FieldMetaState<FV>, "error" | "submitError"> & {
    readonly error?: unknown;
    readonly submitError?: unknown;
  };
};
