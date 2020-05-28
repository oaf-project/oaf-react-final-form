import { isRight } from "fp-ts/lib/Either";
import * as t from "io-ts";
import { toValidationErrors } from ".";
import { formCodec } from "..";
import { ReadonlyRecord } from "fp-ts/lib/ReadonlyRecord";

/* eslint-disable functional/no-throw-statement, sonarjs/no-duplicate-string, functional/functional-parameters, functional/no-expression-statement, functional/no-conditional-statement, @typescript-eslint/no-explicit-any */

// type-coverage:ignore-next-line
const examples: ReadonlyArray<
  readonly [
    t.Type<any>,
    ReadonlyRecord<string, unknown>,
    ReadonlyRecord<string, unknown>,
  ]
> = [
  // Flat
  [
    formCodec({
      required: { foo: t.string },
    }),
    {
      foo: undefined, // required string
    },
    {
      foo: "This field is invalid.",
    },
  ],
  // Nested
  [
    formCodec({
      required: { foo: t.type({ bar: t.string }) },
    }),
    {
      foo: {
        bar: undefined, // required string
      },
    },
    {
      foo: { bar: "This field is invalid." },
    },
  ],
  // nested object form data with sibling errors
  [
    formCodec({
      required: {
        foo: t.readonly(
          t.intersection([
            t.type({ bar: t.string }),
            t.type({ baz: t.string }),
          ]),
        ),
      },
    }),
    {
      foo: {
        bar: undefined, // required string
        baz: undefined, // required string
      },
    },
    {
      foo: { bar: "This field is invalid.", baz: "This field is invalid." },
    },
  ],
  // array form data
  [
    formCodec({
      required: { foo: t.readonlyArray(t.string) },
    }),
    {
      foo: ["a", undefined, "b"],
    },
    {
      foo: [undefined, "This field is invalid."],
    },
  ],
  // descendant of array
  [
    formCodec({
      required: { foo: t.readonlyArray(t.type({ bar: t.string })) },
    }),
    {
      foo: [{ bar: "a" }, {}, { bar: "a" }],
    },
    {
      foo: [undefined, { bar: "This field is invalid." }],
    },
  ],
  // combines descendant errors for same array element
  [
    formCodec({
      required: {
        foo: t.readonlyArray(t.type({ bar: t.string, baz: t.string })),
      },
    }),
    {
      foo: [{ bar: "a", baz: "a" }, {}, { bar: "a", baz: "a" }],
    },
    {
      foo: [
        undefined,
        { bar: "This field is invalid.", baz: "This field is invalid." },
      ],
    },
  ],
  // combines sibling errors in same array
  [
    formCodec({
      required: {
        foo: t.readonlyArray(t.type({ bar: t.string })),
      },
    }),
    {
      foo: [{}, {}],
    },
    {
      foo: [
        { bar: "This field is invalid." },
        { bar: "This field is invalid." },
      ],
    },
  ],
  // combination of optional and required fields
  [
    formCodec({
      required: {
        foo: t.string,
      },
      optional: {
        bar: t.string,
      },
    }),
    {
      foo: undefined,
      bar: undefined,
    },
    {
      foo: "This field is invalid.",
    },
  ],
  // combination of required and optional fields
  [
    t.intersection([t.type({ foo: t.string }), t.partial({ bar: t.string })]),
    {
      foo: undefined,
      bar: undefined,
    },
    {
      foo: "This field is invalid.",
    },
  ],
  // integer field name
  [
    formCodec({
      required: {
        0: t.string,
      },
      optional: {
        1: t.string,
      },
    }),
    {},
    {
      0: "This field is invalid.",
    },
  ],
  // integer string field name
  [
    formCodec({
      required: {
        "0": t.string,
      },
      optional: {
        "1": t.string,
      },
    }),
    {},
    {
      "0": "This field is invalid.",
    },
  ],
];

// type-coverage:ignore-next-line
test.each(examples)(
  "produces expected validation errors",
  // type-coverage:ignore-next-line
  (codec, formData, expected) => {
    // type-coverage:ignore-next-line
    const result = codec.decode(formData);

    if (isRight(result)) {
      throw new Error("Expected result to be a left");
    }

    const validationErrors = toValidationErrors(
      result.left,
      () => "This field is invalid.",
    );

    expect(validationErrors).toEqual(expected);
  },
);
