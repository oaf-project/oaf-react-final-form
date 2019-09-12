import { FORM_ERROR, Mutator } from "final-form";
import arrayMutators from "final-form-arrays";
import * as t from "io-ts";
import { axe, toHaveNoViolations } from "jest-axe";
import React from "react";
import ReactDOM from "react-dom";
import { FieldArray } from "react-final-form-arrays";
import {
  elementsForCodec,
  formCodec,
  Input as RawInput,
  SubmissionResponse,
} from ".";
import { NumberFromString, withMessage } from "../validation";

// tslint:disable: no-expression-statement no-duplicate-string

expect.extend(toHaveNoViolations);

// TODO https://github.com/Microsoft/tslint-microsoft-contrib/issues/409
// tslint:disable: react-a11y-role-has-required-aria-props

it("renders without crashing", async () => {
  // First, we define the form codec using io-ts.
  // See https://github.com/gcanti/io-ts#the-idea
  //
  // `formCodec` is just a convenience function over the top of
  // `intersection`, `type` and `partial` from io-ts.
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
    },
  });

  // We derive React components for our form elements from the form codec. This
  // gives us some type-safety benefits when rendering these form elements (below).
  const { Form, Input, Select } = elementsForCodec(codec);

  type FormData = t.TypeOf<typeof codec>;
  type RawFormData = t.OutputOf<typeof codec>;

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
        // potentially other mutators could be merged here
        // TODO https://github.com/final-form/final-form-arrays/pull/40
        ...((arrayMutators as unknown) as {
          readonly [key: string]: Mutator<RawFormData>;
        }),
      }}
    >
      <Input
        label="foo"
        labelProps={{ className: "some-label-class" }}
        formGroupProps={{ className: "some-form-group-class" }}
        feedbackProps={{ className: "some-feedback-class" }}
        name="foo"
        type="number"
        min={42}
        className="some-input-class"
        placeholder="Enter a number less than 42"
      />
      <Input label="bar" name="bar" type="text" required={true} />
      <Select label="baz" name="baz" options={selectOptions} />
      <Select label="qux" name="qux" multiple={true} options={selectOptions} />
      <FieldArray name="customers">
        {({ fields }) =>
          fields.map((name, index) => (
            <React.Fragment key={name}>
              <RawInput
                label="First Name"
                id={`customers-${index}-firstName`}
                name={`${name}.firstName`}
                type="text"
              />
              <RawInput
                label="Last Name"
                id={`customers-${index}-lastName`}
                name={`${name}.lastName`}
                type="text"
              />
            </React.Fragment>
          ))
        }
      </FieldArray>
    </Form>,
    div,
  );

  expect(div.innerHTML).toBe(
    '<form action="." novalidate=""><div class="some-form-group-class"><label class="some-label-class" for="foo">foo</label><input type="number" min="42" class="some-input-class" placeholder="Enter a number less than 42" id="foo" name="foo" aria-invalid="false" value="42"></div><div class="form-group"><label for="bar">bar</label><input required="" type="text" id="bar" name="bar" aria-invalid="false" class="form-control" value=""></div><div class="form-group"><label for="baz">baz</label><select id="baz" name="baz" class="form-control" aria-invalid="false"><option value=""></option><option value="first-option">first option</option><optgroup label="an opt group"><option value="second-option">second option</option></optgroup></select></div><div class="form-group"><label for="qux">qux</label><select multiple="" id="qux" name="qux" class="form-control" aria-invalid="false"><option value=""></option><option value="first-option">first option</option><optgroup label="an opt group"><option value="second-option">second option</option></optgroup></select></div><div class="form-group"><label for="customers-0-firstName">First Name</label><input type="text" id="customers-0-firstName" name="customers[0].firstName" aria-invalid="false" class="form-control" value="Jane"></div><div class="form-group"><label for="customers-0-lastName">Last Name</label><input type="text" id="customers-0-lastName" name="customers[0].lastName" aria-invalid="false" class="form-control" value="Doe"></div></form>',
  );
  expect(await axe(div)).toHaveNoViolations();

  ReactDOM.unmountComponentAtNode(div);
});
