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

export type FormProps<RawFormData extends FormData, ParsedFormData> = Pick<
  Config<ParsedFormData>,
  "keepDirtyOnReinitialize" | "initialValues" | "destroyOnUnregister"
> &
  Pick<Config<RawFormData>, "debug"> & {
    readonly onSubmit: (
      values: ParsedFormData,
      form: FormApi<RawFormData>,
      callback?: (errors?: SubmissionErrors) => void,
    ) =>
      | SubmissionErrors
      | Promise<SubmissionErrors | undefined>
      | undefined
      | void;
    readonly id?: string;
    readonly codec: Type<ParsedFormData, RawFormData>;
    readonly children?: ReactNode;
    readonly formGroupSelector?: Selector;
    readonly smoothScroll?: boolean;
  };

export const Form = <
  RawFormData extends FormData,
  ParsedFormData = RawFormData
>(
  props: FormProps<RawFormData, ParsedFormData>,
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
    raw: RawFormData,
    form: FormApi<RawFormData>,
    callback?: (errors?: SubmissionErrors) => void,
  ) => {
    const parsed = props.codec.decode(raw);

    if (isRight(parsed)) {
      props.onSubmit(parsed.right, form, callback);
    } else {
      // tslint:disable-next-line: no-console
      console.error(parsed.left);
    }
  };

  const validate = (raw: RawFormData): ValidationErrors | undefined => {
    const parsed = props.codec.decode(raw);

    if (isRight(parsed)) {
      return undefined;
    } else {
      return toValidationErrors(parsed.left);
    }
  };

  const render = (renderProps: FormRenderProps<RawFormData>) => (
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
    <ReactFinalForm<RawFormData>
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
