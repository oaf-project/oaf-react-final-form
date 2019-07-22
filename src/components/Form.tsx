import {
  Config,
  FormApi,
  SubmissionErrors,
  ValidationErrors,
} from "final-form";
import { isRight } from "fp-ts/lib/Either";
import { Type } from "io-ts";
import { Selector } from "oaf-side-effects/dist";
import React, { ReactNode } from "react";
import { Form as ReactFinalForm, FormRenderProps } from "react-final-form";
import { FormData, toValidationErrors } from "../validation";
import { focusInvalidFormDecorator } from "./focusInvalidFormDecorator";

// tslint:disable: no-if-statement no-expression-statement max-union-size

export type FormProps<I extends FormData, A extends object = I> = Pick<
  Config<A>,
  "keepDirtyOnReinitialize" | "initialValues" | "destroyOnUnregister"
> &
  Pick<Config<I>, "debug"> & {
    readonly onSubmit: (
      values: A,
      form: FormApi<I>,
      callback?: (errors?: SubmissionErrors) => void,
    ) =>
      | SubmissionErrors
      | Promise<SubmissionErrors | undefined>
      | undefined
      | void;
    readonly id?: string;
    readonly codec: Type<A, I>;
    readonly children?: ReactNode;
    readonly formGroupSelector?: Selector;
    readonly smoothScroll?: boolean;
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

  const initialValues =
    props.initialValues === undefined
      ? undefined
      : props.codec.encode(props.initialValues);

  const onSubmit = (
    raw: I,
    form: FormApi<I>,
    callback?: (errors?: SubmissionErrors) => void,
  ) => {
    const a = props.codec.decode(raw);

    if (isRight(a)) {
      props.onSubmit(a.right, form, callback);
    } else {
      // tslint:disable-next-line: no-console
      console.error(a.left);
    }
  };

  const validate = (i: I): ValidationErrors | undefined => {
    const a = props.codec.decode(i);

    if (isRight(a)) {
      return undefined;
    } else {
      return toValidationErrors(a.left);
    }
  };

  const render = (renderProps: FormRenderProps<I>) => (
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
    <ReactFinalForm<I>
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
