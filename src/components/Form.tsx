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
import { toSubmissionErrors, toValidationErrors } from "../validation";
import { FormData, RawFormData } from "./common";
import { focusInvalidFormDecorator } from "./decorators";

export type SubmissionResponse =
  | SubmissionErrors
  | undefined
  | Promise<SubmissionErrors | undefined>;

type PropsFromFinalFormConfig<I extends RawFormData> = Pick<
  Config<unknown>,
  "keepDirtyOnReinitialize" | "destroyOnUnregister" | "validateOnBlur"
> &
  Pick<Config<I>, "debug">;

type FormHtmlProps = Pick<
  FormHTMLAttributes<HTMLFormElement>,
  "id" | "action" | "noValidate"
>;

type FocusInvalidElementProps = {
  readonly formGroupSelector?: Selector;
  readonly smoothScroll?: boolean;
};

export type FormProps<
  A extends FormData,
  O extends RawFormData
> = FocusInvalidElementProps &
  PropsWithChildren<{}> &
  PropsFromFinalFormConfig<O> &
  FormHtmlProps & {
    readonly onSubmit: (values: A, form: FormApi<O>) => SubmissionResponse;
    readonly codec: Type<A, O>;
    // Initial values are always optional, even if non-optional in A
    // (i.e. even if the user will have to provide them to submit the form).
    readonly initialValues?: Partial<A>;
    // If an io-ts validation error occurs but doesn't have a message,
    // this function will be used as a fallback to get the message to
    // display to the user.
    readonly defaultErrorMessage?: (e: ValidationError) => string;
  };

export const Form = <A extends FormData, O extends RawFormData>(
  props: FormProps<A, O>,
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

  const initialValues: O | undefined =
    props.initialValues === undefined
      ? undefined
      : // `encode` will do the right thing here even when given a partial at runtime.
        props.codec.encode(props.initialValues as A);

  const errorMessage =
    props.defaultErrorMessage || (() => "This field is invalid.");

  const onSubmit = (rawFormData: O, form: FormApi<O>): SubmissionResponse => {
    return fold(
      (e: Errors) => toSubmissionErrors(e, errorMessage),
      (a: A) => props.onSubmit(a, form),
    )(props.codec.decode(rawFormData));
  };

  const validate = (rawFormData: O): ValidationErrors | undefined => {
    return fold(
      (e: Errors) => toValidationErrors(e, errorMessage),
      () => undefined,
    )(props.codec.decode(rawFormData));
  };

  const render = (renderProps: FormRenderProps<O>) => {
    const { action, noValidate } = props;
    return (
      <form
        id={props.id}
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
      validateOnBlur={
        props.validateOnBlur !== undefined ? props.validateOnBlur : true
      }
    />
  );
};

export const formForCodec = <A extends FormData, O extends RawFormData>(
  codec: Type<A, O>,
) => {
  return (props: Omit<FormProps<A, O>, "codec">) => {
    return <Form codec={codec} {...props} />;
  };
};
