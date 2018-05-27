import React from 'react';
import decircularize from 'decircularize';

import fe, {deepEqual} from '../src';

document.body.style.backgroundColor = '#1d1d1d';
document.body.style.color = '#d5d5d5';
document.body.style.margin = 0;
document.body.style.padding = 0;

const div = document.createElement('div');

div.textContent = 'Check the console for details.';

document.body.appendChild(div);

console.group('string');
console.log('true', deepEqual('foo', 'foo'));
console.log('false', deepEqual('foo', 'bar'));
console.groupEnd('string');

console.group('number');
console.log('true', fe.deep(123, 123));
console.log('false', fe.deep(123, 234));
console.groupEnd('number');

console.group('zero');
console.log('true', fe.deep(0, 0));
console.log('true', fe.deep(0, -0));
console.groupEnd('zero');

console.group('Infinity');
console.log('true', fe.deep(Infinity, Infinity));
console.log('false', fe.deep(Infinity, -Infinity));
console.groupEnd('Infinity');

console.group('null');
console.log('true', fe.deep(null, null));
console.log('false', fe.deep(null, undefined));
console.groupEnd('null');

console.group('NaN');
console.log('true', fe.deep(NaN, NaN));
console.log('false', fe.deep(NaN, 123));
console.groupEnd('NaN');

console.group('array');
console.log('true', fe.deep([1, 2, 3], [1, 2, 3]));
console.log('false', fe.deep([1, 2, 3], [3, 2, 1]));
console.log('false', fe.deep([1, 2, 3], [1, 2, 3, 4]));
console.log('false', fe.deep({}, []));
console.groupEnd('array');

console.group('deep array');
console.log('true', fe.deep([{foo: 'bar'}, {bar: 'baz'}], [{foo: 'bar'}, {bar: 'baz'}]));
console.log('false', fe.deep([{foo: 'bar'}, {bar: 'baz'}], [{bar: 'baz'}, {foo: 'bar'}]));
console.groupEnd('deep array');

console.group('date');
console.log('true', fe.deep(new Date(), new Date()));
console.log('false', fe.deep(new Date(), new Date(2017, 0, 1)));
console.groupEnd('date');

console.group('regexp');
console.log('true', fe.deep(/foo/, /foo/));
console.log('false', fe.deep(/foo/, /foo/g));
console.groupEnd('regexp');

console.group('promise');
const promise = Promise.resolve('foo');

console.log(true, fe.deep({promise}, {promise}));
console.log(false, fe.deep({promise}, {promise: Promise.resolve('foo')}));
console.groupEnd('promise');

console.group('map deep');

console.log(
  'true',
  fe.deep(new Map().set('foo', 'bar').set('bar', {baz: 'baz'}), new Map().set('foo', 'bar').set('bar', {baz: 'baz'}))
);
console.log(
  'false',
  fe.deep(new Map().set('foo', 'bar').set('bar', {baz: 'baz'}), new Map().set('foo', 'bar').set('bar', {baz: 'quz'}))
);
console.log(
  'true',
  fe.deep(new Map().set('foo', {bar: 'baz'}).set('bar', 'baz'), new Map().set('bar', 'baz').set('foo', {bar: 'baz'}))
);
console.groupEnd('map');

console.group('map shallow deep');
console.log(
  'true',
  fe.shallow(new Map().set('foo', 'bar').set('bar', 'baz'), new Map().set('foo', 'bar').set('bar', 'baz'))
);
console.log(
  'false',
  fe.shallow(new Map().set('foo', {bar: 'baz'}).set('bar', 'baz'), new Map().set('foo', {bar: 'baz'}).set('bar', 'baz'))
);
console.log(
  'true',
  fe.shallow(new Map().set('foo', 'bar').set('bar', 'baz'), new Map().set('bar', 'baz').set('foo', 'bar'))
);

console.groupEnd('map shallow');

console.group('set');
console.log('true', fe.deep(new Set().add('bar'), new Set().add('bar')));
console.log('false', fe.deep(new Set().add('bar'), new Set().add('baz')));
console.groupEnd('set');

console.group('object');
console.log('true', fe.deep({some: {deeply: {nested: 'value'}}}, {some: {deeply: {nested: 'value'}}}));
console.log('false', fe.deep({some: {deeply: {nested: 'value'}}}, {some: {deeply: {nested: 'thing'}}}));
console.groupEnd('object');

console.group('custom');

const object1 = {
  zero: 0,
  deep: {
    two: 2,
    deeper: {
      three: 3
    }
  }
};

const object2 = {
  zero: 0,
  deep: {
    two: 2,
    deeper: {
      three: 3
    }
  }
};

const object3 = {
  zero: 0,
  deep: {
    two: 2,
    deeper: {
      one: 1
    }
  }
};

const object4 = {
  zero: 0,
  deep: {
    two: 2,
    deeper: {
      three: 3
    }
  }
};

const isNotDeeplyOne = (comparator) => (a, b) => {
  if (typeof a === 'number' || typeof b === 'number') {
    return a !== 1 && b !== 1;
  }

  return Object.keys(a).every((key) => comparator(a[key], b[key]));
};

const doesNotEverEqualOne = fe.createCustom(isNotDeeplyOne);

console.log('true', doesNotEverEqualOne(object1, object2));
console.log('false', doesNotEverEqualOne(object3, object4));
console.groupEnd('custom');

console.group('circular object');

const cache = new WeakSet();

const isDeepEqualCircular = fe.createCustom((comparator) => (a, b) => {
  if (cache.has(a) || cache.has(b)) {
    return cache.has(a) && cache.has(b);
  }

  if (typeof a === 'object') {
    cache.add(a);
  }

  if (typeof b === 'object') {
    cache.add(b);
  }

  return comparator(a, b);
});

function Circular(value) {
  this.me = {
    deeply: {
      nested: {
        reference: this
      }
    },
    value
  };
}

console.log('true', fe.circularDeep(new Circular('foo'), new Circular('foo')));
console.log('false', fe.circularDeep(new Circular('foo'), new Circular('bar')));
console.log('false', fe.circularDeep(new Circular('foo'), {foo: 'baz'}));

console.groupEnd('circular object');

console.group('circular array');

const array = ['foo'];

array[1] = array;

console.log('true', fe.circularShallow(array, ['foo', array]));
console.log('false', fe.circularShallow(array, [array]));

console.groupEnd('circular array');

console.group('react small');

console.log('true', fe.deep(<div>foo</div>, <div>foo</div>));
console.log('false', fe.deep(<div>foo</div>, <div>bar</div>));

console.groupEnd('react small');

console.group('react large');

console.log(
  'true',
  fe.deep(
    <main>
      <h1>Title</h1>

      <p>Content</p>
      <p>Content</p>
      <p>Content</p>
      <p>Content</p>

      <div style={{display: 'flex'}}>
        <div style={{flex: '1 1 auto'}}>Item</div>
        <div style={{flex: '1 1 0'}}>Item</div>
      </div>
    </main>,
    <main>
      <h1>Title</h1>

      <p>Content</p>
      <p>Content</p>
      <p>Content</p>
      <p>Content</p>

      <div style={{display: 'flex'}}>
        <div style={{flex: '1 1 auto'}}>Item</div>
        <div style={{flex: '1 1 0'}}>Item</div>
      </div>
    </main>
  )
);
console.log(
  'false',
  fe.deep(
    <main>
      <h1>Title</h1>

      <p>Content</p>
      <p>Content</p>
      <p>Content</p>
      <p>Content</p>

      <div style={{display: 'flex'}}>
        <div style={{flex: '1 1 auto'}}>Item</div>
        <div style={{flex: '1 1 0'}}>Item</div>
      </div>
    </main>,
    <main>
      <h1>Title</h1>

      <p>Content</p>
      <p>Content</p>
      <p>Content</p>
      <p>Other Content</p>

      <div style={{display: 'flex'}}>
        <div style={{flex: '1 1 auto'}}>Item</div>
        <div style={{flex: '1 1 0'}}>Item</div>
      </div>
    </main>
  )
);

console.groupEnd('react large');
