/* eslint-disable functional/functional-parameters */
import { FormApi } from "final-form";
import { fold } from "fp-ts/lib/Either";
import { Errors, Type, ValidationError } from "io-ts";
import { Selector } from "oaf-side-effects";
import React, { FormHTMLAttributes, PropsWithChildren } from "react";
import {
  Form as ReactFinalForm,
  FormProps as ReactFinalFormProps,
  AnyObject,
} from "react-final-form";
import { DeepReadonly } from "ts-essentials";
import { OmitStrict } from "type-zoo";
import { toValidationErrors } from "../validation";
import { FormData, ParsedFormData, ValidationErrors } from "./common";
import { focusInvalidFormDecorator } from "./decorators";
import { FormRenderProps } from "./render/Form";

export type SubmissionResponse<FD extends ParsedFormData> =
  | ValidationErrors<FD>
  | undefined
  | Promise<ValidationErrors<FD> | undefined>;

type PropsFromFinalFormConfig<FD extends FormData> = DeepReadonly<
  Pick<
    ReactFinalFormProps<FD>,
    | "keepDirtyOnReinitialize"
    | "destroyOnUnregister"
    | "validateOnBlur"
    | "debug"
    | "subscription"
    | "mutators"
  >
>;

type FocusInvalidElementProps = {
  readonly invalidElementSelector?: Selector;
  readonly elementWrapperSelector?: Selector;
  readonly smoothScroll?: boolean;
};

export type FormProps<
  A extends ParsedFormData,
  O extends FormData
> = FocusInvalidElementProps &
  PropsWithChildren<{}> &
  PropsFromFinalFormConfig<O> & {
    readonly onSubmit: (values: A, form: FormApi<O>) => SubmissionResponse<O>;
    readonly codec: Type<A, O>;
    // Initial values are always optional, even if non-optional in A
    // (i.e. even if the user will have to provide them to submit the form).
    readonly initialValues?: Partial<A>;
    // If an io-ts validation error occurs but doesn't have a message,
    // this function will be used as a fallback to get the message to
    // display to the user.
    readonly defaultErrorMessage?: (e: ValidationError) => string;
    // We pass along arbitrary form props.
    // TODO: should these be included on the FormProps type itself (as opposed to hidden inside `formProps` here) to match the way Input and Select work?
    readonly formProps?: OmitStrict<
      Readonly<FormHTMLAttributes<HTMLFormElement>>,
      "onSubmit"
    >;
    readonly children?:
      | ((props: FormRenderProps<O>) => React.ReactNode)
      | React.ReactNode;
    /**
     * Renders global errors (i.e. those errors that aren't associated with a specific form field) at the top of a form.
     */
    readonly renderFormError: (props: FormRenderProps<O>) => JSX.Element;
  };

export const Form = <A extends ParsedFormData, O extends FormData>(
  props: FormProps<A, O>,
): JSX.Element => {
  const formRef = React.useRef<HTMLFormElement | null>(null);

  // Focus the first invalid element after failed form submission.
  // See e.g. https://webaim.org/techniques/formvalidation/
  // Stick this in a ref to avoid "Warning: Form decorators should not change
  // from one render to the next as new values will be ignored"
  const focusDecorator = React.useRef(
    focusInvalidFormDecorator<O>(
      () => formRef.current,
      props.invalidElementSelector || "[aria-invalid=true]",
      props.elementWrapperSelector,
      // TODO https://github.com/oaf-project/oaf-side-effects/issues/18
      props.smoothScroll,
    ),
  );

  const initialValues: O | undefined =
    props.initialValues === undefined
      ? undefined
      : // `encode` will do the right thing here even when given a partial at runtime.
        props.codec.encode(props.initialValues as A);

  const errorMessage =
    props.defaultErrorMessage || ((): string => "This field is invalid.");

  // Better accessibility if we wait until blur to validate.
  // See e.g. https://developer.paciellogroup.com/blog/2019/02/required-attribute-requirements/
  const validateOnBlur =
    props.validateOnBlur !== undefined ? props.validateOnBlur : true;

  const onSubmit = (
    rawFormData: O,
    formApi: FormApi<O>,
  ): SubmissionResponse<O> => {
    return fold(
      (e: Errors) => toValidationErrors<O>(e, errorMessage),
      (a: A) => props.onSubmit(a, formApi),
    )(props.codec.decode(rawFormData));
  };

  const validate = (rawFormData: O): ValidationErrors<O> | undefined => {
    return fold(
      (e: Errors) => toValidationErrors<O>(e, errorMessage),
      () => undefined,
    )(props.codec.decode(rawFormData));
  };

  // TODO allow overriding form render component
  const render = (renderProps: FormRenderProps<O>): JSX.Element => {
    const handleSubmit = (
      event?: React.SyntheticEvent<HTMLFormElement>,
    ): Promise<AnyObject | undefined> | undefined => {
      // eslint-disable-next-line functional/no-conditional-statement
      if (validateOnBlur) {
        // Reset the same validate function as we set initially
        // for the side effect that it will re-run validation.
        // We need to re-run validation here because react-final-form
        // doesn't give us one last validation before submitting when
        // validateOnBlur is true.
        // See https://github.com/final-form/final-form/issues/213
        // eslint-disable-next-line functional/no-expression-statement
        renderProps.form.setConfig("validate", validate);
      }
      return renderProps.handleSubmit(event);
    };

    return (
      <form
        {...props.formProps}
        ref={formRef}
        onSubmit={handleSubmit}
        // Persuade iOS to do the right thing.
        // See https://stackoverflow.com/a/26287843/2476884
        action={props.formProps?.action ?? "."}
        // Better accessibility if we do our own inline validation.
        // See e.g. https://developer.paciellogroup.com/blog/2019/02/required-attribute-requirements/
        noValidate={props.formProps?.noValidate ?? true}
      >
        {props.renderFormError(renderProps)}

        {/* TODO: clean this up */}
        {typeof props.children === "function"
          ? // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            props.children(renderProps)
          : props.children}
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
      decorators={[focusDecorator.current]}
      validateOnBlur={validateOnBlur}
      mutators={props.mutators}
      subscription={props.subscription}
    />
  );
};

export type DefaultFormForCodecProps<
  A extends ParsedFormData,
  O extends FormData
> = Pick<
  FormProps<A, O>,
  "defaultErrorMessage" | "formProps" | "renderFormError"
> &
  FocusInvalidElementProps;

export type FormForCodecProps<
  A extends ParsedFormData,
  O extends FormData
> = OmitStrict<FormProps<A, O>, "renderFormError" | "codec"> &
  Partial<Pick<FormProps<A, O>, "renderFormError">>;

// TODO relate A to O so they are constrained to be structurally the same.
export const formForCodec = <A extends ParsedFormData, O extends FormData>(
  codec: Type<A, O>,
  defaultProps: DefaultFormForCodecProps<A, O>,
) => {
  // eslint-disable-next-line react/display-name
  return (props: FormForCodecProps<A, O>): JSX.Element => (
    <Form {...defaultProps} {...props} codec={codec} />
  );
};
