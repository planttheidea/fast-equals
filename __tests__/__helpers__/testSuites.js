import React from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const fn = () => {};
const promise = Promise.resolve('foo');

const reactElementA = { ...React.createElement('div', { x: 1 }) };
// in reality the _owner object is much more complex (and contains over dozen circular references)
reactElementA._owner = { children: [reactElementA] };

const reactElementA2 = { ...React.createElement('div', { x: 1 }) };
reactElementA2._owner = { children: [reactElementA2] };

const reactElementB = { ...React.createElement('div', { x: 2 }) };
reactElementB._owner = { children: [reactElementB] };

const reactElementC = { ...React.createElement('span', { x: 1 }) };
reactElementC._owner = { children: [reactElementC] };

export default [
  {
    description: 'primitives',
    tests: [
      {
        deepEqual: true,
        description: 'equal numbers',
        shallowEqual: true,
        value1: 1,
        value2: 1,
      },
      {
        deepEqual: false,
        description: 'not equal numbers',
        shallowEqual: false,
        value1: 1,
        value2: 2,
      },
      {
        deepEqual: true,
        description: 'equal zero',
        shallowEqual: true,
        value1: 0,
        value2: 0,
      },
      {
        deepEqual: true,
        description: 'equal positive and negative zero',
        shallowEqual: true,
        value1: -0,
        value2: 0,
      },
      {
        deepEqual: true,
        description: 'equal Infinity',
        shallowEqual: true,
        value1: Infinity,
        value2: Infinity,
      },
      {
        deepEqual: false,
        description: 'not equal Infinity',
        shallowEqual: false,
        value1: -Infinity,
        value2: Infinity,
      },
      {
        deepEqual: true,
        description: 'equal number objects',
        shallowEqual: true,
        value1: new Number(1),
        value2: new Number(1),
      },
      {
        deepEqual: false,
        description: 'not equal number objects',
        shallowEqual: false,
        value1: new Number(1),
        value2: new Number(2),
      },
      {
        deepEqual: false,
        description: 'number and array are not equal',
        shallowEqual: false,
        value1: 1,
        value2: [],
      },
      {
        deepEqual: false,
        description: '0 and null are not equal',
        shallowEqual: false,
        value1: 0,
        value2: null,
      },
      {
        deepEqual: true,
        description: 'NaN and NaN are equal',
        shallowEqual: true,
        value1: NaN,
        value2: NaN,
      },
      {
        deepEqual: true,
        description: 'equal strings',
        shallowEqual: true,
        value1: 'a',
        value2: 'a',
      },
      {
        deepEqual: false,
        description: 'not equal strings',
        shallowEqual: false,
        value1: 'a',
        value2: 'b',
      },
      {
        deepEqual: true,
        description: 'equal string objects',
        shallowEqual: true,
        value1: new String('foo'),
        value2: new String('foo'),
      },
      {
        deepEqual: false,
        description: 'not equal string objects',
        shallowEqual: false,
        value1: new String('foo'),
        value2: new String('bar'),
      },
      {
        deepEqual: false,
        description: 'empty string and null are not equal',
        shallowEqual: false,
        value1: '',
        value2: null,
      },
      {
        deepEqual: true,
        description: 'null is equal to null',
        shallowEqual: true,
        value1: null,
        value2: null,
      },
      {
        deepEqual: true,
        description: 'equal booleans (true)',
        shallowEqual: true,
        value1: true,
        value2: true,
      },
      {
        deepEqual: true,
        description: 'equal booleans (false)',
        shallowEqual: true,
        value1: false,
        value2: false,
      },
      {
        deepEqual: true,
        description: 'equal boolean objects (true)',
        shallowEqual: true,
        value1: new Boolean(true),
        value2: new Boolean(true),
      },
      {
        deepEqual: true,
        description: 'equal boolean objects (false)',
        shallowEqual: true,
        value1: new Boolean(false),
        value2: new Boolean(false),
      },
      {
        deepEqual: false,
        description: 'not equal booleans',
        shallowEqual: false,
        value1: true,
        value2: false,
      },
      {
        deepEqual: false,
        description: 'not equal boolean objects',
        shallowEqual: false,
        value1: new Boolean(true),
        value2: new Boolean(false),
      },
      {
        deepEqual: false,
        description: '1 and true are not equal',
        shallowEqual: false,
        value1: 1,
        value2: true,
      },
      {
        deepEqual: false,
        description: '0 and false are not equal',
        shallowEqual: false,
        value1: 0,
        value2: false,
      },
    ],
  },
  {
    description: 'functions',
    tests: [
      {
        deepEqual: true,
        description: 'function and the same function are equal',
        shallowEqual: true,
        value1: fn,
        value2: fn,
      },
      {
        deepEqual: false,
        description: 'function and different function are not equal',
        shallowEqual: false,
        value1: fn,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        value2: () => {},
      },
    ],
  },
  {
    description: 'objects',
    tests: [
      {
        deepEqual: true,
        description: 'empty objects are equal',
        shallowEqual: true,
        value1: {},
        value2: {},
      },
      {
        deepEqual: true,
        description: 'empty objects with `null` as prototype are equal',
        shallowEqual: true,
        value1: Object.create(null),
        value2: Object.create(null),
      },
      {
        deepEqual: true,
        description: 'equal objects (same properties "order")',
        shallowEqual: true,
        value1: {
          a: 1,
          b: '2',
        },
        value2: {
          a: 1,
          b: '2',
        },
      },
      {
        deepEqual: true,
        description: 'equal objects (different properties "order")',
        shallowEqual: true,
        value1: {
          a: 1,
          b: '2',
        },
        value2: {
          a: 1,
          b: '2',
        },
      },
      {
        deepEqual: false,
        description: 'not equal objects (extra property)',
        shallowEqual: false,
        value1: {
          a: 1,
          b: '2',
        },
        value2: {
          a: 1,
          b: '2',
          c: [],
        },
      },
      {
        deepEqual: false,
        description: 'not equal objects (different properties)',
        shallowEqual: false,
        value1: {
          a: 1,
          b: '2',
          c: 3,
        },
        value2: {
          a: 1,
          b: '2',
          d: 3,
        },
      },
      {
        deepEqual: false,
        description: 'not equal objects (different properties)',
        shallowEqual: false,
        value1: {
          a: 1,
          b: '2',
          c: 3,
        },
        value2: {
          a: 1,
          b: '2',
          d: 3,
        },
      },
      {
        deepEqual: true,
        description: 'equal objects (same sub-properties)',
        shallowEqual: false,
        value1: { a: [{ b: 'c' }] },
        value2: { a: [{ b: 'c' }] },
      },
      {
        deepEqual: false,
        description: 'not equal objects (different sub-property value)',
        shallowEqual: false,
        value1: { a: [{ b: 'c' }] },
        value2: { a: [{ b: 'd' }] },
      },
      {
        deepEqual: false,
        description: 'not equal objects (different sub-property)',
        shallowEqual: false,
        value1: { a: [{ b: 'c' }] },
        value2: { a: [{ c: 'c' }] },
      },
      {
        deepEqual: false,
        description: 'empty array and empty object are not equal',
        shallowEqual: false,
        value1: {},
        value2: [],
      },
      {
        deepEqual: false,
        description: 'object with extra undefined properties are not equal #1',
        shallowEqual: false,
        value1: {},
        value2: { foo: undefined },
      },
      {
        deepEqual: false,
        description: 'object with extra undefined properties are not equal #2',
        shallowEqual: false,
        value1: { foo: undefined },
        value2: {},
      },
      {
        deepEqual: false,
        description: 'object with extra undefined properties are not equal #3',
        shallowEqual: false,
        value1: { foo: undefined },
        value2: { bar: undefined },
      },
    ],
  },

  {
    description: 'arrays',
    tests: [
      {
        deepEqual: true,
        description: 'two empty arrays are equal',
        shallowEqual: true,
        value1: [],
        value2: [],
      },
      {
        deepEqual: true,
        description: 'equal arrays',
        shallowEqual: true,
        value1: [1, 2, 3],
        value2: [1, 2, 3],
      },
      {
        deepEqual: false,
        description: 'not equal arrays (different item)',
        shallowEqual: false,
        value1: [1, 2, 3],
        value2: [1, 2, 4],
      },
      {
        deepEqual: false,
        description: 'not equal arrays (different length)',
        shallowEqual: false,
        value1: [1, 2, 3],
        value2: [1, 2],
      },
      {
        deepEqual: true,
        description: 'equal arrays of objects',
        shallowEqual: false,
        value1: [{ a: 'a' }, { b: 'b' }],
        value2: [{ a: 'a' }, { b: 'b' }],
      },
      {
        deepEqual: false,
        description: 'not equal arrays of objects',
        shallowEqual: false,
        value1: [{ a: 'a' }, { b: 'b' }],
        value2: [{ a: 'a' }, { b: 'c' }],
      },
      {
        deepEqual: false,
        description: 'pseudo array and equivalent array are not equal',
        shallowEqual: false,
        value1: {
          0: 0,
          1: 1,
          length: 2,
        },
        value2: [0, 1],
      },
      {
        deepEqual: false,
        description: 'different sparse arrays are not equal',
        shallowEqual: false,
        value1: new Array(10),
        value2: new Array(100),
      },
    ],
  },
  {
    description: 'dates',
    tests: [
      {
        deepEqual: true,
        description: 'equal date objects',
        shallowEqual: true,
        value1: new Date('2017-06-16T21:36:48.362Z'),
        value2: new Date('2017-06-16T21:36:48.362Z'),
      },
      {
        deepEqual: false,
        description: 'not equal date objects',
        shallowEqual: false,
        value1: new Date('2017-06-16T21:36:48.362Z'),
        value2: new Date('2017-01-01T00:00:00.000Z'),
      },
      {
        deepEqual: false,
        description: 'date and string are not equal',
        shallowEqual: false,
        value1: new Date('2017-06-16T21:36:48.362Z'),
        value2: '2017-06-16T21:36:48.362Z',
      },
      {
        deepEqual: false,
        description: 'date and object are not equal',
        shallowEqual: false,
        value1: new Date('2017-06-16T21:36:48.362Z'),
        value2: {},
      },
      {
        deepEqual: true,
        description: 'invalid dates are equal',
        shallowEqual: true,
        value1: new Date('foo'),
        value2: new Date('bar'),
      },
    ],
  },
  {
    description: 'regexps',
    tests: [
      {
        deepEqual: true,
        description: 'equal RegExp objects',
        shallowEqual: true,
        value1: /foo/,
        value2: /foo/,
      },
      {
        deepEqual: false,
        description: 'not equal RegExp objects (different pattern)',
        shallowEqual: false,
        value1: /foo/,
        value2: /bar/,
      },
      {
        deepEqual: false,
        description: 'not equal RegExp objects (different flags)',
        shallowEqual: false,
        value1: /foo/g,
        value2: /foo/i,
      },
      {
        deepEqual: true,
        description: 'equal RegExp objects (different flags "order")',
        shallowEqual: true,
        value1: new RegExp('foo', 'gi'),
        value2: new RegExp('foo', 'ig'),
      },
      {
        deepEqual: false,
        description: 'RegExp and string are not equal',
        shallowEqual: false,
        value1: /foo/,
        value2: 'foo',
      },
      {
        deepEqual: false,
        description: 'RegExp and object are not equal',
        shallowEqual: false,
        value1: /foo/,
        value2: {},
      },
    ],
  },
  {
    description: 'maps',
    tests: [
      {
        deepEqual: true,
        description: 'equal Map objects',
        shallowEqual: true,
        value1: new Map().set('foo', 'bar'),
        value2: new Map().set('foo', 'bar'),
      },
      {
        deepEqual: false,
        description: 'not equal Map objects (different value)',
        shallowEqual: false,
        value1: new Map().set('foo', 'bar'),
        value2: new Map().set('foo', 'baz'),
      },
      {
        deepEqual: false,
        description: 'not equal Map objects (different key)',
        shallowEqual: false,
        value1: new Map().set('foo', 'bar'),
        value2: new Map().set('baz', 'bar'),
      },
      {
        deepEqual: false,
        description:
          'not equal Map objects (same keys / values, different pairings)',
        shallowEqual: false,
        value1: new Map().set('foo', 'bar'),
        value2: new Map().set('bar', 'foo'),
      },
      {
        deepEqual: true,
        description: 'deep equal Map objects',
        shallowEqual: false,
        value1: new Map().set('foo', new Map().set('bar', 'baz')),
        value2: new Map().set('foo', new Map().set('bar', 'baz')),
      },
      {
        deepEqual: false,
        description: 'Map and object are not equal',
        shallowEqual: false,
        value1: new Map().set('foo', 'bar'),
        value2: { foo: 'bar' },
      },
      {
        deepEqual: false,
        description: 'Map and Set are not equal',
        shallowEqual: false,
        value1: new Map().set('foo', 'foo'),
        value2: new Set().add('foo'),
      },
    ],
  },
  {
    description: 'sets',
    tests: [
      {
        deepEqual: true,
        description: 'equal Set objects',
        shallowEqual: true,
        value1: new Set().add('foo'),
        value2: new Set().add('foo'),
      },
      {
        deepEqual: false,
        description: 'not equal Set objects (different value)',
        shallowEqual: false,
        value1: new Set().add('foo'),
        value2: new Set().add('bar'),
      },
      {
        deepEqual: true,
        description: 'deep equal Set objects',
        shallowEqual: false,
        value1: new Set().add({ foo: 'bar' }),
        value2: new Set().add({ foo: 'bar' }),
      },
      {
        deepEqual: false,
        description: 'Set and array are not equal',
        shallowEqual: false,
        value1: new Set().add('foo'),
        value2: ['foo'],
      },
    ],
  },
  {
    description: 'promises',
    tests: [
      {
        deepEqual: true,
        description: 'promises are equal when strictly equal',
        shallowEqual: true,
        value1: promise,
        value2: promise,
      },
      {
        deepEqual: false,
        description: 'promises are not equal when not strictly equal',
        shallowEqual: false,
        value1: promise,
        value2: Promise.resolve('foo'),
      },
    ],
  },
  {
    description: 'react',
    tests: [
      {
        deepEqual: true,
        description: 'react element compared with itself',
        shallowEqual: true,
        value1: reactElementA,
        value2: reactElementA,
      },
      {
        deepEqual: true,
        description: 'react elements equal in value',
        shallowEqual: false,
        value1: reactElementA,
        value2: reactElementA2,
      },
      {
        deepEqual: false,
        description: 'react elements unequal by value',
        shallowEqual: false,
        value1: reactElementA,
        value2: reactElementB,
      },
      {
        deepEqual: false,
        description: 'react elements equal in value but different types',
        shallowEqual: false,
        value1: reactElementA,
        value2: reactElementC,
      },
    ],
  },
  {
    description: 'typed arrays',
    tests: [
      {
        deepEqual: true,
        description: 'two empty arrays of the same class are equal',
        shallowEqual: true,
        value1: new Int32Array([]),
        value2: new Int32Array([]),
      },
      {
        deepEqual: false,
        description: 'two empty arrays of the different class are not equal',
        shallowEqual: false,
        value1: new Int32Array([]),
        value2: new Int16Array([]),
      },
      {
        deepEqual: true,
        description: 'equal Float32Array objects',
        shallowEqual: true,
        value1: new Float32Array([21, 31]),
        value2: new Float32Array([21, 31]),
      },
      {
        deepEqual: false,
        description: 'not equal Float32Array objects (different value)',
        shallowEqual: false,
        value1: new Float32Array([21, 31]),
        value2: new Float32Array([31, 21]),
      },
      {
        deepEqual: false,
        description:
          'not equal Float32Array objects (different TypedArray class)',
        shallowEqual: false,
        value1: new Float32Array([21, 31]),
        value2: new Float64Array([21, 31]),
      },
      {
        deepEqual: true,
        description: 'equal Float64Array objects',
        shallowEqual: true,
        value1: new Float64Array([21, 31]),
        value2: new Float64Array([21, 31]),
      },
      {
        deepEqual: false,
        description: 'not equal Float64Array objects (different value)',
        shallowEqual: false,
        value1: new Float64Array([21, 31]),
        value2: new Float64Array([31, 21]),
      },
      {
        deepEqual: false,
        description:
          'not equal Float64Array objects (different TypedArray class)',
        shallowEqual: false,
        value1: new Float64Array([21, 31]),
        value2: new Int8Array([21, 31]),
      },
      {
        deepEqual: true,
        description: 'equal Int8Array objects',
        shallowEqual: true,
        value1: new Int8Array([21, 31]),
        value2: new Int8Array([21, 31]),
      },
      {
        deepEqual: false,
        description: 'not equal Int8Array objects (different value)',
        shallowEqual: false,
        value1: new Int8Array([21, 31]),
        value2: new Int8Array([31, 21]),
      },
      {
        deepEqual: false,
        description: 'not equal Int8Array objects (different TypedArray class)',
        shallowEqual: false,
        value1: new Int8Array([21, 31]),
        value2: new Int16Array([21, 31]),
      },
      {
        deepEqual: true,
        description: 'equal Int16Array objects',
        shallowEqual: true,
        value1: new Int16Array([21, 31]),
        value2: new Int16Array([21, 31]),
      },
      {
        deepEqual: false,
        description: 'not equal Int16Array objects (different value)',
        shallowEqual: false,
        value1: new Int16Array([21, 31]),
        value2: new Int16Array([31, 21]),
      },
      {
        deepEqual: false,
        description:
          'not equal Int16Array objects (different TypedArray class)',
        shallowEqual: false,
        value1: new Int16Array([21, 31]),
        value2: new Int32Array([21, 31]),
      },
      {
        deepEqual: true,
        description: 'equal Int32Array objects',
        shallowEqual: true,
        value1: new Int32Array([21, 31]),
        value2: new Int32Array([21, 31]),
      },
      {
        deepEqual: false,
        description: 'not equal Int32Array objects (different value)',
        shallowEqual: false,
        value1: new Int32Array([21, 31]),
        value2: new Int32Array([31, 21]),
      },
      {
        deepEqual: false,
        description:
          'not equal Int32Array objects (different TypedArray class)',
        shallowEqual: false,
        value1: new Int32Array([21, 31]),
        value2: new Uint8Array([21, 31]),
      },
      {
        deepEqual: true,
        description: 'equal Uint8Array objects',
        shallowEqual: true,
        value1: new Uint8Array([21, 31]),
        value2: new Uint8Array([21, 31]),
      },
      {
        deepEqual: false,
        description: 'not equal Uint8Array objects (different value)',
        shallowEqual: false,
        value1: new Uint8Array([21, 31]),
        value2: new Uint8Array([31, 21]),
      },
      {
        deepEqual: false,
        description:
          'not equal Uint8Array objects (different TypedArray class)',
        shallowEqual: false,
        value1: new Uint8Array([21, 31]),
        value2: new Uint8ClampedArray([21, 31]),
      },
      {
        deepEqual: true,
        description: 'equal Uint8ClampedArray objects',
        shallowEqual: true,
        value1: new Uint8ClampedArray([21, 31]),
        value2: new Uint8ClampedArray([21, 31]),
      },
      {
        deepEqual: false,
        description: 'not equal Uint8ClampedArray objects (different value)',
        shallowEqual: false,
        value1: new Uint8ClampedArray([21, 31]),
        value2: new Uint8ClampedArray([31, 21]),
      },
      {
        deepEqual: false,
        description:
          'not equal Uint8ClampedArray objects (different TypedArray class)',
        shallowEqual: false,
        value1: new Uint8ClampedArray([21, 31]),
        value2: new Uint16Array([21, 31]),
      },
      {
        deepEqual: true,
        description: 'equal Uint16Array objects',
        shallowEqual: true,
        value1: new Uint16Array([21, 31]),
        value2: new Uint16Array([21, 31]),
      },
      {
        deepEqual: false,
        description: 'not equal Uint16Array objects (different value)',
        shallowEqual: false,
        value1: new Uint16Array([21, 31]),
        value2: new Uint16Array([31, 21]),
      },
      {
        deepEqual: false,
        description:
          'not equal Uint16Array objects (different TypedArray class)',
        shallowEqual: false,
        value1: new Uint16Array([21, 31]),
        value2: new Uint32Array([21, 31]),
      },
      {
        deepEqual: true,
        description: 'equal Uint32Array objects',
        shallowEqual: true,
        value1: new Uint32Array([21, 31]),
        value2: new Uint32Array([21, 31]),
      },
      {
        deepEqual: false,
        description: 'not equal Uint32Array objects (different value)',
        shallowEqual: false,
        value1: new Uint32Array([21, 31]),
        value2: new Uint32Array([31, 21]),
      },
      {
        deepEqual: false,
        description:
          'not equal Uint32Array objects (different TypedArray class)',
        shallowEqual: false,
        value1: new Uint32Array([21, 31]),
        value2: new Float32Array([21, 31]),
      },
    ],
  },
  {
    description: 'mixed objects equal',
    tests: [
      {
        deepEqual: true,
        description: 'big object',
        shallowEqual: false,
        value1: {
          prop1: 'value1',
          prop2: fn,
          prop3: null,
          prop4: {
            subProp1: 'sub value1',
            subProp2: {
              subSubProp1: 'sub sub value1',
              subSubProp2: [
                1,
                2,
                {
                  prop: 2,
                  prop2: 1,
                },
                4,
                5,
              ],
            },
          },
          prop5: 1000,
          prop6: new Date(2016, 2, 10),
          prop7: /foo/,
        },
        value2: {
          prop1: 'value1',
          prop2: fn,
          prop3: null,
          prop4: {
            subProp1: 'sub value1',
            subProp2: {
              subSubProp1: 'sub sub value1',
              subSubProp2: [
                1,
                2,
                {
                  prop: 2,
                  prop2: 1,
                },
                4,
                5,
              ],
            },
          },
          prop5: 1000,
          prop6: new Date(2016, 2, 10),
          prop7: /foo/,
        },
      },
    ],
  },
  {
    description: 'mixed objects not equal',
    tests: [
      {
        deepEqual: false,
        description: 'big object',
        shallowEqual: false,
        value1: {
          prop1: 'value1',
          prop2: fn,
          prop3: null,
          prop4: {
            subProp1: 'sub value1',
            subProp2: {
              subSubProp1: 'sub sub value1',
              subSubProp2: [
                1,
                2,
                {
                  prop: 2,
                  prop2: 1,
                },
                4,
                5,
              ],
            },
          },
          prop5: 1000,
          prop6: new Date(2016, 2, 10),
          prop7: /foo/,
        },
        value2: {
          prop1: 'value1',
          prop2: fn,
          prop3: null,
          prop4: {
            subProp1: 'sub value1',
            subProp2: {
              subSubProp1: 'sub sub value1',
              subSubProp2: [
                1,
                2,
                {
                  prop: 2,
                  prop2: 1,
                },
                4,
                5,
              ],
            },
          },
          prop5: 1000,
          prop6: new Date('2017/04/17'),
          prop7: /foo/,
        },
      },
    ],
  },
];
