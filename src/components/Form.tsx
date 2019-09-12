import { FormApi, Mutator } from "final-form";
import { fold } from "fp-ts/lib/Either";
import { Errors, Type, ValidationError } from "io-ts";
import { Selector } from "oaf-side-effects";
import React, { FormHTMLAttributes, PropsWithChildren } from "react";
import {
  Form as ReactFinalForm,
  FormProps as ReactFinalFormProps,
  FormRenderProps,
} from "react-final-form";
import { DeepReadonly } from "ts-essentials";
import { OmitStrict } from "type-zoo";
import { toValidationErrors } from "../validation";
import { FormData, ParsedFormData, ValidationErrors } from "./common";
import { focusInvalidFormDecorator } from "./decorators";

export type SubmissionResponse<FD extends ParsedFormData> =
  | ValidationErrors<FD>
  | undefined
  | Promise<ValidationErrors<FD> | undefined>;

type PropsFromFinalFormConfig<FD extends FormData> = DeepReadonly<
  Pick<
    ReactFinalFormProps<FD>,
    // tslint:disable-next-line: max-union-size
    | "keepDirtyOnReinitialize"
    | "destroyOnUnregister"
    | "validateOnBlur"
    | "debug"
    | "subscription"
  >
> & {
  // TODO https://github.com/final-form/final-form/pull/275
  readonly mutators?: { readonly [key: string]: Mutator<FD> };
};

type FocusInvalidElementProps = {
  readonly formGroupSelector?: Selector;
  readonly invalidElementSelector?: Selector;
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
    readonly formProps?: OmitStrict<
      Readonly<FormHTMLAttributes<HTMLFormElement>>,
      "onSubmit"
    >;
  };

export const Form = <A extends ParsedFormData, O extends FormData>(
  props: FormProps<A, O>,
) => {
  const formRef = React.useRef<HTMLFormElement | null>(null);

  // Stick this in a ref to avoid "Warning: Form decorators should not change
  // from one render to the next as new values will be ignored"
  const focusDecorator = React.useRef(
    focusInvalidFormDecorator(
      () => formRef.current,
      props.formGroupSelector || ".form-group",
      props.invalidElementSelector || "[aria-invalid=true], [role=alert]",
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

  // Better accessibility if we wait until blur to validate.
  // See e.g. https://developer.paciellogroup.com/blog/2019/02/required-attribute-requirements/
  const validateOnBlur =
    props.validateOnBlur !== undefined ? props.validateOnBlur : true;

  const onSubmit = (
    rawFormData: O,
    form: FormApi<O>,
  ): SubmissionResponse<O> => {
    return fold(
      (e: Errors) => toValidationErrors<O>(e, errorMessage),
      (a: A) => props.onSubmit(a, form),
    )(props.codec.decode(rawFormData));
  };

  const validate = (rawFormData: O): ValidationErrors<O> | undefined => {
    return fold(
      (e: Errors) => toValidationErrors<O>(e, errorMessage),
      () => undefined,
    )(props.codec.decode(rawFormData));
  };

  /**
   * Replace any with string for improved type-safety.
   * io-ts error messages are strings, so we can get away
   * with this here.
   */
  type RenderProps = OmitStrict<FormRenderProps<O>, "error" | "submitError"> & {
    readonly error?: string;
    readonly submitError?: string;
  };

  // TODO allow overriding form render component
  const render = (renderProps: RenderProps): JSX.Element => {
    const { action, noValidate } = {
      // Persuade iOS to do the right thing.
      // See https://stackoverflow.com/a/26287843/2476884
      action: ".",
      // Better accessibility if we do our own inline validation.
      // See e.g. https://developer.paciellogroup.com/blog/2019/02/required-attribute-requirements/
      noValidate: true,
      ...props.formProps,
    };

    const handleSubmit = (event?: React.SyntheticEvent<HTMLFormElement>) => {
      // tslint:disable-next-line: no-if-statement
      if (validateOnBlur) {
        // Reset the same validate function as we set initially
        // for the side effect that it will re-run validation.
        // We need to re-run validation here because react-final-form
        // doesn't give us one last validation before submitting when
        // validateOnBlur is true.
        // See https://github.com/final-form/final-form/issues/213
        // tslint:disable-next-line: no-expression-statement
        renderProps.form.setConfig("validate", validate);
      }
      return renderProps.handleSubmit(event);
    };

    const formError = renderProps.error || renderProps.submitError;

    return (
      <form
        {...props.formProps}
        ref={formRef}
        onSubmit={handleSubmit}
        action={action}
        noValidate={noValidate}
      >
        {/* TODO allow overriding of form error render component */}
        {formError && (
          <div className="alert alert-danger" role="alert">
            {formError}
          </div>
        )}
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
      validateOnBlur={validateOnBlur}
      // TODO https://github.com/final-form/final-form/pull/275
      mutators={(props.mutators as unknown) as ReactFinalFormProps["mutators"]}
      subscription={props.subscription}
    />
  );
};

// TODO relate A to O so they are constrained to be structurally the same.
export const formForCodec = <A extends ParsedFormData, O extends FormData>(
  codec: Type<A, O>,
) => {
  return (props: OmitStrict<FormProps<A, O>, "codec">) => {
    return <Form codec={codec} {...props} />;
  };
};
