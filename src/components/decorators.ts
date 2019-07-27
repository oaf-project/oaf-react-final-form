import { Decorator, FormState } from "final-form";
import { focusInvalidForm, Selector } from "oaf-side-effects";

// tslint:disable-next-line: no-commented-code
// tslint:disable: no-object-mutation
// tslint:disable: no-expression-statement
// tslint:disable: no-empty
// tslint:disable: no-if-statement

const isInvalid = (state: FormState<object>): boolean =>
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
export const focusInvalidFormDecorator = (
  getFormElement: () => Element | null,
  formGroupSelector: Selector,
  smoothScroll: boolean | undefined = undefined,
): Decorator => {
  return form => {
    const originalSubmit = form.submit;

    form.submit = () => {
      const formElement = getFormElement();

      const result = originalSubmit.call(form);

      Promise.resolve(result).then(
        () => {
          if (formElement === null) {
            return;
          }

          // TODO: remove this setTimeout?
          setTimeout(() => {
            const formState = form.getState();

            const invalid = isInvalid(formState);

            // TODO: use invalidElementSelector if provided, falling back on this
            const selector = Object.keys(formState.errors)
              .map(id => `#${id}`)
              .join(", ");

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
        () => {},
      );

      return result;
    };

    return () => (form.submit = originalSubmit);
  };
};
