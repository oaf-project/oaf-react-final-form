import * as t from "io-ts";
import React from "react";
import ReactDOM from "react-dom";
import {
  elementsForCodec,
  formCodec,
  SelectOptions,
  SubmissionResponse,
} from ".";
import { withMessage } from "../validation";

// tslint:disable: no-expression-statement no-duplicate-string

// TODO https://github.com/Microsoft/tslint-microsoft-contrib/issues/409
// tslint:disable: react-a11y-role-has-required-aria-props

it("renders without crashing", () => {
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
      foo: t.string,
      baz: t.readonlyArray(
        t.union([t.literal("first-option"), t.literal("second-option")]),
      ),
    },
  });

  // We derive React components for our form elements from the form codec. This
  // gives us some type-safety benefits when rendering these form elements (below).
  const { Form, Input, Select } = elementsForCodec(codec);

  type FormData = t.TypeOf<typeof codec>;

  const onSubmit = (_: FormData): SubmissionResponse<FormData> => {
    return undefined;
  };

  const initialValues: Partial<FormData> = {
    foo: "foo",
  };

  const selectOptions: SelectOptions<FormData["baz"]> = [
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
  ];

  const div = document.createElement("div");
  ReactDOM.render(
    <Form onSubmit={onSubmit} initialValues={initialValues}>
      <Input label="foo" name="foo" type="text" />
      <Input label="bar" name="bar" type="text" required={true} />
      <Select label="baz" name="baz" multiple={true} options={selectOptions} />
    </Form>,
    div,
  );

  expect(div.innerHTML).toBe(
    '<form action="." novalidate=""><div class="form-group"><label for="foo">foo</label><input id="foo" name="foo" class="form-control" type="text" aria-invalid="false" value="foo"></div><div class="form-group"><label for="bar">bar</label><input id="bar" name="bar" class="form-control" type="text" aria-invalid="false" required="" aria-required="true" value=""></div><div class="form-group"><label for="baz">baz</label><select multiple="" id="baz" name="baz" class="form-control" aria-invalid="false"><option value=""></option><option value="first-option">first option</option><optgroup label="an opt group"><option value="second-option">second option</option></optgroup></select></div></form>',
  );

  ReactDOM.unmountComponentAtNode(div);
});
