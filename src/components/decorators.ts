import { Decorator, FormState } from "final-form";
import { focusInvalidForm, Selector } from "oaf-side-effects";

/* eslint-disable functional/functional-parameters, functional/no-expression-statement */

const isInvalid = (state: FormState<unknown>): boolean =>
  state.hasValidationErrors || state.hasSubmitErrors;

/**
 * Focuses and scrolls into view the first invalid form element inside
 * a form after a failed form submission.
 *
 * See https://webaim.org/techniques/formvalidation/
 *
 * For smooth scrolling behavior you might want to use the smoothscroll
 * polyfill http://iamdustan.com/smoothscroll/
 *
 * If the user has indicated that they prefer reduced motion, the smoothScroll value will be ignored.
 *
 * For IE support you might want to use a closest() polyfill, such as
 * from https://developer.mozilla.org/en-US/docs/Web/API/Element/closest#Polyfill
 *
 * @param getFormElement a function that returns the form element to focus
 * @param formGroupSelector a CSS selector passed to the `closest()` method of an invalid form input that identifies the element
 *                          that contains both the form input and its label. This form group element will be scrolled into view
 *                          so that both the input and its label are visible.
 * @param smoothScroll true for smooth scrolling, false otherwise
 */
export const focusInvalidFormDecorator = <FormValues>(
  getFormElement: () => Element | null,
  formGroupSelector: Selector,
  invalidElementSelector: Selector | undefined,
  smoothScroll: boolean | undefined = undefined,
): Decorator<FormValues> => {
  return form => {
    const originalSubmit = form.submit;

    // eslint-disable-next-line functional/immutable-data
    form.submit = (): Promise<FormValues | undefined> | undefined => {
      const formElement = getFormElement();

      const result = originalSubmit.call(form);

      Promise.resolve(result).then(
        () => {
          // eslint-disable-next-line functional/no-conditional-statement
          if (formElement === null) {
            return;
          }

          // TODO: remove this setTimeout?
          setTimeout(() => {
            const formState = form.getState();

            const invalid = isInvalid(formState);

            const selector =
              invalidElementSelector ||
              Object.keys(formState.errors)
                .map(id => `#${id}`)
                .join(", ");

            // eslint-disable-next-line functional/no-conditional-statement
            if (invalid) {
              // TODO: remove this setTimeout?
              setTimeout(() => {
                focusInvalidForm(
                  formElement,
                  selector,
                  formGroupSelector,
                  smoothScroll,
                );
              }, 0);
            }
          }, 0);
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        () => {},
      );

      return result;
    };

    // eslint-disable-next-line functional/immutable-data
    return () => (form.submit = originalSubmit);
  };
};
