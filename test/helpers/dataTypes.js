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
  regexp: /foo/,
  set: new Set().add('foo').add({bar: 'baz'}),
  string: 'foo',
  undef: undefined
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
  regexp: /bar/gi,
  set: new Set().add({bar: 'baz'}, 'foo'),
  string: 'bar'
};
