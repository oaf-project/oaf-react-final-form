import * as t from "io-ts";
import React from "react";
import ReactDOM from "react-dom";
import { Form, formCodec, InputForCodec } from ".";
import { withMessage } from "../validation";

// tslint:disable: no-expression-statement object-literal-sort-keys

it("renders without crashing", () => {
  const codec = formCodec({
    required: { bar: withMessage(t.string, () => "Bar is required.") },
    optional: { foo: t.string },
  });

  type FormData = t.TypeOf<typeof codec>;

  const Input = InputForCodec(codec);

  const onSubmit = (_: FormData) => {
    return undefined;
  };

  const div = document.createElement("div");
  ReactDOM.render(
    <Form codec={codec} onSubmit={onSubmit}>
      <Input label="foo" name="foo" type="text" />
      <Input label="bar" name="bar" type="text" required={true} />
    </Form>,
    div,
  );
  ReactDOM.unmountComponentAtNode(div);
});
