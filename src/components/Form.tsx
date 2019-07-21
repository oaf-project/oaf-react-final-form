import React, { ReactNode } from "react";

import { Config } from "final-form";
import { Selector } from "oaf-side-effects/dist";
import { Form as ReactFinalForm, FormRenderProps } from "react-final-form";
import { FormData } from ".";
import { runValidators, ValidatorObject } from "../validation";
import { focusInvalidFormDecorator } from "./focusInvalidFormDecorator";

export type FormProps<A extends FormData> = Pick<
  Config<A>,
  // tslint:disable-next-line: max-union-size
  | "keepDirtyOnReinitialize"
  | "initialValues"
  | "onSubmit"
  | "destroyOnUnregister"
  | "debug"
> & {
  readonly id?: string;
  readonly validator?: ValidatorObject<A>;
  readonly children?: ReactNode;
  readonly formGroupSelector?: Selector;
  readonly smoothScroll?: boolean;
};

export const Form = <A extends FormData>(props: FormProps<A>) => {
  const formRef = React.useRef<HTMLFormElement | null>(null);

  // Stick this in a ref to avoid "Warning: Form decorators should not change
  // from one render to the next as new values will be ignored"
  const focusDecorator = React.useRef(
    focusInvalidFormDecorator(
      () => formRef.current,
      props.formGroupSelector || ".form-group",
      props.smoothScroll,
    ),
  );

  const validate = (values: A) =>
    props.validator !== undefined ? runValidators(props.validator, values) : {};

  const render = (renderProps: FormRenderProps<A>) => (
    <form
      ref={formRef}
      action="." // https://stackoverflow.com/a/26287843/2476884
      id={props.id}
      onSubmit={renderProps.handleSubmit}
      noValidate={true}
    >
      {props.children}
    </form>
  );

  return (
    <ReactFinalForm<A>
      onSubmit={props.onSubmit}
      validate={validate}
      render={render}
      initialValues={props.initialValues}
      keepDirtyOnReinitialize={props.keepDirtyOnReinitialize}
      destroyOnUnregister={props.destroyOnUnregister}
      debug={props.debug}
      // Focus the first invalid element after failed form submission.
      // See e.g. https://webaim.org/techniques/formvalidation/
      decorators={[focusDecorator.current]}
      // Better accessibility if we wait until blur to validate.
      // See e.g. https://developer.paciellogroup.com/blog/2019/02/required-attribute-requirements/
      validateOnBlur={true}
    />
  );
};
