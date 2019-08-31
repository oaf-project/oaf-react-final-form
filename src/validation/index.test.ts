import { isRight } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { toValidationErrors } from ".";
import { formCodec } from "..";

// tslint:disable: no-expression-statement no-duplicate-string no-if-statement no-throw

it("validates flat (non-nested) form data", async () => {
  const codec = formCodec({
    required: { foo: t.string },
  });

  const formData = {
    foo: undefined, // required string
  };

  const result = codec.decode(formData);

  if (isRight(result)) {
    throw new Error("Expected result to be a left");
  }

  const validationErrors = toValidationErrors(
    result.left,
    () => "This field is invalid.",
  );

  expect(validationErrors).toEqual({
    foo: "This field is invalid.",
  });
});

it("validates nested object form data", async () => {
  const codec = formCodec({
    required: { foo: t.type({ bar: t.string }) },
  });

  const formData = {
    foo: {
      bar: undefined, // required string
    },
  };

  const result = codec.decode(formData);

  if (isRight(result)) {
    throw new Error("Expected result to be a left");
  }

  const validationErrors = toValidationErrors(
    result.left,
    () => "This field is invalid.",
  );

  expect(validationErrors).toEqual({
    foo: { bar: "This field is invalid." },
  });
});

it("validates nested object form data with sibling errors", async () => {
  const codec = formCodec({
    required: { foo: t.type({ bar: t.string, baz: t.string }) },
  });

  const formData = {
    foo: {
      bar: undefined, // required string
      baz: undefined, // required string
    },
  };

  const result = codec.decode(formData);

  if (isRight(result)) {
    throw new Error("Expected result to be a left");
  }

  const validationErrors = toValidationErrors(
    result.left,
    () => "This field is invalid.",
  );

  expect(validationErrors).toEqual({
    foo: { bar: "This field is invalid.", baz: "This field is invalid." },
  });
});

it("validates array form data", async () => {
  const codec = formCodec({
    required: { foo: t.readonlyArray(t.string) },
  });

  const formData = {
    foo: ["a", undefined, "b"],
  };

  const result = codec.decode(formData);

  if (isRight(result)) {
    throw new Error("Expected result to be a left");
  }

  const validationErrors = toValidationErrors(
    result.left,
    () => "This field is invalid.",
  );

  expect(validationErrors).toEqual({
    foo: [undefined, "This field is invalid."],
  });
});

it("validates descendant of array", async () => {
  const codec = formCodec({
    required: { foo: t.readonlyArray(t.type({ bar: t.string })) },
  });

  const formData = {
    foo: [{ bar: "a" }, {}, { bar: "a" }],
  };

  const result = codec.decode(formData);

  if (isRight(result)) {
    throw new Error("Expected result to be a left");
  }

  const validationErrors = toValidationErrors(
    result.left,
    () => "This field is invalid.",
  );

  expect(validationErrors).toEqual({
    foo: [undefined, { bar: "This field is invalid." }],
  });
});

it("combines descendant errors for same array element", async () => {
  const codec = formCodec({
    required: {
      foo: t.readonlyArray(t.type({ bar: t.string, baz: t.string })),
    },
  });

  const formData = {
    foo: [{ bar: "a", baz: "a" }, {}, { bar: "a", baz: "a" }],
  };

  const result = codec.decode(formData);

  if (isRight(result)) {
    throw new Error("Expected result to be a left");
  }

  const validationErrors = toValidationErrors(
    result.left,
    () => "This field is invalid.",
  );

  expect(validationErrors).toEqual({
    foo: [
      undefined,
      { bar: "This field is invalid.", baz: "This field is invalid." },
    ],
  });
});

it("combines sibling errors in same array", async () => {
  const codec = formCodec({
    required: {
      foo: t.readonlyArray(t.type({ bar: t.string })),
    },
  });

  const formData = {
    foo: [{}, {}],
  };

  const result = codec.decode(formData);

  if (isRight(result)) {
    throw new Error("Expected result to be a left");
  }

  const validationErrors = toValidationErrors(
    result.left,
    () => "This field is invalid.",
  );

  expect(validationErrors).toEqual({
    foo: [{ bar: "This field is invalid." }, { bar: "This field is invalid." }],
  });
});
