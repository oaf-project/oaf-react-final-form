import { FORM_ERROR } from "final-form";
import arrayMutators from "final-form-arrays"; // type-coverage:ignore-line
import * as t from "io-ts";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import ReactDOM from "react-dom";
import { FieldArray } from "react-final-form-arrays";
import { elementsForCodec, SubmissionResponse, formCodec } from ".";
import { withMessage, NumberFromString } from "../validation";

/* eslint-disable sonarjs/no-duplicate-string, no-restricted-globals, @typescript-eslint/no-unused-vars, functional/functional-parameters, functional/no-expression-statement */

expect.extend(toHaveNoViolations);

beforeEach(() => {
  // Clear previous test's DOM.
  // eslint-disable-next-line functional/immutable-data
  window.document.body.innerHTML = "";
});

it("renders a simple example", async () => {
  // First, we define the form codec using io-ts.
  // See https://github.com/gcanti/io-ts#the-idea
  //
  // `formCodec` is just a convenience function over the top of
  // `intersection`, `type`, `partial` and `readonly` from io-ts.
  // See https://github.com/gcanti/io-ts#mixing-required-and-optional-props
  const codec = formCodec({
    optional: {
      foo: t.string,
    },
  });

  // We derive React components for our form elements from the form codec. This
  // gives us some type-safety benefits when rendering these form elements (below).
  const { Form, Input } = elementsForCodec(codec);

  type FormData = t.TypeOf<typeof codec>;

  const onSubmit = (_: FormData): SubmissionResponse<FormData> => {
    // Here we are guaranteed that `formData` has been parsed by our form codec.
    // Do something with the submitted form data.
    // We can return submission errors here if necessary.
    return undefined;
  };

  const form = (
    <Form onSubmit={onSubmit}>
      {/*
        The `name` attr must be one of the values from the form codec.
        The `type` and `required` attrs must be compatible with the corresponding property from the form codec.
      */}
      <Input label="foo" name="foo" type="text" />
    </Form>
  );

  const div = document.createElement("div");
  ReactDOM.render(form, div);

  expect(await axe(div)).toHaveNoViolations();

  expect(div.innerHTML).toBe(
    '<form action="." novalidate=""><label for="foo">foo</label><input type="text" id="foo" name="foo" aria-invalid="false" class="form-control" value=""></form>',
  );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  div.querySelector("form")!.submit();

  // HACK: give react a chance to render.
  await new Promise(resolve => setTimeout(() => resolve()));
  await new Promise(resolve => setTimeout(() => resolve()));

  expect(await axe(div)).toHaveNoViolations();

  expect(div.innerHTML).toBe(
    '<form action="." novalidate=""><label for="foo">foo</label><input type="text" id="foo" name="foo" aria-invalid="false" class="form-control" value=""></form>',
  );

  ReactDOM.unmountComponentAtNode(div);
});

it("renders field-specific submission errors", async () => {
  const codec = formCodec({
    optional: {
      foo: t.string,
    },
  });

  // We derive React components for our form elements from the form codec. This
  // gives us some type-safety benefits when rendering these form elements (below).
  const { Form, Input } = elementsForCodec(codec);

  type FormData = t.TypeOf<typeof codec>;

  const onSubmit = (): SubmissionResponse<FormData> => {
    return {
      foo: "Foo is invalid",
    };
  };

  const form = (
    <Form onSubmit={onSubmit}>
      <Input label="foo" name="foo" type="text" />
    </Form>
  );

  const div = document.createElement("div");
  ReactDOM.render(form, div);

  expect(await axe(div)).toHaveNoViolations();

  expect(div.innerHTML).toBe(
    '<form action="." novalidate=""><label for="foo">foo</label><input type="text" id="foo" name="foo" aria-invalid="false" class="form-control" value=""></form>',
  );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  div.querySelector("form")!.submit();

  // HACK: give react a chance to render.
  await new Promise(resolve => setTimeout(() => resolve()));
  await new Promise(resolve => setTimeout(() => resolve()));

  expect(await axe(div)).toHaveNoViolations();

  expect(div.innerHTML).toBe(
    '<form action="." novalidate=""><label for="foo">foo</label><input type="text" id="foo" name="foo" aria-invalid="true" class="form-control is-invalid" value="" aria-describedby="foo-feedback" tabindex="-1"><div class="invalid-feedback" id="foo-feedback">Foo is invalid</div></form>',
  );

  // Expect the invalid input to have received keyboard focus.
  expect(document.activeElement).toBe(document.querySelector("#foo"));

  ReactDOM.unmountComponentAtNode(div);
});

it("renders global submission errors", async () => {
  const codec = formCodec({
    optional: {
      foo: t.string,
    },
  });

  // We derive React components for our form elements from the form codec. This
  // gives us some type-safety benefits when rendering these form elements (below).
  const { Form, Input } = elementsForCodec(codec);

  type FormData = t.TypeOf<typeof codec>;

  const onSubmit = (): SubmissionResponse<FormData> => {
    return {
      [FORM_ERROR]: "Form submission failed",
    };
  };

  const form = (
    <Form onSubmit={onSubmit}>
      <Input label="foo" name="foo" type="text" />
    </Form>
  );

  const div = document.createElement("div");
  ReactDOM.render(form, div);

  expect(await axe(div)).toHaveNoViolations();

  expect(div.innerHTML).toBe(
    '<form action="." novalidate=""><label for="foo">foo</label><input type="text" id="foo" name="foo" aria-invalid="false" class="form-control" value=""></form>',
  );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  div.querySelector("form")!.submit();

  // HACK: give react a chance to render.
  await new Promise(resolve => setTimeout(() => resolve()));
  await new Promise(resolve => setTimeout(() => resolve()));

  // Hack: give focus a chance to update.
  await new Promise(resolve => setTimeout(() => resolve()));

  expect(await axe(div)).toHaveNoViolations();

  expect(div.innerHTML).toBe(
    '<form action="." novalidate=""><div class="alert alert-danger" role="alert" tabindex="-1">Form submission failed</div><label for="foo">foo</label><input type="text" id="foo" name="foo" aria-invalid="false" class="form-control is-valid" value=""></form>',
  );

  // Expect the global error to have received keyboard focus.
  expect(document.activeElement).toBe(document.querySelector("[role=alert]"));

  ReactDOM.unmountComponentAtNode(div);
});

// eslint-disable-next-line jest/no-test-prefixes, jest/no-disabled-tests
it("renders default validation error", async () => {
  const codec = formCodec({
    required: {
      foo: t.string,
    },
  });

  const { Form, Input } = elementsForCodec(codec);

  const div = document.createElement("div");
  ReactDOM.render(
    <Form onSubmit={(): undefined => undefined}>
      <Input label="foo" name="foo" type="text" required={true} />
    </Form>,
    div,
  );

  expect(div.innerHTML).toBe(
    '<form action="." novalidate=""><label for="foo">foo</label><input required="" type="text" id="foo" name="foo" aria-invalid="false" class="form-control" value=""></form>',
  );
  expect(await axe(div)).toHaveNoViolations();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  div.querySelector("form")!.submit();

  // HACK: give react a chance to render.
  await new Promise(resolve => setTimeout(() => resolve()));
  await new Promise(resolve => setTimeout(() => resolve()));

  // Hack: give focus a chance to update.
  await new Promise(resolve => setTimeout(() => resolve()));

  expect(div.innerHTML).toBe(
    '<form action="." novalidate=""><label for="foo">foo</label><input required="" type="text" id="foo" name="foo" aria-invalid="true" class="form-control is-invalid" value="" aria-describedby="foo-feedback" tabindex="-1"><div class="invalid-feedback" id="foo-feedback">This field is invalid.</div></form>',
  );

  // Expect the invalid input to have received keyboard focus.
  expect(document.activeElement).toBe(document.querySelector("#foo"));

  expect(await axe(div)).toHaveNoViolations();

  ReactDOM.unmountComponentAtNode(div);
});

it("renders custom validation error", async () => {
  const codec = formCodec({
    required: {
      foo: withMessage(t.string, () => "Foo is required"),
    },
  });

  const { Form, Input } = elementsForCodec(codec);

  const div = document.createElement("div");
  ReactDOM.render(
    <Form onSubmit={(): undefined => undefined}>
      <Input label="foo" name="foo" type="text" required={true} />
    </Form>,
    div,
  );

  expect(div.innerHTML).toBe(
    '<form action="." novalidate=""><label for="foo">foo</label><input required="" type="text" id="foo" name="foo" aria-invalid="false" class="form-control" value=""></form>',
  );
  expect(await axe(div)).toHaveNoViolations();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  div.querySelector("form")!.submit();

  // HACK: give react a chance to render.
  await new Promise(resolve => setTimeout(() => resolve()));
  await new Promise(resolve => setTimeout(() => resolve()));

  expect(div.innerHTML).toBe(
    '<form action="." novalidate=""><label for="foo">foo</label><input required="" type="text" id="foo" name="foo" aria-invalid="true" class="form-control is-invalid" value="" aria-describedby="foo-feedback"><div class="invalid-feedback" id="foo-feedback">Foo is required</div></form>',
  );

  expect(await axe(div)).toHaveNoViolations();

  // Expect the invalid input to have received keyboard focus.
  expect(document.activeElement).toBe(document.querySelector("#foo"));

  ReactDOM.unmountComponentAtNode(div);
});

it("renders multiple validation errors", async () => {
  const codec = formCodec({
    required: {
      foo: t.string,
      bar: withMessage(t.string, () => "Bar is required"),
    },
  });

  const { Form, Input } = elementsForCodec(codec);

  const div = document.createElement("div");
  ReactDOM.render(
    <Form onSubmit={(): undefined => undefined}>
      <Input label="foo" name="foo" type="text" required={true} />
      <Input label="bar" name="bar" type="text" required={true} />
    </Form>,
    div,
  );

  expect(div.innerHTML).toBe(
    '<form action="." novalidate=""><label for="foo">foo</label><input required="" type="text" id="foo" name="foo" aria-invalid="false" class="form-control" value=""><label for="bar">bar</label><input required="" type="text" id="bar" name="bar" aria-invalid="false" class="form-control" value=""></form>',
  );
  expect(await axe(div)).toHaveNoViolations();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  div.querySelector("form")!.submit();

  // HACK: give react a chance to render.
  await new Promise(resolve => setTimeout(() => resolve()));
  await new Promise(resolve => setTimeout(() => resolve()));

  expect(div.innerHTML).toBe(
    '<form action="." novalidate=""><label for="foo">foo</label><input required="" type="text" id="foo" name="foo" aria-invalid="true" class="form-control is-invalid" value="" aria-describedby="foo-feedback"><div class="invalid-feedback" id="foo-feedback">This field is invalid.</div><label for="bar">bar</label><input required="" type="text" id="bar" name="bar" aria-invalid="true" class="form-control is-invalid" value="" aria-describedby="bar-feedback"><div class="invalid-feedback" id="bar-feedback">Bar is required</div></form>',
  );

  expect(await axe(div)).toHaveNoViolations();

  ReactDOM.unmountComponentAtNode(div);
});

it("supports FieldArray", async () => {
  // First, we define the form codec using io-ts.
  // See https://github.com/gcanti/io-ts#the-idea
  //
  // `formCodec` is just a convenience function over the top of
  // `intersection`, `type`, `partial` and `readonly` from io-ts.
  // See https://github.com/gcanti/io-ts#mixing-required-and-optional-props
  //
  // `withMessage` comes from io-ts-types. We use it to add custom validation messages.
  // See https://gcanti.github.io/io-ts-types/modules/withMessage.ts.html
  const codec = formCodec({
    required: { bar: withMessage(t.string, () => "Bar is required.") },
    optional: {
      foo: NumberFromString,
      baz: t.union([t.literal("first-option"), t.literal("second-option")]),
      qux: t.array(
        t.union([t.literal("first-option"), t.literal("second-option")]),
      ),
      customers: t.readonlyArray(
        t.readonly(
          t.type({
            firstName: t.string,
            lastName: t.string,
          }),
        ),
      ),
      radioOption: t.union([
        t.literal("radio-option-one"),
        t.literal("radio-option-two"),
      ]),
    },
  });

  // We derive React components for our form elements from the form codec. This
  // gives us some type-safety benefits when rendering these form elements (below).
  const { Form, Input, Select } = elementsForCodec(codec);

  type FormData = t.TypeOf<typeof codec>;

  const onSubmit = (_: FormData): SubmissionResponse<FormData> => {
    return {
      [FORM_ERROR]: "global form error",
      customers: [{ firstName: "asdf" }],
    };
  };

  const initialValues: Partial<FormData> = {
    foo: 42,
    baz: "first-option",
    qux: ["second-option"],
    customers: [{ firstName: "Jane", lastName: "Doe" }],
    radioOption: "radio-option-one",
  };

  const selectOptions = [
    { key: "1", value: "", label: "" },
    { key: "2", value: "first-option", label: "first option" },
    {
      key: "3",
      label: "an opt group",
      options: [
        {
          key: "1",
          value: "second-option",
          label: "second option",
        },
      ],
    },
  ] as const;

  const div = document.createElement("div");
  ReactDOM.render(
    <Form
      onSubmit={onSubmit}
      initialValues={initialValues}
      // https://github.com/final-form/react-final-form-arrays#usage
      mutators={{
        ...arrayMutators, // type-coverage:ignore-line
      }}
    >
      {(): JSX.Element => (
        <>
          <Input
            label="foo"
            name="foo"
            type="number"
            min={42}
            className="some-input-class"
            placeholder="Enter a number less than 42"
          />
          <Input label="bar" name="bar" type="text" required={true} />
          <Select
            className="some-select-class"
            label="baz"
            name="baz"
            options={selectOptions}
          />
          <Select
            label="qux"
            name="qux"
            multiple={true}
            options={selectOptions}
          />
          <fieldset>
            <legend>Radio Button Example</legend>
            <Input
              label="radio-option-one"
              name="radioOption"
              type="radio"
              value="radio-option-one"
            />
            <Input
              label="radio-option-two"
              name="radioOption"
              type="radio"
              value="radio-option-two"
              disabled={true}
            />
          </fieldset>
          <FieldArray name="customers">
            {({ fields }): readonly JSX.Element[] =>
              fields.map((name, index) => (
                <React.Fragment key={name}>
                  <Input<any>
                    label="First Name"
                    id={`customers-${index}-firstName`}
                    name={`${name}.firstName`}
                    type="text"
                  />
                  <Input<any>
                    label="Last Name"
                    id={`customers-${index}-lastName`}
                    name={`${name}.lastName`}
                    type="text"
                  />
                </React.Fragment>
              ))
            }
          </FieldArray>
        </>
      )}
    </Form>,
    div,
  );

  expect(div.innerHTML).toBe(
    '<form action="." novalidate=""><label for="foo">foo</label><input type="number" min="42" class="some-input-class" placeholder="Enter a number less than 42" id="foo" name="foo" aria-invalid="false" value="42"><label for="bar">bar</label><input required="" type="text" id="bar" name="bar" aria-invalid="false" class="form-control" value=""><label for="baz">baz</label><select class="some-select-class" id="baz" name="baz" aria-invalid="false"><option value=""></option><option value="first-option">first option</option><optgroup label="an opt group"><option value="second-option">second option</option></optgroup></select><label for="qux">qux</label><select multiple="" id="qux" name="qux" class="form-control" aria-invalid="false"><option value=""></option><option value="first-option">first option</option><optgroup label="an opt group"><option value="second-option">second option</option></optgroup></select><fieldset><legend>Radio Button Example</legend><input type="radio" id="radioOption-radio-option-one" name="radioOption" aria-invalid="false" class="form-check-input" value="radio-option-one" checked=""><label class="form-check-label" for="radioOption-radio-option-one">radio-option-one</label><input type="radio" disabled="" id="radioOption-radio-option-two" name="radioOption" aria-invalid="false" class="form-check-input" value="radio-option-two"><label class="form-check-label" for="radioOption-radio-option-two">radio-option-two</label></fieldset><label for="customers-0-firstName">First Name</label><input type="text" id="customers-0-firstName" name="customers[0].firstName" aria-invalid="false" class="form-control" value="Jane"><label for="customers-0-lastName">Last Name</label><input type="text" id="customers-0-lastName" name="customers[0].lastName" aria-invalid="false" class="form-control" value="Doe"></form>',
  );
  expect(await axe(div)).toHaveNoViolations();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  div.querySelector("form")!.submit();

  // HACK: give react a chance to render.
  await new Promise(resolve => setTimeout(() => resolve()));
  await new Promise(resolve => setTimeout(() => resolve()));

  expect(div.innerHTML).toBe(
    '<form action="." novalidate=""><label for="foo">foo</label><input type="number" min="42" class="some-input-class is-valid" placeholder="Enter a number less than 42" id="foo" name="foo" aria-invalid="false" value="42"><label for="bar">bar</label><input required="" type="text" id="bar" name="bar" aria-invalid="true" class="form-control is-invalid" value="" aria-describedby="bar-feedback"><div class="invalid-feedback" id="bar-feedback">Bar is required.</div><label for="baz">baz</label><select class="some-select-class is-valid" id="baz" name="baz" aria-invalid="false"><option value=""></option><option value="first-option">first option</option><optgroup label="an opt group"><option value="second-option">second option</option></optgroup></select><label for="qux">qux</label><select multiple="" id="qux" name="qux" class="form-control is-valid" aria-invalid="false"><option value=""></option><option value="first-option">first option</option><optgroup label="an opt group"><option value="second-option">second option</option></optgroup></select><fieldset><legend>Radio Button Example</legend><input type="radio" id="radioOption-radio-option-one" name="radioOption" aria-invalid="false" class="form-check-input is-valid" value="radio-option-one" checked=""><label class="form-check-label" for="radioOption-radio-option-one">radio-option-one</label><input type="radio" disabled="" id="radioOption-radio-option-two" name="radioOption" aria-invalid="false" class="form-check-input is-valid" value="radio-option-two"><label class="form-check-label" for="radioOption-radio-option-two">radio-option-two</label></fieldset><label for="customers-0-firstName">First Name</label><input type="text" id="customers-0-firstName" name="customers[0].firstName" aria-invalid="false" class="form-control is-valid" value="Jane"><label for="customers-0-lastName">Last Name</label><input type="text" id="customers-0-lastName" name="customers[0].lastName" aria-invalid="false" class="form-control is-valid" value="Doe"></form>',
  );

  expect(await axe(div)).toHaveNoViolations();

  ReactDOM.unmountComponentAtNode(div);
});

it("renders validation error when codec contains mix of required and optional fields", async () => {
  const codec = formCodec({
    required: { bar: t.string },
    optional: { foo: t.string },
  });

  const { Form, Input } = elementsForCodec(codec);

  type FormData = t.TypeOf<typeof codec>;

  const onSubmit = (_: FormData): SubmissionResponse<FormData> => undefined;

  const div = document.createElement("div");
  ReactDOM.render(
    <Form onSubmit={onSubmit}>
      <Input label="bar" name="bar" type="text" required={true} />
    </Form>,
    div,
  );

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  div.querySelector("form")!.submit();

  // HACK: give react a chance to render.
  await new Promise(resolve => setTimeout(() => resolve()));
  await new Promise(resolve => setTimeout(() => resolve()));

  expect(div.innerHTML).toBe(
    '<form action="." novalidate=""><label for="bar">bar</label><input required="" type="text" id="bar" name="bar" aria-invalid="true" class="form-control is-invalid" value="" aria-describedby="bar-feedback"><div class="invalid-feedback" id="bar-feedback">This field is invalid.</div></form>',
  );

  expect(await axe(div)).toHaveNoViolations();

  ReactDOM.unmountComponentAtNode(div);
});
