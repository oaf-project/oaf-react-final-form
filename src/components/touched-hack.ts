import { FieldRenderProps } from "react-final-form";

/**
 * @see https://github.com/final-form/react-final-form/issues/458
 */
export const touchedHack = <FieldValue, T extends HTMLElement>(
  renderProps: FieldRenderProps<FieldValue, T>,
  [touched, updateTouched]: readonly [
    boolean | undefined,
    // eslint-disable-next-line functional/no-return-void
    (a: boolean | undefined) => void,
  ],
  keepTouchedOnReinitialize: boolean | undefined,
): FieldRenderProps<FieldValue, T> => {
  // eslint-disable-next-line functional/no-conditional-statement
  if (keepTouchedOnReinitialize === false) {
    return renderProps;
  }

  // eslint-disable-next-line functional/no-conditional-statement
  if (renderProps.meta.touched) {
    // eslint-disable-next-line functional/no-expression-statement
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
