const React = require('react');

export const mainValues = {
  array: ['foo', {bar: 'baz'}],
  boolean: true,
  fn() {
    return 'foo';
  },
  map: new Map().set('foo', {bar: 'baz'}),
  nan: NaN,
  nil: null,
  number: 123,
  object: {foo: {bar: 'baz'}},
  promise: Promise.resolve('foo'),
  react: React.createElement('main', {
    children: [
      React.createElement('h1', {children: 'Title'}),
      React.createElement('p', {children: 'Content'}),
      React.createElement('p', {children: 'Content'}),
      React.createElement('p', {children: 'Content'}),
      React.createElement('p', {children: 'Content'}),
      React.createElement('div', {
        children: [
          React.createElement('div', {
            children: 'Item',
            style: {flex: '1 1 auto'},
          }),
          React.createElement('div', {
            children: 'Item',
            style: {flex: '1 1 0'},
          }),
        ],
        style: {display: 'flex'},
      }),
    ],
  }),
  regexp: /foo/,
  set: new Set().add('foo').add({bar: 'baz'}),
  string: 'foo',
  undef: undefined,
};

export const alternativeValues = {
  array: [123, /foo/],
  boolean: false,
  fn() {
    return 123;
  },
  map: new Map().set({bar: 'baz'}, 'foo'),
  number: 234,
  object: {bar: {baz: 'foo'}},
  react: React.createElement('div', {children: 'foo'}),
  regexp: /bar/gi,
  set: new Set().add({bar: 'baz'}, 'foo'),
  string: 'bar',
};
