import {
  Config,
  FormApi,
  SubmissionErrors,
  ValidationErrors,
} from "final-form";
import { fold } from "fp-ts/lib/Either";
import { Errors, Type } from "io-ts";
import { Selector } from "oaf-side-effects";
import React, { ReactNode } from "react";
import { Form as ReactFinalForm, FormRenderProps } from "react-final-form";
import { FormData, toValidationErrors } from "../validation";
import { focusInvalidFormDecorator } from "./focusInvalidFormDecorator";

type SubmissionResponse = ReturnType<Config<unknown>["onSubmit"]>;

export type FormProps<I extends FormData, A extends object = I> = Pick<
  Config<A>,
  "keepDirtyOnReinitialize" | "destroyOnUnregister"
> &
  Pick<Config<I>, "debug"> & {
    readonly onSubmit: (
      values: A,
      form: FormApi<I>,
      callback?: (errors?: SubmissionErrors) => void,
    ) => SubmissionResponse;
    readonly id?: string;
    readonly codec: Type<A, I>;
    readonly children?: ReactNode;
    readonly formGroupSelector?: Selector;
    readonly smoothScroll?: boolean;
    // Initial values are always optional, even if non-optional in A
    // (i.e. even if the user will have to provide them to submit the form).
    readonly initialValues?: Partial<A>;
  };

export const Form = <I extends FormData, A extends object = I>(
  props: FormProps<I, A>,
) => {
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

  const initialValues: I | undefined =
    props.initialValues === undefined
      ? undefined
      : // `encode` will do the right thing here even when given a partial at runtime.
        props.codec.encode(props.initialValues as A);

  const onSubmit = (
    i: I,
    form: FormApi<I>,
    callback?: (errors?: SubmissionErrors) => void,
  ): SubmissionResponse => {
    return fold(
      (e: Errors) => toValidationErrors(e),
      (a: A) => props.onSubmit(a, form, callback),
    )(props.codec.decode(i));
  };

  const validate = (i: I): ValidationErrors | undefined => {
    return fold((e: Errors) => toValidationErrors(e), () => undefined)(
      props.codec.decode(i),
    );
  };

  const render = (renderProps: FormRenderProps<I>) => (
    <form
      ref={formRef}
      // Persuade iOS to do the right thing.
      // See https://stackoverflow.com/a/26287843/2476884
      action="."
      id={props.id}
      onSubmit={renderProps.handleSubmit}
      // Better accessibility if we do our own inline validation.
      // See e.g. https://developer.paciellogroup.com/blog/2019/02/required-attribute-requirements/
      noValidate={true}
    >
      {props.children}
    </form>
  );

  return (
    <ReactFinalForm
      onSubmit={onSubmit}
      validate={validate}
      render={render}
      initialValues={initialValues}
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
