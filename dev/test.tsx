import {
  createCustomEqual,
  circularDeepEqual,
  circularShallowEqual,
  deepEqual,
  shallowEqual,
  strictDeepEqual,
  strictShallowEqual,
} from '../src/index.js';

console.group('string');
console.log('true', deepEqual('foo', 'foo'));
console.log('false', deepEqual('foo', 'bar'));
console.groupEnd();

console.group('number');
console.log('true', deepEqual(123, 123));
console.log('false', deepEqual(123, 234));
console.groupEnd();

console.group('zero');
console.log('true', deepEqual(0, 0));
console.log('true', deepEqual(0, -0));
console.groupEnd();

console.group('Infinity');
console.log('true', deepEqual(Infinity, Infinity));
console.log('false', deepEqual(Infinity, -Infinity));
console.groupEnd();

console.group('null');
console.log('true', deepEqual(null, null));
console.log('false', deepEqual(null, undefined));
console.groupEnd();

console.group('NaN');
console.log('true', deepEqual(NaN, NaN));
console.log('false', deepEqual(NaN, 123));
console.groupEnd();

console.group('array');
console.log('true', deepEqual([1, 2, 3], [1, 2, 3]));
console.log('false', deepEqual([1, 2, 3], [3, 2, 1]));
console.log('false', deepEqual([1, 2, 3], [1, 2, 3, 4]));
console.log('false', deepEqual({}, []));
console.groupEnd();

console.group('deep array');
console.log('true', deepEqual([{ foo: 'bar' }, { bar: 'baz' }], [{ foo: 'bar' }, { bar: 'baz' }]));
console.log('false', deepEqual([{ foo: 'bar' }, { bar: 'baz' }], [{ bar: 'baz' }, { foo: 'bar' }]));
console.groupEnd();

console.group('date');
console.log('true', deepEqual(new Date(), new Date()));
console.log('false', deepEqual(new Date(), new Date(2017, 0, 1)));
console.groupEnd();

console.group('regexp');
console.log('true', deepEqual(/foo/, /foo/));
console.log('false', deepEqual(/foo/, /foo/g));
console.groupEnd();

console.group('promise');
const promise = Promise.resolve('foo');

console.log(true, deepEqual({ promise }, { promise }));
console.log(false, deepEqual({ promise }, { promise: Promise.resolve('foo') }));
console.groupEnd();

console.group('map deep');

console.log(
  'true',
  deepEqual(
    new Map().set('foo', 'bar').set('bar', { baz: 'baz' }),
    new Map().set('foo', 'bar').set('bar', { baz: 'baz' }),
  ),
);
console.log(
  'false',
  deepEqual(
    new Map().set('foo', 'bar').set('bar', { baz: 'baz' }),
    new Map().set('foo', 'bar').set('bar', { baz: 'quz' }),
  ),
);
console.log(
  'true',
  deepEqual(
    new Map().set('foo', { bar: 'baz' }).set('bar', 'baz'),
    new Map().set('bar', 'baz').set('foo', { bar: 'baz' }),
  ),
);
console.log(
  'false',
  deepEqual(
    new Map([
      ['key1', 'foo'],
      ['key2', 'bar'],
    ]),
    new Map([
      ['key1', 'bar'],
      ['key2', 'foo'],
    ]),
  ),
);

console.groupEnd();

console.group('map shallow');
console.log(
  'true',
  shallowEqual(new Map().set('foo', 'bar').set('bar', 'baz'), new Map().set('foo', 'bar').set('bar', 'baz')),
);
console.log(
  'false',
  shallowEqual(
    new Map().set('foo', { bar: 'baz' }).set('bar', 'baz'),
    new Map().set('foo', { bar: 'baz' }).set('bar', 'baz'),
  ),
);
console.log(
  'true',
  shallowEqual(new Map().set('foo', 'bar').set('bar', 'baz'), new Map().set('bar', 'baz').set('foo', 'bar')),
);
console.log(
  'false',
  shallowEqual(
    new Map([
      ['key1', 'foo'],
      ['key2', 'bar'],
    ]),
    new Map([
      ['key1', 'bar'],
      ['key2', 'foo'],
    ]),
  ),
);

console.groupEnd();

console.group('set');

console.log('true', deepEqual(new Set().add('bar'), new Set().add('bar')));
console.log('false', deepEqual(new Set().add('bar'), new Set().add('baz')));

console.groupEnd();

console.group('object');
console.log('true', deepEqual({ some: { deeply: { nested: 'value' } } }, { some: { deeply: { nested: 'value' } } }));
console.log('false', deepEqual({ some: { deeply: { nested: 'value' } } }, { some: { deeply: { nested: 'thing' } } }));
console.groupEnd();

console.group('custom');

const object1 = {
  deep: {
    deeper: {
      three: 3,
    },
    two: 2,
  },
  zero: 0,
};

const object2 = {
  deep: {
    deeper: {
      three: 3,
    },
    two: 2,
  },
  zero: 0,
};

const object3 = {
  deep: {
    deeper: {
      one: 1,
    },
    two: 2,
  },
  zero: 0,
};

const object4 = {
  deep: {
    deeper: {
      three: 3,
    },
    two: 2,
  },
  zero: 0,
};

const doesNotEverEqualOne = createCustomEqual({
  createInternalComparator: (comparator) => (a: any, b: any, _keyA, _keyB, _parentA, _parentB, state) => {
    if (typeof a === 'number' || typeof b === 'number') {
      return a !== 1 && b !== 1;
    }

    return Object.keys(a).every((key) => comparator(a[key], b[key], state));
  },
});

console.log('true', doesNotEverEqualOne(object1, object2));
console.log('false', doesNotEverEqualOne(object3, object4));
console.groupEnd();

console.group('circular object');

class Circular {
  me: {
    deeply: {
      nested: {
        reference: Circular;
      };
    };
    regexp: RegExp;
    value: string;
  };

  constructor(value: string) {
    this.me = {
      deeply: {
        nested: {
          reference: this,
        },
      },
      regexp: new RegExp(value, 'g'),
      value,
    };
  }
}

console.log('true', circularDeepEqual(new Circular('foo'), new Circular('foo')));
console.log('false', circularDeepEqual(new Circular('foo'), new Circular('bar')));
console.log('false', circularDeepEqual(new Circular('foo'), { foo: 'baz' }));

console.groupEnd();

console.group('custom circular');

interface CustomCircularMeta {
  customMethod(value: any): void;
  customValue: string;
}

function getCustomCircularCache(): CustomCircularMeta {
  return {
    customMethod(value) {
      console.log('hello', value);
    },
    customValue: 'goodbye',
  };
}

function areRegExpsEqual(a: RegExp, b: RegExp) {
  return (
    a.source === b.source
    && a.global === b.global
    && a.ignoreCase === b.ignoreCase
    && a.multiline === b.multiline
    && a.unicode === b.unicode
    && a.sticky === b.sticky
    && a.lastIndex === b.lastIndex
  );
}

const customDeepEqualCircular = createCustomEqual<CustomCircularMeta>({
  circular: true,
  createCustomConfig: (defaultOptions) => ({
    areObjectsEqual(a, b, state) {
      state.meta.customMethod(state.meta.customValue);

      return defaultOptions.areObjectsEqual(a, b, state);
    },
    areRegExpsEqual,
  }),
  createState: () => ({
    meta: getCustomCircularCache(),
  }),
});

console.log('true', customDeepEqualCircular(new Circular('foo'), new Circular('foo')));
console.log('false', customDeepEqualCircular(new Circular('foo'), new Circular('bar')));
console.log('false', customDeepEqualCircular(new Circular('foo'), { foo: 'baz' }));

console.groupEnd();

console.group('targeted custom');

const isDeepEqualOrFooMatchesMeta = createCustomEqual<'bar'>({
  createInternalComparator: (compare) => (a, b, _keyA, _keyB, _parentA, _parentB, state) => {
    return a === state.meta || b === state.meta || compare(a, b, state);
  },
  createState: () => ({ meta: 'bar' }),
});

console.log('shallow', isDeepEqualOrFooMatchesMeta({ foo: 'bar' }, { foo: 'baz' }));
console.log('deep', isDeepEqualOrFooMatchesMeta({ nested: { foo: 'bar' } }, { nested: { foo: 'baz' } }));

console.groupEnd();

console.group('circular array');

const array: any[] = ['foo'];

array[1] = array;

console.log('true', circularShallowEqual(array, ['foo', array]));
console.log('false', circularShallowEqual(array, [array]));

console.groupEnd();

console.group('react small');

console.log('true', deepEqual(<div>foo</div>, <div>foo</div>));
console.log('false', deepEqual(<div>foo</div>, <div>bar</div>));

console.groupEnd();

console.group('react large');

console.log(
  'true',
  deepEqual(
    <main>
      <h1>Title</h1>

      <p>Content</p>
      <p>Content</p>
      <p>Content</p>
      <p>Content</p>

      <div style={{ display: 'flex' }}>
        <div style={{ flex: '1 1 auto' }}>Item</div>
        <div style={{ flex: '1 1 0' }}>Item</div>
      </div>
    </main>,
    <main>
      <h1>Title</h1>

      <p>Content</p>
      <p>Content</p>
      <p>Content</p>
      <p>Content</p>

      <div style={{ display: 'flex' }}>
        <div style={{ flex: '1 1 auto' }}>Item</div>
        <div style={{ flex: '1 1 0' }}>Item</div>
      </div>
    </main>,
  ),
);
console.log(
  'false',
  deepEqual(
    <main>
      <h1>Title</h1>

      <p>Content</p>
      <p>Content</p>
      <p>Content</p>
      <p>Content</p>

      <div style={{ display: 'flex' }}>
        <div style={{ flex: '1 1 auto' }}>Item</div>
        <div style={{ flex: '1 1 0' }}>Item</div>
      </div>
    </main>,
    <main>
      <h1>Title</h1>

      <p>Content</p>
      <p>Content</p>
      <p>Content</p>
      <p>Other Content</p>

      <div style={{ display: 'flex' }}>
        <div style={{ flex: '1 1 auto' }}>Item</div>
        <div style={{ flex: '1 1 0' }}>Item</div>
      </div>
    </main>,
  ),
);

console.groupEnd();

console.group('typed arrays');

console.log('true - deep', deepEqual(new Int8Array([21, 31]), new Int8Array([21, 31])));
console.log('true - shallow', shallowEqual(new Int8Array([21, 31]), new Int8Array([21, 31])));

console.log('true - strict deep', strictDeepEqual(new Int8Array([21, 31]), new Int8Array([21, 31])));
console.log('true - strict shallow', strictShallowEqual(new Int8Array([21, 31]), new Int8Array([21, 31])));

console.log('true - deep (different types)', deepEqual(new Int8Array([21, 31]), new Int16Array([21, 31])));
console.log('true - shallow (different types)', shallowEqual(new Int8Array([21, 31]), new Int16Array([21, 31])));

console.log(
  'false - strict deep (different types)',
  strictDeepEqual(new Int8Array([21, 31]), new Int16Array([21, 31])),
);
console.log(
  'false - strict shallow (different types)',
  strictShallowEqual(new Int8Array([21, 31]), new Int16Array([21, 31])),
);
