import {
  Config,
  FormApi,
  SubmissionErrors,
  ValidationErrors,
} from "final-form";
import { fold } from "fp-ts/lib/Either";
import { Errors, Type, ValidationError } from "io-ts";
import { Selector } from "oaf-side-effects";
import React, { FormHTMLAttributes, PropsWithChildren } from "react";
import { Form as ReactFinalForm, FormRenderProps } from "react-final-form";
import { RawFormData } from ".";
import { toValidationErrors } from "../validation";
import { focusInvalidFormDecorator } from "./focusInvalidFormDecorator";

type SubmissionResponse = ReturnType<Config<unknown>["onSubmit"]>;

type PropsFromFinalFormConfig<I extends RawFormData> = Pick<
  Config<unknown>,
  "keepDirtyOnReinitialize" | "destroyOnUnregister"
> &
  Pick<Config<I>, "debug">;

type FormHtmlProps = Pick<
  FormHTMLAttributes<HTMLFormElement>,
  "action" | "noValidate"
>;

type FocusInvalidElementProps = {
  readonly formGroupSelector?: Selector;
  readonly smoothScroll?: boolean;
};

export type FormProps<
  I extends RawFormData,
  A extends object = I
> = FocusInvalidElementProps &
  PropsWithChildren<{}> &
  PropsFromFinalFormConfig<I> &
  FormHtmlProps & {
    readonly onSubmit: (
      values: A,
      form: FormApi<I>,
      callback?: (errors?: SubmissionErrors) => void,
    ) => SubmissionResponse;
    readonly codec: Type<A, I>;
    // Initial values are always optional, even if non-optional in A
    // (i.e. even if the user will have to provide them to submit the form).
    readonly initialValues?: Partial<A>;
    // If an io-ts validation error occurs but doesn't have a message,
    // this function will be used as a fallback to get the message to
    // display to the user.
    readonly defaultErrorMessage?: (e: ValidationError) => string;
  };

export const Form = <I extends RawFormData, A extends object = I>(
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

  const errorMessage =
    props.defaultErrorMessage || (() => "This field is invalid.");

  const onSubmit = (
    i: I,
    form: FormApi<I>,
    callback?: (errors?: SubmissionErrors) => void,
  ): SubmissionResponse => {
    return fold(
      (e: Errors) => toValidationErrors(e, errorMessage),
      (a: A) => props.onSubmit(a, form, callback),
    )(props.codec.decode(i));
  };

  const validate = (i: I): ValidationErrors | undefined => {
    return fold(
      (e: Errors) => toValidationErrors(e, errorMessage),
      () => undefined,
    )(props.codec.decode(i));
  };

  const render = (renderProps: FormRenderProps<I>) => {
    const { action, noValidate } = props;
    return (
      <form
        ref={formRef}
        onSubmit={renderProps.handleSubmit}
        // Persuade iOS to do the right thing.
        // See https://stackoverflow.com/a/26287843/2476884
        action={action !== undefined ? action : "."}
        // Better accessibility if we do our own inline validation.
        // See e.g. https://developer.paciellogroup.com/blog/2019/02/required-attribute-requirements/
        noValidate={noValidate !== undefined ? noValidate : true}
      >
        {props.children}
      </form>
    );
  };

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
