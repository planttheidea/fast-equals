import * as React from 'react';

const error = new Error('boom');
const typeError = new TypeError('boom');
const rangeError = new RangeError('boom');

export const primitiveValues = {
  boolean: true,
  nan: NaN,
  nil: null,
  number: 123,
  string: 'foo',
  undef: undefined,
};

export const mainValues = {
  ...primitiveValues,
  array: ['foo', { bar: 'baz' }],
  error,
  float32Array: new Float32Array([31, 21]),
  float64Array: new Float64Array([31, 21]),
  fn() {
    return 'foo';
  },
  int8Array: new Int8Array([31, 21]),
  int16Array: new Int16Array([31, 21]),
  int32Array: new Int32Array([31, 21]),
  map: new Map().set('foo', { bar: 'baz' }),
  object: { foo: { bar: 'baz' } },
  promise: Promise.resolve('foo'),
  rangeError,
  react: React.createElement(
    'main',
    {},
    React.createElement('h1', {}, 'Title'),
    React.createElement('p', {}, 'Content'),
    React.createElement('p', {}, 'Content'),
    React.createElement('p', {}, 'Content'),
    React.createElement('p', {}, 'Content'),
    React.createElement(
      'div',
      { style: { display: 'flex' } },
      React.createElement('div', { style: { flex: '1 1 auto' } }, 'Item'),
      React.createElement('div', { style: { flex: '1 1 0' } }, 'Item'),
    ),
  ),
  regexp: /foo/,
  set: new Set().add('foo').add({ bar: 'baz' }),
  typeError,
  uint8Array: new Uint8Array([31, 21]),
  uint8ClampedArray: new Uint8ClampedArray([31, 21]),
  uint16Array: new Uint16Array([31, 21]),
  uint32Array: new Uint32Array([31, 21]),
  zero: 0,
};

export const alternativeValues = {
  array: [123, /foo/],
  boolean: false,
  error: Object.create(error),
  float32Array: new Float32Array([21, 31]),
  float64Array: new Float64Array([21, 31]),
  fn() {
    return 123;
  },
  int8Array: new Int8Array([21, 31]),
  int16Array: new Int16Array([21, 31]),
  int32Array: new Int32Array([21, 31]),
  map: new Map().set({ bar: 'baz' }, 'foo'),
  number: 234,
  object: { bar: { baz: 'foo' } },
  rangeError: Object.create(rangeError),
  react: React.createElement('div', {}, 'foo'),
  regexp: /bar/gi,
  set: new Set().add({ bar: 'baz' }).add('foo'),
  string: 'bar',
  typeError: Object.create(typeError),
  uint8Array: new Uint8Array([21, 31]),
  uint8ClampedArray: new Uint8ClampedArray([21, 31]),
  uint16Array: new Uint16Array([21, 31]),
  uint32Array: new Uint32Array([21, 31]),
  zero: -0,
};
