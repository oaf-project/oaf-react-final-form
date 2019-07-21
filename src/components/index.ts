export type FormStateProps<A extends FormData> = {
  readonly initialValues: A;
};

// tslint:disable-next-line: readonly-array
export type FieldValue = undefined | string | string[];

export type FormData = {
  readonly [index in string]: FieldValue;
};
