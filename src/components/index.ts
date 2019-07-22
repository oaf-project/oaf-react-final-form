import { FieldMetaState } from "react-final-form";
import { FormData } from "../validation";

export type FormStateProps<A extends FormData> = {
  readonly initialValues: A;
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
