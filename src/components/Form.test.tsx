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
  const codec = formCodec({
    required: { bar: withMessage(t.string, () => "Bar is required.") },
    optional: {
      foo: t.string,
      baz: t.readonlyArray(
        t.union([t.literal("first-option"), t.literal("second-option")]),
      ),
    },
  });

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
  ] as const;

  const div = document.createElement("div");
  ReactDOM.render(
    <Form onSubmit={onSubmit} initialValues={initialValues}>
      <Input label="foo" name="foo" type="text" />
      <Input label="bar" name="bar" type="text" required={true} />
      <Select label="baz" name="baz" multiple={true} options={selectOptions} />
    </Form>,
    div,
  );

  ReactDOM.unmountComponentAtNode(div);
});
