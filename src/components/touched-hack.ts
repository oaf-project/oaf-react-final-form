import { FieldRenderProps } from "react-final-form";

// tslint:disable: bool-param-default no-if-statement no-expression-statement

/**
 * @see https://github.com/final-form/react-final-form/issues/458
 */
export const touchedHack = <FieldValue, T extends HTMLElement>(
  renderProps: FieldRenderProps<FieldValue, T>,
  [touched, updateTouched]: readonly [
    boolean | undefined,
    (a: boolean | undefined) => void,
  ],
  keepTouchedOnReinitialize: boolean | undefined,
): FieldRenderProps<FieldValue, T> => {
  if (keepTouchedOnReinitialize === false) {
    return renderProps;
  }

  if (renderProps.meta.touched) {
    updateTouched(renderProps.meta.touched);
  }

  return {
    ...renderProps,
    meta: {
      ...renderProps.meta,
      touched: renderProps.meta.touched || touched,
    },
  };
};
