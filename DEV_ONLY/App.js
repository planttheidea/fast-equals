import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import decircularize from 'decircularize';

import fe, {deepEqual} from '../src';

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

console.group('map deep');
console.log(
  'true',
  fe.deep(new Map().set('foo', 'bar').set('bar', 'baz'), new Map().set('foo', 'bar').set('bar', 'baz'))
);
console.log(
  'false',
  fe.deep(new Map().set('foo', 'bar').set('bar', 'baz'), new Map().set('bar', 'baz').set('foo', 'bar'))
);
console.log(
  'true',
  fe.deep(new Map().set('foo', {bar: 'baz'}).set('bar', 'baz'), new Map().set('foo', {bar: 'baz'}).set('bar', 'baz'))
);
console.groupEnd('map');

console.group('map shallow deep');
console.log(
  'true',
  fe.shallow(new Map().set('foo', 'bar').set('bar', 'baz'), new Map().set('foo', 'bar').set('bar', 'baz'))
);
console.log(
  'false',
  fe.shallow(new Map().set('foo', 'bar').set('bar', 'baz'), new Map().set('bar', 'baz').set('foo', 'bar'))
);
console.log(
  'false',
  fe.shallow(new Map().set('foo', {bar: 'baz'}).set('bar', 'baz'), new Map().set('foo', {bar: 'baz'}).set('bar', 'baz'))
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

const isNotDeeplyOne = (comparator) => {
  return (a, b) => {
    if (typeof a === 'number' || typeof b === 'number') {
      return a !== 1 && b !== 1;
    }

    return Object.keys(a).every((key) => {
      return comparator(a[key], b[key]);
    });
  };
};

const doesNotEverEqualOne = fe.createCustom(isNotDeeplyOne);

console.log('true', doesNotEverEqualOne(object1, object2));
console.log('false', doesNotEverEqualOne(object3, object4));
console.groupEnd('custom');

console.group('circular object');

const isDeepEqualCircular = fe.createCustom((comparator) => {
  return (a, b) => {
    return comparator(decircularize(a), decircularize(b));
  };
});

function Obj() {
  this.me = this;
}

function Nested(y) {
  this.y = y;
}

console.log('false', fe.deep(new Obj(), new Obj()));

console.log('true', isDeepEqualCircular(new Obj(), new Obj()));
console.log('false', isDeepEqualCircular(new Obj(), {foo: 'baz'}));
console.groupEnd('circular object');

console.group('circular array');

const array = ['foo'];

array[1] = array;

console.log('true', isDeepEqualCircular(array, ['foo', array]));
console.log('false', isDeepEqualCircular(array, [array]));
console.groupEnd('circular array');

console.log(<div>foo</div>);
console.log(React.createElement('div', {children: 'foo'}));

console.log(
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
);
console.log(
  React.createElement('main', {
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
            style: {flex: '1 1 auto'}
          }),
          React.createElement('div', {
            children: 'Item',
            style: {flex: '1 1 0'}
          })
        ],
        style: {display: 'flex'}
      })
    ]
  })
);

class App extends PureComponent {
  element = null;

  render() {
    return (
      <div>
        <h1>App</h1>
      </div>
    );
  }
}

const renderApp = (container) => {
  render(<App />, container);
};

// document.body.style.backgroundColor = '#1d1d1d';
// document.body.style.color = '#d5d5d5';
document.body.style.margin = 0;
document.body.style.padding = 0;

const div = document.createElement('div');

div.id = 'app-container';

div.style.boxSizing = 'border-box';
div.style.height = '100vh';
div.style.overflow = 'auto';
div.style.padding = '15px';
div.style.width = '100vw';

renderApp(div);

document.body.appendChild(div);
