# Oaf React Final Form

[![Build Status](https://travis-ci.org/oaf-project/oaf-react-final-form.svg?branch=master)](https://travis-ci.org/oaf-project/oaf-react-final-form)
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Foaf-project%2Foaf-react-final-form%2Fmaster%2Fpackage.json)](https://github.com/plantain-00/type-coverage)
[![Known Vulnerabilities](https://snyk.io/test/github/oaf-project/oaf-react-final-form/badge.svg?targetFile=package.json)](https://snyk.io/test/github/oaf-project/oaf-react-final-form?targetFile=package.json)
[![npm](https://img.shields.io/npm/v/oaf-react-final-form.svg)](https://www.npmjs.com/package/oaf-react-final-form)

An opinionated form library.
* TypeScript + React Final Form
* Strict type safety
* Validation built with [io-ts](https://github.com/gcanti/io-ts)
* Accessible by default
  * `validateOnBlur` defaults to true. See https://github.com/final-form/final-form/issues/250
    * As a consequence, we include work-arounds for https://github.com/final-form/final-form/issues/213 and https://github.com/final-form/react-final-form/issues/458
    * See also https://developer.paciellogroup.com/blog/2019/02/required-attribute-requirements/ for motivation
  * By default we render accessible form labels and validation feedback (with `aria-invalid` and `aria-labelledby`)
  * After a failed form submission, we move focus to the first invalid form element (using https://github.com/oaf-project/oaf-side-effects)
  * https://webaim.org/techniques/formvalidation/

## Installation

```sh
# yarn
yarn add oaf-react-final-form

# npm
npm install oaf-react-final-form
```

## Usage
```typescript
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
  const { Form, Input, Select } = elementsForCodec(codec);

  type FormData = t.TypeOf<typeof codec>;

  const onSubmit = (formData: FormData): SubmissionResponse<FormData> => {
    // Here we are guaranteed that `formData` has been parsed by our form codec.
    // We can return submission errors here if necessary.
    return undefined;
  };

  const form = (
    <Form onSubmit={onSubmit}>
      {/*
        The `name` attr must be one of the values from the form codec.
        The `type` and `required` attrs must be compatible with the corresponding property from the form codec.
          * Because `foo` is optional in the codec, `required` must be either undefined or false.
          * Because `foo` is a string in the codec, `type` cannot be one of the numeric input types (`number` or `range`).
      */}
      <Input label="foo" name="foo" type="text" />
    </Form>
  );
```

See [Form.test.tsx](https://github.com/oaf-project/oaf-react-final-form/blob/master/src/components/Form.test.tsx) for more examples.
