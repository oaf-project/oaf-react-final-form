import * as t from "io-ts";
import React from "react";
import ReactDOM from "react-dom";
import { elementsForCodec, formCodec } from ".";
import { withMessage } from "../validation";

// tslint:disable: no-expression-statement object-literal-sort-keys

it("renders without crashing", () => {
  const codec = formCodec({
    required: { bar: withMessage(t.string, () => "Bar is required.") },
    optional: { foo: t.string, baz: t.string },
  });

  const { Form, Input, Select } = elementsForCodec(codec);

  type FormData = t.TypeOf<typeof codec>;

  const onSubmit = (_: FormData) => {
    return undefined;
  };

  const initialValues: Partial<FormData> = {
    foo: "foo",
  };

  const div = document.createElement("div");
  ReactDOM.render(
    <Form onSubmit={onSubmit} initialValues={initialValues}>
      <Input label="foo" name="foo" type="text" />
      <Input label="bar" name="bar" type="text" required={true} />
      <Select label="baz" name="baz" />
    </Form>,
    div,
  );
  ReactDOM.unmountComponentAtNode(div);
});
