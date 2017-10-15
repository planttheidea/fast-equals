'use strict';

const fn = () => {};

module.exports = [
  {
    description: 'primitives',
    tests: [
      {
        description: 'equal numbers',
        value1: 1,
        value2: 1,
        deepEqual: true,
        shallowEqual: true
      },
      {
        description: 'not equal numbers',
        value1: 1,
        value2: 2,
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: 'number and array are not equal',
        value1: 1,
        value2: [],
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: '0 and null are not equal',
        value1: 0,
        value2: null,
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: 'NaN and NaN are equal',
        value1: NaN,
        value2: NaN,
        deepEqual: true,
        shallowEqual: true
      },
      {
        description: 'equal strings',
        value1: 'a',
        value2: 'a',
        deepEqual: true,
        shallowEqual: true
      },
      {
        description: 'not equal strings',
        value1: 'a',
        value2: 'b',
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: 'empty string and null are not equal',
        value1: '',
        value2: null,
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: 'null is equal to null',
        value1: null,
        value2: null,
        deepEqual: true,
        shallowEqual: true
      },
      {
        description: 'equal booleans (true)',
        value1: true,
        value2: true,
        deepEqual: true,
        shallowEqual: true
      },
      {
        description: 'equal booleans (false)',
        value1: false,
        value2: false,
        deepEqual: true,
        shallowEqual: true
      },
      {
        description: 'not equal booleans',
        value1: true,
        value2: false,
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: '1 and true are not equal',
        value1: 1,
        value2: true,
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: '0 and false are not equal',
        value1: 0,
        value2: false,
        deepEqual: false,
        shallowEqual: false
      }
    ]
  },
  {
    description: 'functions',
    tests: [
      {
        description: 'function and the same function are equal',
        value1: fn,
        value2: fn,
        deepEqual: true,
        shallowEqual: true
      },
      {
        description: 'function and different function are not equal',
        value1: fn,
        value2: () => {},
        deepEqual: false,
        shallowEqual: false
      }
    ]
  },
  {
    description: 'objects',
    tests: [
      {
        description: 'empty objects are equal',
        value1: {},
        value2: {},
        deepEqual: true,
        shallowEqual: true
      },
      {
        description: 'equal objects (same properties "order")',
        value1: {a: 1, b: '2'},
        value2: {a: 1, b: '2'},
        deepEqual: true,
        shallowEqual: true
      },
      {
        description: 'equal objects (different properties "order")',
        value1: {a: 1, b: '2'},
        value2: {b: '2', a: 1},
        deepEqual: true,
        shallowEqual: true
      },
      {
        description: 'not equal objects (extra property)',
        value1: {a: 1, b: '2'},
        value2: {a: 1, b: '2', c: []},
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: 'not equal objects (different properties)',
        value1: {a: 1, b: '2', c: 3},
        value2: {a: 1, b: '2', d: 3},
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: 'not equal objects (different properties)',
        value1: {a: 1, b: '2', c: 3},
        value2: {a: 1, b: '2', d: 3},
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: 'equal objects (same sub-properties)',
        value1: {a: [{b: 'c'}]},
        value2: {a: [{b: 'c'}]},
        deepEqual: true,
        shallowEqual: false
      },
      {
        description: 'not equal objects (different sub-property value)',
        value1: {a: [{b: 'c'}]},
        value2: {a: [{b: 'd'}]},
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: 'not equal objects (different sub-property)',
        value1: {a: [{b: 'c'}]},
        value2: {a: [{c: 'c'}]},
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: 'empty array and empty object are not equal',
        value1: {},
        value2: [],
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: 'object with extra undefined properties are not equal #1',
        value1: {},
        value2: {foo: undefined},
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: 'object with extra undefined properties are not equal #2',
        value1: {foo: undefined},
        value2: {},
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: 'object with extra undefined properties are not equal #3',
        value1: {foo: undefined},
        value2: {bar: undefined},
        deepEqual: false,
        shallowEqual: false
      }
    ]
  },

  {
    description: 'arrays',
    tests: [
      {
        description: 'two empty arrays are equal',
        value1: [],
        value2: [],
        deepEqual: true,
        shallowEqual: true
      },
      {
        description: 'equal arrays',
        value1: [1, 2, 3],
        value2: [1, 2, 3],
        deepEqual: true,
        shallowEqual: true
      },
      {
        description: 'not equal arrays (different item)',
        value1: [1, 2, 3],
        value2: [1, 2, 4],
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: 'not equal arrays (different length)',
        value1: [1, 2, 3],
        value2: [1, 2],
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: 'equal arrays of objects',
        value1: [{a: 'a'}, {b: 'b'}],
        value2: [{a: 'a'}, {b: 'b'}],
        deepEqual: true,
        shallowEqual: false
      },
      {
        description: 'not equal arrays of objects',
        value1: [{a: 'a'}, {b: 'b'}],
        value2: [{a: 'a'}, {b: 'c'}],
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: 'pseudo array and equivalent array are not equal',
        value1: {0: 0, 1: 1, length: 2},
        value2: [0, 1],
        deepEqual: false,
        shallowEqual: false
      }
    ]
  },
  {
    description: 'dates',
    tests: [
      {
        description: 'equal date objects',
        value1: new Date('2017-06-16T21:36:48.362Z'),
        value2: new Date('2017-06-16T21:36:48.362Z'),
        deepEqual: true,
        shallowEqual: true
      },
      {
        description: 'not equal date objects',
        value1: new Date('2017-06-16T21:36:48.362Z'),
        value2: new Date('2017-01-01T00:00:00.000Z'),
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: 'date and string are not equal',
        value1: new Date('2017-06-16T21:36:48.362Z'),
        value2: '2017-06-16T21:36:48.362Z',
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: 'date and object are not equal',
        value1: new Date('2017-06-16T21:36:48.362Z'),
        value2: {},
        deepEqual: false,
        shallowEqual: false
      }
    ]
  },
  {
    description: 'regexps',
    tests: [
      {
        description: 'equal RegExp objects',
        value1: /foo/,
        value2: /foo/,
        deepEqual: true,
        shallowEqual: true
      },
      {
        description: 'not equal RegExp objects (different pattern)',
        value1: /foo/,
        value2: /bar/,
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: 'not equal RegExp objects (different flags)',
        value1: /foo/,
        value2: /foo/i,
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: 'equal RegExp objects (different flags "order")',
        value1: /foo/gi,
        value2: /foo/gi,
        deepEqual: true,
        shallowEqual: true
      },
      {
        description: 'RegExp and string are not equal',
        value1: /foo/,
        value2: 'foo',
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: 'RegExp and object are not equal',
        value1: /foo/,
        value2: {},
        deepEqual: false,
        shallowEqual: false
      }
    ]
  },
  {
    description: 'maps',
    tests: [
      {
        description: 'equal Map objects',
        value1: new Map().set('foo', 'bar'),
        value2: new Map().set('foo', 'bar'),
        deepEqual: true,
        shallowEqual: true
      },
      {
        description: 'not equal Map objects (different value)',
        value1: new Map().set('foo', 'bar'),
        value2: new Map().set('foo', 'baz'),
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: 'not equal Map objects (different key)',
        value1: new Map().set('foo', 'bar'),
        value2: new Map().set('baz', 'bar'),
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: 'deep equal Map objects',
        value1: new Map().set('foo', new Map().set('bar', 'baz')),
        value2: new Map().set('foo', new Map().set('bar', 'baz')),
        deepEqual: true,
        shallowEqual: false
      },
      {
        description: 'Map and object are not equal',
        value1: new Map().set('foo', 'bar'),
        value2: {foo: 'bar'},
        deepEqual: false,
        shallowEqual: false
      }
    ]
  },
  {
    description: 'sets',
    tests: [
      {
        description: 'equal Set objects',
        value1: new Set().add('foo'),
        value2: new Set().add('foo'),
        deepEqual: true,
        shallowEqual: true
      },
      {
        description: 'not equal Set objects (different value)',
        value1: new Set().add('foo'),
        value2: new Set().add('bar'),
        deepEqual: false,
        shallowEqual: false
      },
      {
        description: 'deep equal Set objects',
        value1: new Set().add({foo: 'bar'}),
        value2: new Set().add({foo: 'bar'}),
        deepEqual: true,
        shallowEqual: false
      },
      {
        description: 'Set and array are not equal',
        value1: new Set().add('foo'),
        value2: ['foo'],
        deepEqual: false,
        shallowEqual: false
      }
    ]
  },
  {
    description: 'mixed objects equal',
    tests: [
      {
        description: 'big object',
        value1: {
          prop1: 'value1',
          prop2: 'value2',
          prop3: 'value3',
          prop4: {
            subProp1: 'sub value1',
            subProp2: {
              subSubProp1: 'sub sub value1',
              subSubProp2: [1, 2, {prop2: 1, prop: 2}, 4, 5]
            }
          },
          prop5: 1000,
          prop6: new Date(2016, 2, 10),
          prop7: /foo/
        },
        value2: {
          prop2: 'value2',
          prop6: new Date(2016, 2, 10),
          prop3: 'value3',
          prop4: {
            subProp1: 'sub value1',
            subProp2: {
              subSubProp1: 'sub sub value1',
              subSubProp2: [1, 2, {prop2: 1, prop: 2}, 4, 5]
            }
          },
          prop7: /foo/,
          prop5: 1000,
          prop1: 'value1'
        },
        deepEqual: true,
        shallowEqual: false
      }
    ]
  },
  {
    description: 'mixed objects not equal',
    tests: [
      {
        description: 'big object',
        value1: {
          prop1: 'value1',
          prop2: 'value2',
          prop3: 'value3',
          prop4: {
            subProp1: 'sub value1',
            subProp2: {
              subSubProp1: 'sub sub value1',
              subSubProp2: [1, 2, {prop2: 1, prop: 2}, 4, 5]
            }
          },
          prop5: 1000,
          prop6: new Date(2016, 2, 10),
          prop7: /foo/
        },
        value2: {
          prop2: 'value2',
          prop6: new Date('2017/04/17'),
          prop3: 'value3',
          prop4: {
            subProp2: {
              subSubProp1: 'sub sub value1',
              subSubProp2: [1, 2, {prop2: 1, prop: 2}, 4, 5]
            },
            subProp1: 'sub value1'
          },
          prop7: /foo/,
          prop5: 1000,
          prop1: 'value1'
        },
        deepEqual: false,
        shallowEqual: false
      }
    ]
  }
];
