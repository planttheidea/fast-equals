import * as React from 'react';

export const primitiveValues = {
  boolean: true,
  nan: NaN,
  nil: null as null,
  number: 123,
  string: 'foo',
  undef: undefined as undefined,
};

export const mainValues = {
  ...primitiveValues,
  array: ['foo', { bar: 'baz' }],
  fn() {
    return 'foo';
  },
  map: new Map().set('foo', { bar: 'baz' }),
  object: { foo: { bar: 'baz' } },
  promise: Promise.resolve('foo'),
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
};

export const alternativeValues = {
  array: [123, /foo/],
  boolean: false,
  fn() {
    return 123;
  },
  map: new Map().set({ bar: 'baz' }, 'foo'),
  number: 234,
  object: { bar: { baz: 'foo' } },
  react: React.createElement('div', {}, 'foo'),
  regexp: /bar/gi,
  set: new Set().add({ bar: 'baz' }).add('foo'),
  string: 'bar',
};
